import dotenv from 'dotenv';
dotenv.config();
const config = {
    botName: process.env.BOT_NAME || "MyBot",
    socketPort: process.env.BOT_SOCKET_PORT || 3000,

    ffmpeg: {
        ffmpegPath: process.env.FFMPEG_PATH || "/usr/bin/ffmpeg",
        ffprobePath: process.env.FFPROBE_PATH || "/usr/bin/ffprobe",
    },

    googleSheet: {
        sheetId: process.env.GOOGLE_SHEET_ID || "",
    },

    language: {
        detectLanguages: process.env.LANGUAGE_DETECTED ? process.env.LANGUAGE_DETECTED.split(',') : [],
        addChineseWeight: process.env.LANGUAGE_ADD_CHINESE_WEIGHT === 'true' || false,
        readMessageSpeed: process.env.LANGUAGE_READ_SPEED ? JSON.parse(process.env.LANGUAGE_READ_SPEED):{},
        defaultChinese: process.env.LANGUAGE_DEFAULT_CHINESE || "zh-yue",
    },

    readMessage: {
        enabled: process.env.READ_MESSAGE_ENABLED === 'true' || false,
        readUrl: process.env.READ_MESSAGE_URL === 'true' || false,
        maxLength: process.env.READ_MESSAGE_MAX_LENGTH ? parseInt(process.env.READ_MESSAGE_MAX_LENGTH) : 300,
    },

    twitch: {
        channels: process.env.TWITCH_CHANNELS ? process.env.TWITCH_CHANNELS.split(',')  : [],
        ignoreChannels: process.env.TWITCH_IGNORE_CHANNELS ? process.env.TWITCH_IGNORE_CHANNELS.split(',') : [],
        enableRestreamBot: process.env.TWITCH_RESTREAM_BOT_CHANNEL === 'true' || false,
        restreamBotChannel: process.env.TWITCH_RESTREAM_BOT_CHANNEL || "",
        admins: process.env.TWITCH_ADMIN_CHANNELS ? process.env.TWITCH_ADMIN_CHANNELS.split(',') : [],
    },

    youtube: {
        enabled: process.env.YOUTUBE_ENABLED === 'true' || false,
        channelId: process.env.YOUTUBE_CHANNEL_ID || "",
        ignoreChannels: process.env.YOUTUBE_IGNORE_CHANNEL_IDS ? process.env.YOUTUBE_IGNORE_CHANNEL_IDS.split(',') : [],
        admins: process.env.YOUTUBE_ADMIN_CHANNEL_IDS ? process.env.YOUTUBE_ADMIN_CHANNEL_IDS.split(',') : [],
    }
}
export default config;