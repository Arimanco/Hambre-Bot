import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createEmbed } from '../../utils/embeds.js';
import { getPaginationRow } from '../../utils/components.js';

const QUEUE_PAGE_SIZE = 10;

export const MUSIC_BUTTON_IDS = {
    PAUSE: 'music_pause',
    RESUME: 'music_resume',
    SKIP: 'music_skip',
    STOP: 'music_stop',
    SHUFFLE: 'music_shuffle',
    LOOP: 'music_loop',
    VOL_DOWN: 'music_vol_down',
    VOL_UP: 'music_vol_up',
    QUEUE: 'music_queue',
    QUEUE_FIRST: 'music_queue_first',
    QUEUE_PREV: 'music_queue_prev',
    QUEUE_NEXT: 'music_queue_next',
    QUEUE_LAST: 'music_queue_last',
};

export function formatDuration(ms) {
    if (!ms || Number.isNaN(ms)) {
  
export function formatDuration(ms) {
    if (ms == null || !Number.isFinite(Number(ms))) {
        return 'Live';
    }

    const totalSeconds = Math.floor(Math.max(0, Number(ms)) / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}


function getTrackArtwork(track) {
    return track?.info?.artworkUrl || track?.info?.thumbnail || null;
}

function getLoopLabel(loop) {
    switch (loop) {
        case 'track':
            return 'Track';
        case 'queue':
            return 'Queue';
        default:
            return 'Off';
    }
}


export function buildNowPlayingEmbed(track, player, guildData) {
    const info = track?.info || {};
    const requester = info.requester;
    const requesterLabel =
        requester?.username || requester?.tag || 'Desconocido';

    const length = Number(info.length) || 0;
    const position = Math.max(0, Number(player?.position) || 0);
    const isLive = Boolean(info.isStream) || length <= 0;

    const safePosition = length
        ? Math.min(position, length)
        : position;

    const progress = length > 0
        ? Math.min(1, safePosition / length)
        : 0;

    const barSize = 12;
    const filled = Math.round(progress * barSize);

    const progressBar = isLive
        ? 'EN VIVO'
        : `${'━'.repeat(filled)}${'─'.repeat(barSize - filled)}`;

    const durationText = isLive
        ? 'EN VIVO'
        : `${formatDuration(safePosition)} / ${formatDuration(length)}`;

    const artwork = getTrackArtwork(track);
    const title = info.title || 'Canción desconocida';
    const artist = info.author || 'Artista desconocido';

    return createEmbed({
        title: 'Hambre Music',
        description: [
            `**${title}**`,
            `*${artist}*`,
            '',
            `\`${progressBar}\``,
            `\`${durationText}\``,
        ].join('\n'),
        color: '#8B5CF6',
        url: info.uri?.startsWith('https://') ? info.uri : null,
        image: artwork,
        fields: [
            {
                name: 'Solicitó',
                value: requesterLabel,
                inline: true,
            },
            {
                name: 'Volumen',
                value: `${guildData?.volume ?? 70}%`,
                inline: true,
            },
            {
                name: 'Repetición',
                value: getLoopLabel(guildData?.loop),
                inline: true,
            },
            {
                name: 'En cola',
                value: `${player?.queue?.length || 0} canción(es)`,
                inline: true,
            },
            {
                name: 'Estado',
                value: player?.paused ? 'Pausado' : 'Reproduciendo',
                inline: true,
            },
        ],
    });
}


export function buildQueueEmbed(queue, currentTrack, page = 0) {
    const totalTracks = queue?.length || 0;
    const totalPages = Math.max(1, Math.ceil(totalTracks / QUEUE_PAGE_SIZE));
    const safePage = Math.min(Math.max(page, 0), totalPages - 1);
    const start = safePage * QUEUE_PAGE_SIZE;
    const slice = queue?.slice(start, start + QUEUE_PAGE_SIZE) || [];

    let description = '';
    if (currentTrack) {
        description += `**Now Playing**\n${currentTrack.info?.title || 'Unknown'} — ${currentTrack.info?.author || 'Unknown'}\n\n`;
    }

    if (slice.length === 0) {
        description += 'The queue is empty.';
    } else {
        description += slice
            .map((track, index) => {
                const num = start + index + 1;
                return `${num}. ${track.info?.title || 'Unknown'} — ${track.info?.author || 'Unknown'}`;
            })
            .join('\n');
    }

    return createEmbed({
        title: 'Music Queue',
        description: description.substring(0, 4096),
        color: 'info',
        footer: `Page ${safePage + 1} of ${totalPages} • ${totalTracks} queued`,
    });
}

<CodeBlock language="javascript" editable>
export function buildPlayerButtonRows(player, guildData) {
    const paused = Boolean(player?.paused);

const row1 = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.PAUSE)
.setLabel('Pausar')
.setStyle(ButtonStyle.Primary)
.setEmoji('⏸️')
.setDisabled(paused),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.RESUME)
.setLabel('Seguir')
.setStyle(ButtonStyle.Success)
.setEmoji('▶️')
.setDisabled(!paused),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.SKIP)
.setLabel('Siguiente')
.setStyle(ButtonStyle.Secondary)
.setEmoji('⏭️'),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.STOP)
.setLabel('Detener')
.setStyle(ButtonStyle.Danger)
.setEmoji('⏹️'),
);
const row2 = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.SHUFFLE)
.setLabel('Aleatorio')
.setStyle(
guildData?.shuffle
? ButtonStyle.Success
: ButtonStyle.Secondary
)
.setEmoji('🔀'),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.LOOP)
.setLabel('Repetir')
.setStyle(
guildData?.loop !== 'none'
? ButtonStyle.Success
: ButtonStyle.Secondary
)
.setEmoji('🔁'),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.VOL_DOWN)
.setLabel('Vol -')
.setStyle(ButtonStyle.Secondary)
.setEmoji('🔉'),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.VOL_UP)
.setLabel('Vol +')
.setStyle(ButtonStyle.Secondary)
.setEmoji('🔊'),
new ButtonBuilder()
.setCustomId(MUSIC_BUTTON_IDS.QUEUE)
.setLabel('Cola')
.setStyle(ButtonStyle.Secondary)
.setEmoji('📋'),
);
return [row1, row2];
}
</CodeBlock>

export function buildQueuePaginationRow(page, totalPages) {
    return getPaginationRow('music_queue', page + 1, totalPages);
}

export function getQueuePageSize() {
    return QUEUE_PAGE_SIZE;
}
