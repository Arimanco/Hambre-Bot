
const notice = document.getElementById('notice');
const homePage = document.getElementById('homePage');
const subPage = document.getElementById('subPage');
const breadcrumb = document.getElementById('breadcrumb');

const pages = {
  'Servidor': {
    description: 'Información general y administración de tu comunidad.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Información del servidor</h2>
          <p>Acá aparecerán los datos del servidor seleccionado.</p>
          <div class="settings-field">
            <label>Nombre del servidor</label>
            <input placeholder="Esperando conexión con Discord" disabled>
          </div>
        </article>
        <article class="settings-card">
          <h2>Administración</h2>
          <p>Herramientas generales de tu comunidad.</p>
          <div class="settings-toggle">
            <span>Conexión con Discord</span>
            <span class="muted">Pendiente</span>
          </div>
        </article>
      </div>`
  },

  'Bienvenida': {
    description: 'Personalizá los mensajes para los nuevos miembros.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Mensaje de bienvenida</h2>
          <p>Prepará el mensaje que recibirán los nuevos integrantes.</p>
          <div class="settings-toggle">
            <span>Activar bienvenida</span>
            <input type="checkbox" id="welcomeEnabled">
          </div>
          <div class="settings-field">
            <label>Canal de bienvenida</label>
            <select id="welcomeChannel">
              <option value="">Seleccioná un canal</option>
            </select>
          </div>
          <div class="settings-field">
            <label>Texto del mensaje</label>
            <textarea id="welcomeMessage" rows="4" placeholder="¡Bienvenido/a al servidor!"></textarea>
          </div>
          <button class="primary-btn" data-action="save-welcome">Guardar cambios</button>
        </article>
        <article class="settings-card">
          <h2>Vista previa</h2>
          <p id="welcomePreview">¡Bienvenido/a al servidor!</p>
          <p>Esta vista previa no envía mensajes reales.</p>
        </article>
      </div>`
  },

  'Autoroles': {
    description: 'Prepará los roles que recibirán automáticamente los miembros.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Asignación automática</h2>
          <p>Configurá el rol que se asignará al entrar.</p>
          <div class="settings-toggle">
            <span>Activar autoroles</span>
            <input type="checkbox" id="autorolesEnabled">
          </div>
          <div class="settings-field">
            <label>Rol para nuevos miembros</label>
            <select id="autoroleSelect">
              <option value="">Primero conectá Discord</option>
            </select>
          </div>
          <button class="primary-btn" data-action="save-autoroles">Guardar cambios</button>
        </article>
        <article class="settings-card">
          <h2>Importante</h2>
          <p>El bot necesitará permisos para administrar roles y su rol deberá estar por encima de los roles que asigne.</p>
        </article>
      </div>`
  },

  'Moderación': {
    description: 'Organizá las herramientas de protección de tu servidor.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Protección</h2>
          <div class="settings-toggle">
            <span>Filtro de spam</span>
            <input type="checkbox" id="spamFilter">
          </div>
          <div class="settings-toggle">
            <span>Protección contra enlaces</span>
            <input type="checkbox" id="linkFilter">
          </div>
          <div class="settings-toggle">
            <span>Control de menciones masivas</span>
            <input type="checkbox" id="mentionFilter">
          </div>
          <p>Estos controles son visuales hasta conectarlos con el sistema de moderación.</p>
          <button class="primary-btn" data-action="save-moderation">Guardar cambios</button>
        </article>
        <article class="settings-card">
          <h2>Acciones de moderación</h2>
          <p>En este espacio podremos integrar las herramientas de sanción que ya tiene Hambre Bot.</p>
        </article>
      </div>`
  },

  'Registros': {
    description: 'Prepará los canales donde se registrarán los eventos.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Canal de registros</h2>
          <p>Elegí dónde se publicarán los eventos del servidor.</p>
          <div class="settings-field">
            <label>Canal de auditoría</label>
            <select id="logChannel">
              <option value="">Primero conectá Discord</option>
            </select>
          </div>
          <button class="primary-btn" data-action="save-logs">Guardar cambios</button>
        </article>
        <article class="settings-card">
          <h2>Eventos registrados</h2>
          <div class="settings-toggle"><span>Entradas y salidas</span><input type="checkbox" checked></div>
          <div class="settings-toggle"><span>Mensajes eliminados</span><input type="checkbox" checked></div>
          <div class="settings-toggle"><span>Acciones de moderación</span><input type="checkbox" checked></div>
        </article>
      </div>`
  },

  'Estadísticas': {
    description: 'Consultá las estadísticas de actividad de tu comunidad.',
    content: `
      <div class="stats">
        <article class="card"><div class="stat-title">Miembros</div><div class="stat-number">—</div><div class="stat-foot">Pendiente de conexión</div></article>
        <article class="card"><div class="stat-title">Mensajes</div><div class="stat-number">—</div><div class="stat-foot">Pendiente de conexión</div></article>
        <article class="card"><div class="stat-title">Usuarios activos</div><div class="stat-number">—</div><div class="stat-foot">Pendiente de conexión</div></article>
        <article class="card"><div class="stat-title">Actividad</div><div class="stat-number">—</div><div class="stat-foot">Pendiente de conexión</div></article>
      </div>
      <article class="settings-card" style="margin-top:18px">
        <h2>Actividad del servidor</h2>
        <p>Cuando conectemos los eventos y la base de datos, podremos mostrar gráficos e información real.</p>
      </article>`
  },

  'Música': {
    description: 'Administrá la experiencia musical de Hambre Bot.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Reproductor</h2>
          <p>El estado de la música se mostrará cuando conectemos el reproductor del bot.</p>
          <div class="settings-field">
            <label>Reproduciendo</label>
            <input value="Sin información del reproductor" disabled>
          </div>
          <div class="music-controls">
            <button data-action="music-previous">⏮ Anterior</button>
            <button data-action="music-toggle">▶ Reproducir</button>
            <button data-action="music-next">⏭ Siguiente</button>
          </div>
        </article>
        <article class="settings-card">
          <h2>Opciones de música</h2>
          <div class="settings-field">
            <label>Volumen</label>
            <input type="range" id="musicVolume" min="0" max="100" value="50">
          </div>
          <div class="settings-toggle">
            <span>Reproducción en bucle</span>
            <input type="checkbox" id="musicLoop">
          </div>
          <p>Por ahora son controles visuales; todavía no modifican el reproductor real.</p>
        </article>
        <article class="settings-card">
          <h2>Cola de reproducción</h2>
          <p id="musicQueue">La cola aparecerá cuando conectemos el reproductor.</p>
        </article>
      </div>`
  },

  'Configuración': {
    description: 'Personalizá las preferencias generales del dashboard.',
    content: `
      <div class="settings-grid">
        <article class="settings-card">
          <h2>Preferencias generales</h2>
          <div class="settings-toggle">
            <span>Notificaciones del dashboard</span>
            <input type="checkbox" id="dashboardNotifications" checked>
          </div>
          <div class="settings-field">
            <label>Idioma</label>
            <select id="dashboardLanguage">
              <option value="es">Español</option>
            </select>
          </div>
          <button class="primary-btn" data-action="save-settings">Guardar preferencias</button>
        </article>
        <article class="settings-card">
          <h2>Conexiones</h2>
          <div class="settings-toggle">
            <span>Discord OAuth2</span>
            <span class="muted">Pendiente</span>
          </div>
          <div class="settings-toggle">
            <span>Base de datos</span>
            <span class="muted">Pendiente</span>
          </div>
          <p>La conexión se configurará más adelante en el backend.</p>
        </article>
      </div>`
  }
};

