const path = require('path');

const config = {
    // Voice storage directory
    VOICES_DIR: path.join(process.cwd(), 'voices'),
    
    // Timeout for voice upload after !save voice command (2 minutes)
    VOICE_UPLOAD_TIMEOUT: 2 * 60 * 1000,
    
    // Maximum file size for voice messages (16MB)
    MAX_VOICE_FILE_SIZE: 16 * 1024 * 1024,
    
    // Supported voice file extensions
    SUPPORTED_VOICE_EXTENSIONS: ['.ogg', '.mp3', '.wav', '.m4a'],
    
    // Supported voice mimetypes
    SUPPORTED_VOICE_MIMETYPES: [
        'audio/ogg',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/m4a',
        'audio/x-m4a',
        'audio/ogg; codecs=opus'
    ],
    
    // Bot settings
    BOT_NAME: 'WhatsApp Voice Bot',
    CLIENT_ID: 'whatsapp-voice-bot',
    
    // File cleanup settings
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 hours
    MAX_FILE_AGE: 30 * 24 * 60 * 60 * 1000, // 30 days
    
    // Rate limiting
    MAX_COMMANDS_PER_MINUTE: 30,
    
    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
    
    // Commands
    COMMANDS: {
        SAVE_VOICE: '!save voice',
        LIST_VOICES: '!list voices',
        DELETE_VOICE: '!delete voice',
        HELP: '!help'
    }
};

module.exports = config;
