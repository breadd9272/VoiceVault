const fs = require('fs').promises;
const path = require('path');

class FileManager {
    constructor() {
        this.maxFileSize = 16 * 1024 * 1024; // 16MB limit for voice files
    }

    async ensureDirectoryExists(dirPath) {
        try {
            await fs.access(dirPath);
            return true;
        } catch (error) {
            try {
                await fs.mkdir(dirPath, { recursive: true });
                return true;
            } catch (createError) {
                console.error(`❌ Failed to create directory ${dirPath}:`, createError);
                return false;
            }
        }
    }

    async getFileStats(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return {
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                isFile: stats.isFile(),
                isDirectory: stats.isDirectory()
            };
        } catch (error) {
            return null;
        }
    }

    async isFileWithinSizeLimit(filePath) {
        const stats = await this.getFileStats(filePath);
        if (!stats) return false;
        return stats.size <= this.maxFileSize;
    }

    async getDirectorySize(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            let totalSize = 0;

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await this.getFileStats(filePath);
                if (stats && stats.isFile) {
                    totalSize += stats.size;
                }
            }

            return totalSize;
        } catch (error) {
            console.error(`❌ Error calculating directory size for ${dirPath}:`, error);
            return 0;
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async cleanupOldFiles(dirPath, maxAge = 30 * 24 * 60 * 60 * 1000) { // 30 days default
        try {
            const files = await fs.readdir(dirPath);
            const now = Date.now();
            let cleanedCount = 0;

            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await this.getFileStats(filePath);
                
                if (stats && stats.isFile) {
                    const age = now - stats.modified.getTime();
                    if (age > maxAge) {
                        try {
                            await fs.unlink(filePath);
                            cleanedCount++;
                            console.log(`🧹 Cleaned up old file: ${file}`);
                        } catch (deleteError) {
                            console.error(`❌ Failed to delete old file ${file}:`, deleteError);
                        }
                    }
                }
            }

            if (cleanedCount > 0) {
                console.log(`🧹 Cleaned up ${cleanedCount} old files from ${dirPath}`);
            }

            return cleanedCount;
        } catch (error) {
            console.error(`❌ Error during cleanup of ${dirPath}:`, error);
            return 0;
        }
    }

    async validateVoiceFile(buffer, mimetype) {
        // Basic validation for voice files
        if (!buffer || buffer.length === 0) {
            return { valid: false, error: 'Empty file' };
        }

        if (buffer.length > this.maxFileSize) {
            return { valid: false, error: `File too large (max ${this.formatFileSize(this.maxFileSize)})` };
        }

        // Check mimetype
        const validMimetypes = [
            'audio/ogg',
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/x-m4a'
        ];

        if (mimetype && !validMimetypes.some(valid => mimetype.includes(valid))) {
            return { valid: false, error: 'Invalid audio format' };
        }

        return { valid: true };
    }

    async getStorageInfo(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            const totalSize = await this.getDirectorySize(dirPath);
            
            return {
                fileCount: files.length,
                totalSize: totalSize,
                formattedSize: this.formatFileSize(totalSize)
            };
        } catch (error) {
            return {
                fileCount: 0,
                totalSize: 0,
                formattedSize: '0 Bytes'
            };
        }
    }
}

module.exports = FileManager;
