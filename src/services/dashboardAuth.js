
import { randomBytes } from 'node:crypto';

const sessions = new Map();
const pendingStates = new Map();

const SESSION_COOKIE = 'hambre_dashboard_session';
const STATE_COOKIE = 'hambre_dashboard_oauth_state';
const SESSION_TTL = 8 * 60 * 60 * 1000;
const STATE_TTL = 10 * 60 * 1000;

function readCookies(req) {
  const result = {};

  for (const item of (req.headers.cookie || '').split(';')) {
    const separator = item.indexOf('=');
    if (separator < 0) continue;

    const name = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();

    try {
      result[name] = decodeURIComponent(value);
    } catch {
      // Ignore malformed cookies.
    }
  }

  return result;
}

function setCookie(res, name, value, options = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    `Path=${options.path || '/'}`,
    'HttpOnly',
    'Secure',
    'SameSite=Lax',
  ];

  if (options.maxAge !== undefined) {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  res.append('Set-Cookie', parts.join('; '));
}

function clearCookie(res, name, path = '/') {
  setCookie(res, name, '', { path, maxAge: 0 });
}

function createId() {
  return randomBytes(32).toString('hex');
}

function getSession(req) {
  const cookies = readCookies(req);
  const id = cookies[SESSION_COOKIE];
  if (!id) return null;

  const session = sessions.get(id);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }

  session.expiresAt = Date.now() + SESSION_TTL;
  return session;
}

function requireSession(req, res, next) {
  const session = getSession(req);

  if (!session) {
    return res.status(401).json({ error: 'Iniciá sesión con Discord.' });
  }

  req.dashboardSession = session;
  next();
}

export function setupDashboardAuth(app, bot) {
  app.get('/auth/discord', (req, res) => {
    const clientId = bot.config.bot.clientId;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(503).send(
        'Falta configurar CLIENT_ID, DISCORD_CLIENT_SECRET o DISCORD_REDIRECT_URI en Railway.'
      );
    }

    const state = createId();
    pendingStates.set(state, Date.now() + STATE_TTL);

    setCookie(res, STATE_COOKIE, state, {
      path: '/auth/discord',
      maxAge: Math.floor(STATE_TTL / 1000),
    });

    const authorizeUrl = new URL('https://discord.com/oauth2/authorize');
    authorizeUrl.searchParams.set('client_id', clientId);
    authorizeUrl.searchParams.set('redirect_uri', redirectUri);
    authorizeUrl.searchParams.set('response_type', 'code');
    authorizeUrl.searchParams.set('scope', 'identify guilds');
    authorizeUrl.searchParams.set('state', state);

    res.redirect(authorizeUrl.toString());
  });

  app.get('/auth/discord/callback', async (req, res) => {
    const { code, state, error } = req.query;
    const cookies = readCookies(req);
    const cookieState = cookies[STATE_COOKIE];

    clearCookie(res, STATE_COOKIE, '/auth/discord');

    if (error) {
      return res.redirect('/dashboard/?auth_error=cancelled');
    }

    const expiresAt = typeof state === 'string'
      ? pendingStates.get(state)
      : undefined;

    if (
      typeof state !== 'string' ||
      !cookieState ||
      state !== cookieState ||
      !expiresAt ||
      expiresAt <= Date.now()
    ) {
      if (typeof state === 'string') pendingStates.delete(state);
      return res.status(400).send('La solicitud de inicio de sesión venció o no es válida. Volvé a intentarlo.');
    }

    pendingStates.delete(state);

    if (typeof code !== 'string') {
      return res.status(400).send('Discord no devolvió el código de autorización.');
    }

    try {
      const clientId = bot.config.bot.clientId;
      const clientSecret = process.env.DISCORD_CLIENT_SECRET;
      const redirectUri = process.env.DISCORD_REDIRECT_URI;

      const tokenResponse = await fetch('https://discord.com/api/v10/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Discord rechazó el intercambio del código OAuth2.');
      }

      const tokenData = await tokenResponse.json();

      const userResponse = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userResponse.ok) {
        throw new Error('No se pudo verificar el usuario de Discord.');
      }

      const user = await userResponse.json();
      const sessionId = createId();

      sessions.set(sessionId, {
        user: {
          id: user.id,
          username: user.username,
          globalName: user.global_name || user.username,
          avatar: user.avatar || null,
        },
        accessToken: tokenData.access_token,
        expiresAt: Date.now() + SESSION_TTL,
      });

      setCookie(res, SESSION_COOKIE, sessionId, {
        maxAge: Math.floor(SESSION_TTL / 1000),
      });

      return res.redirect('/dashboard/?login=success');
    } catch (err) {
      console.error('[Dashboard OAuth2]', err.message);
      return res.redirect('/dashboard/?auth_error=failed');
    }
  });

  app.get('/api/dashboard/me', requireSession, (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({ user: req.dashboardSession.user });
  });

  app.get('/api/dashboard/guilds', requireSession, async (req, res) => {
    try {
      const response = await fetch('https://discord.com/api/v10/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${req.dashboardSession.accessToken}`,
        },
      });

      if (!response.ok) {
        return res.status(502).json({ error: 'No se pudieron consultar tus servidores de Discord.' });
      }

      const userGuilds = await response.json();

      const manageableGuilds = userGuilds
        .filter((guild) => {
          const permissions = BigInt(guild.permissions || '0');
          const canManage = (permissions & 0x8n) !== 0n ||
            (permissions & 0x20n) !== 0n;

          return canManage && bot.guilds.cache.has(guild.id);
        })
        .map((guild) => ({
          id: guild.id,
          name: guild.name,
          icon: guild.icon,
        }));

      res.set('Cache-Control', 'no-store');
      res.json({ guilds: manageableGuilds });
    } catch (err) {
      console.error('[Dashboard guilds]', err.message);
      res.status(500).json({ error: 'No se pudieron consultar los servidores.' });
    }
  });

  app.post('/api/dashboard/logout', requireSession, (req, res) => {
    const cookies = readCookies(req);
    sessions.delete(cookies[SESSION_COOKIE]);
    clearCookie(res, SESSION_COOKIE);
    res.json({ ok: true });
  });

  // Expire abandoned OAuth states and inactive sessions.
  setInterval(() => {
    const now = Date.now();

    for (const [state, expiresAt] of pendingStates) {
      if (expiresAt <= now) pendingStates.delete(state);
    }

    for (const [id, session] of sessions) {
      if (session.expiresAt <= now) sessions.delete(id);
    }
  }, 60_000).unref();
}
