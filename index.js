const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const VoiceHandler = require('./commands/voiceHandler');
const config = require('./config/config');

class WhatsAppBot {
    constructor() {
        // Initialize WhatsApp client with local authentication
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "whatsapp-voice-bot"
            }),
            puppeteer: {
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--single-process',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ],
                executablePath: '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium'
            }
        });

        this.voiceHandler = new VoiceHandler();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Display QR code for authentication
        this.client.on('qr', (qr) => {
            console.log('\n=== WhatsApp Voice Bot ===');
            console.log('Scan the QR code below with your WhatsApp mobile app:');
            console.log('');
            qrcode.generate(qr, { small: true });
            console.log('');
            console.log('Waiting for authentication...');
        });

        // Bot ready event
        this.client.on('ready', () => {
            console.log('\n✅ WhatsApp Voice Bot is ready!');
            console.log('Commands available:');
            console.log('- !save voice [name] - Save a voice message');
            console.log('- ![name] - Play saved voice message');
            console.log('- !list voices - List all saved voices');
            console.log('- !delete voice [name] - Delete a saved voice');
            console.log('- !spam [message] [amount] - Send spam messages (5 per second)');
            console.log('');
        });

        // Handle incoming messages
        this.client.on('message', async (message) => {
            try {
                await this.handleMessage(message);
            } catch (error) {
                console.error('Error handling message:', error);
                await message.reply('❌ An error occurred while processing your message.');
            }
        });

        // Handle authentication success
        this.client.on('authenticated', () => {
            console.log('✅ Authentication successful!');
        });

        // Handle authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
        });

        // Handle disconnection
        this.client.on('disconnected', (reason) => {
            console.log('⚠️ Client was logged out:', reason);
        });
    }

    async handleMessage(message) {
        const content = message.body.trim();
        const isFromMe = message.fromMe;

        // Only process messages from the bot owner (self)
        if (!isFromMe) {
            return;
        }

        // Log received command
        console.log(`📝 Command received: ${content}`);

        // Parse and handle commands
        if (content.startsWith('!save voice ')) {
            await this.handleSaveVoiceCommand(message, content);
        } else if (content.startsWith('!spam ')) {
            await this.handleSpamCommand(message, content);
        } else if (content.startsWith('!') && !content.includes(' ')) {
            await this.handlePlayVoiceCommand(message, content);
        } else if (content === '!list voices') {
            await this.handleListVoicesCommand(message);
        } else if (content.startsWith('!delete voice ')) {
            await this.handleDeleteVoiceCommand(message, content);
        }
    }

    async handleSaveVoiceCommand(message, content) {
        const voiceName = content.replace('!save voice ', '').trim();
        
        if (!voiceName) {
            await message.reply('❌ Please provide a name for the voice. Example: !save voice hello');
            return;
        }

        if (voiceName.includes('/') || voiceName.includes('\\')) {
            await message.reply('❌ Voice name cannot contain path separators.');
            return;
        }

        // Check if already waiting for a voice upload for this name
        if (this.voiceHandler.isPendingVoice(voiceName)) {
            await message.reply(`⚠️ Already waiting for voice upload for "${voiceName}". Please send the voice message now.`);
            return;
        }

        // Set pending voice save
        this.voiceHandler.setPendingVoice(voiceName);
        await message.reply(`🎤 Ready to save voice as "${voiceName}". Please send the voice message now.`);
        
        console.log(`🎤 Waiting for voice upload for: ${voiceName}`);

        // Set timeout for voice upload (2 minutes)
        setTimeout(() => {
            if (this.voiceHandler.isPendingVoice(voiceName)) {
                this.voiceHandler.removePendingVoice(voiceName);
                console.log(`⏰ Voice upload timeout for: ${voiceName}`);
            }
        }, config.VOICE_UPLOAD_TIMEOUT);
    }

    async handlePlayVoiceCommand(message, content) {
        const voiceName = content.substring(1); // Remove the ! prefix
        
        if (!voiceName) {
            return;
        }

        try {
            const voiceMedia = await this.voiceHandler.getVoice(voiceName);
            if (voiceMedia) {
                await message.reply(voiceMedia);
                console.log(`🔊 Played voice: ${voiceName}`);
            } else {
                await message.reply(`❌ Voice "${voiceName}" not found. Use !list voices to see available voices.`);
            }
        } catch (error) {
            console.error(`Error playing voice ${voiceName}:`, error);
            await message.reply(`❌ Error playing voice "${voiceName}".`);
        }
    }

    async handleListVoicesCommand(message) {
        try {
            const voices = await this.voiceHandler.listVoices();
            if (voices.length === 0) {
                await message.reply('📝 No voices saved yet. Use !save voice [name] to save a voice.');
            } else {
                const voiceList = voices.map(voice => `• ${voice}`).join('\n');
                await message.reply(`🎵 Saved voices:\n${voiceList}\n\nUse ![name] to play a voice.`);
            }
        } catch (error) {
            console.error('Error listing voices:', error);
            await message.reply('❌ Error retrieving voice list.');
        }
    }

    async handleDeleteVoiceCommand(message, content) {
        const voiceName = content.replace('!delete voice ', '').trim();
        
        if (!voiceName) {
            await message.reply('❌ Please provide the name of the voice to delete. Example: !delete voice hello');
            return;
        }

        try {
            const deleted = await this.voiceHandler.deleteVoice(voiceName);
            if (deleted) {
                await message.reply(`✅ Voice "${voiceName}" deleted successfully.`);
                console.log(`🗑️ Deleted voice: ${voiceName}`);
            } else {
                await message.reply(`❌ Voice "${voiceName}" not found.`);
            }
        } catch (error) {
            console.error(`Error deleting voice ${voiceName}:`, error);
            await message.reply(`❌ Error deleting voice "${voiceName}".`);
        }
    }

    async handleSpamCommand(message, content) {
        // Parse command: !spam [message] [amount]
        const parts = content.replace('!spam ', '').trim().split(' ');
        
        if (parts.length < 2) {
            await message.reply('❌ Usage: !spam [message] [amount]\nExample: !spam hello 10');
            return;
        }

        const amount = parseInt(parts[parts.length - 1]);
        const messageText = parts.slice(0, -1).join(' ');

        if (isNaN(amount) || amount <= 0) {
            await message.reply('❌ Amount must be a positive number');
            return;
        }

        if (amount > 100) {
            await message.reply('❌ Maximum 100 messages allowed');
            return;
        }

        if (!messageText.trim()) {
            await message.reply('❌ Please provide a message to spam');
            return;
        }

        try {
            await message.reply(`🚀 Starting spam: "${messageText}" x ${amount} times`);
            console.log(`📢 Starting spam: "${messageText}" x ${amount} times`);

            const chat = await message.getChat();
            const delay = 200; // 200ms delay = 5 messages per second

            for (let i = 1; i <= amount; i++) {
                await chat.sendMessage(`${messageText}`);
                console.log(`📤 Spam message ${i}/${amount} sent`);
                
                // Add delay between messages (5 per second)
                if (i < amount) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }

            console.log(`✅ Spam completed: ${amount} messages sent`);
        } catch (error) {
            console.error('Error during spam:', error);
            await message.reply(`❌ Error during spam: ${error.message}`);
        }
    }

    async start() {
        try {
            console.log('🚀 Starting WhatsApp Voice Bot...');
            await this.client.initialize();
        } catch (error) {
            console.error('❌ Failed to start bot:', error);
            process.exit(1);
        }
    }
}

