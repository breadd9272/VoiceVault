const fs = require('fs').promises;
const path = require('path');
const { MessageMedia } = require('whatsapp-web.js');
const config = require('../config/config');

class VoiceHandler {
    constructor() {
        this.pendingVoices = new Map(); // Store pending voice saves
        this.ensureVoicesDirectory();
    }

    async ensureVoicesDirectory() {
        try {
            await fs.access(config.VOICES_DIR);
        } catch (error) {
            // Directory doesn't exist, create it
            try {
                await fs.mkdir(config.VOICES_DIR, { recursive: true });
                console.log(`📁 Created voices directory: ${config.VOICES_DIR}`);
            } catch (createError) {
                console.error('❌ Failed to create voices directory:', createError);
            }
        }
    }

    setPendingVoice(voiceName) {
        this.pendingVoices.set(voiceName, Date.now());
    }

    isPendingVoice(voiceName) {
        return this.pendingVoices.has(voiceName);
    }

    removePendingVoice(voiceName) {
        this.pendingVoices.delete(voiceName);
    }

    getAnyPendingVoice() {
        // Return the first pending voice name (assuming one at a time)
        const entries = Array.from(this.pendingVoices.entries());
        return entries.length > 0 ? entries[0][0] : null;
    }

    async saveVoice(voiceName, mediaData) {
        try {
            // Validate voice name
            if (!this.isValidVoiceName(voiceName)) {
                console.error(`❌ Invalid voice name: ${voiceName}`);
                return false;
            }

            // Determine file extension based on media mimetype
            let extension = '.ogg'; // Default for WhatsApp voice messages
            if (mediaData.mimetype) {
                if (mediaData.mimetype.includes('ogg')) {
                    extension = '.ogg';
                } else if (mediaData.mimetype.includes('mp3')) {
                    extension = '.mp3';
                } else if (mediaData.mimetype.includes('wav')) {
                    extension = '.wav';
                } else if (mediaData.mimetype.includes('m4a')) {
                    extension = '.m4a';
                }
            }

            const fileName = `${voiceName}${extension}`;
            const filePath = path.join(config.VOICES_DIR, fileName);

            // Convert base64 data to buffer
            const buffer = Buffer.from(mediaData.data, 'base64');

            // Save the voice file
            await fs.writeFile(filePath, buffer);

            console.log(`💾 Voice saved: ${fileName} (${buffer.length} bytes)`);
            return true;
        } catch (error) {
            console.error(`❌ Error saving voice ${voiceName}:`, error);
            return false;
        }
    }

    async getVoice(voiceName) {
        try {
            // Validate voice name
            if (!this.isValidVoiceName(voiceName)) {
                return null;
            }

            // Try different extensions
            const extensions = ['.ogg', '.mp3', '.wav', '.m4a'];
            
            for (const ext of extensions) {
                const fileName = `${voiceName}${ext}`;
                const filePath = path.join(config.VOICES_DIR, fileName);
                
                try {
                    await fs.access(filePath);
                    
                    // File exists, create MessageMedia object
                    const media = MessageMedia.fromFilePath(filePath);
                    return media;
                } catch (accessError) {
                    // File doesn't exist with this extension, try next
                    continue;
                }
            }

            // No file found with any extension
            return null;
        } catch (error) {
            console.error(`❌ Error getting voice ${voiceName}:`, error);
            return null;
        }
    }

    async listVoices() {
        try {
            const files = await fs.readdir(config.VOICES_DIR);
            
            // Filter voice files and remove extensions
            const voiceFiles = files
                .filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return ['.ogg', '.mp3', '.wav', '.m4a'].includes(ext);
                })
                .map(file => path.parse(file).name) // Remove extension
                .filter((name, index, arr) => arr.indexOf(name) === index) // Remove duplicates
                .sort();

            return voiceFiles;
        } catch (error) {
            console.error('❌ Error listing voices:', error);
            return [];
        }
    }

    async deleteVoice(voiceName) {
        try {
            // Validate voice name
            if (!this.isValidVoiceName(voiceName)) {
                return false;
            }

            // Try different extensions
            const extensions = ['.ogg', '.mp3', '.wav', '.m4a'];
            let deleted = false;
            
            for (const ext of extensions) {
                const fileName = `${voiceName}${ext}`;
                const filePath = path.join(config.VOICES_DIR, fileName);
                
                try {
                    await fs.access(filePath);
                    await fs.unlink(filePath);
                    deleted = true;
                    console.log(`🗑️ Deleted voice file: ${fileName}`);
                } catch (error) {
                    // File doesn't exist with this extension, continue
                    continue;
                }
            }

            return deleted;
        } catch (error) {
            console.error(`❌ Error deleting voice ${voiceName}:`, error);
            return false;
        }
    }

    isValidVoiceName(voiceName) {
        // Check if voice name is valid (no special characters, reasonable length)
        if (!voiceName || typeof voiceName !== 'string') {
            return false;
        }

        // Remove leading/trailing whitespace
        voiceName = voiceName.trim();

        // Check length
        if (voiceName.length === 0 || voiceName.length > 50) {
            return false;
        }

        // Check for invalid characters (path separators, special characters)
        const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
        if (invalidChars.test(voiceName)) {
            return false;
        }

        // Check for reserved names
        const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'com2', 'com3', 'com4', 'com5', 'com6', 'com7', 'com8', 'com9', 'lpt1', 'lpt2', 'lpt3', 'lpt4', 'lpt5', 'lpt6', 'lpt7', 'lpt8', 'lpt9'];
        if (reservedNames.includes(voiceName.toLowerCase())) {
            return false;
        }

        return true;
    }

    // Clean up old pending voices (called periodically)
    cleanupPendingVoices() {
        const now = Date.now();
        for (const [voiceName, timestamp] of this.pendingVoices.entries()) {
            if (now - timestamp > config.VOICE_UPLOAD_TIMEOUT) {
                this.pendingVoices.delete(voiceName);
                console.log(`🧹 Cleaned up expired pending voice: ${voiceName}`);
            }
        }
    }
}

module.exports = VoiceHandler;