function showNotice(message) {
  notice.textContent = message;
  notice.style.display = 'block';
}

function openPage(name) {
  document.querySelectorAll('[data-page]').forEach(button => {
    button.classList.toggle('active', button.dataset.page === name);
  });

  breadcrumb.textContent = name;
  notice.style.display = 'none';

  if (name === 'Inicio') {
    homePage.hidden = false;
    subPage.hidden = true;
    return;
  }

  const page = pages[name];

  if (!page) return;

  homePage.hidden = true;
  subPage.hidden = false;

  subPage.innerHTML = `
    <section class="page-heading">
      <div>
        <div class="eyebrow">HAMBRE BOT · PANEL DE CONTROL</div>
        <h1>${name}</h1>
        <p class="muted">${page.description}</p>
      </div>
    </section>
    ${page.content}
    <div class="footer">Hambre Bot · Panel de administración</div>
  `;

  if (name === 'Bienvenida') {
    const message = document.getElementById('welcomeMessage');
    const preview = document.getElementById('welcomePreview');

    message?.addEventListener('input', () => {
      preview.textContent = message.value || '¡Bienvenido/a al servidor!';
    });
  }
}

document.querySelectorAll('[data-page]').forEach(button => {
  button.addEventListener('click', () => openPage(button.dataset.page));
});

document.querySelectorAll('[data-go]').forEach(button => {
  button.addEventListener('click', () => openPage(button.dataset.go));
});

document.getElementById('serverButton').addEventListener('click', () => {
  showNotice('El selector de servidores estará disponible cuando configuremos el inicio de sesión con Discord.');
});

document.getElementById('mainAction').addEventListener('click', () => {
  openPage('Servidor');
});

document.getElementById('heroAction').addEventListener('click', () => {
  openPage('Configuración');
});

subPage.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;

  const messages = {
    'save-welcome': 'La configuración de bienvenida todavía no se guarda en el servidor.',
    'save-autoroles': 'Los autoroles todavía no están conectados con Discord.',
    'save-moderation': 'Las opciones de moderación todavía no están conectadas.',
    'save-logs': 'Los registros todavía no están conectados con Discord.',
    'save-settings': 'Las preferencias todavía no se guardan de forma permanente.',
    'music-previous': 'El control Anterior todavía no está conectado al reproductor.',
    'music-toggle': 'El control de reproducción todavía no está conectado al reproductor.',
    'music-next': 'El control Siguiente todavía no está conectado al reproductor.'
  };

  showNotice(messages[button.dataset.action] || 'Esta función todavía no está conectada.');
});

openPage('Inicio');