// Handle voice messages for pending saves
const bot = new WhatsAppBot();

// Override message handler to include voice message processing
const originalHandleMessage = bot.handleMessage.bind(bot);
bot.handleMessage = async function(message) {
    // Check if this is a voice message and we're expecting one
    if (message.hasMedia && message.type === 'ptt') { // ptt = push to talk (voice message)
        const pendingVoice = bot.voiceHandler.getAnyPendingVoice();
        if (pendingVoice && message.fromMe) {
            try {
                const media = await message.downloadMedia();
                const success = await bot.voiceHandler.saveVoice(pendingVoice, media);
                
                if (success) {
                    await message.reply(`✅ Voice saved as "${pendingVoice}". Use !${pendingVoice} to play it.`);
                    console.log(`💾 Voice saved: ${pendingVoice}`);
                } else {
                    await message.reply(`❌ Failed to save voice "${pendingVoice}".`);
                }
                
                bot.voiceHandler.removePendingVoice(pendingVoice);
            } catch (error) {
                console.error('Error saving voice:', error);
                await message.reply(`❌ Error saving voice "${pendingVoice}".`);
                bot.voiceHandler.removePendingVoice(pendingVoice);
            }
            return;
        }
    }
    
    // Handle regular text commands
    await originalHandleMessage(message);
};

// Start the bot
bot.start();

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down WhatsApp Voice Bot...');
    bot.client.destroy();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down WhatsApp Voice Bot...');
    bot.client.destroy();
    process.exit(0);
});
