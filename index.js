const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const VoiceHandler = require('./commands/voiceHandler');
const config = require('./config/config');

class WhatsAppBot {
    constructor() {
        // Initialize WhatsApp client with local authentication
        // Detect if running in Termux environment
        const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
        const isAndroid = process.platform === 'android' || isTermux;
        
        let puppeteerConfig = {
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
                '--disable-features=VizDisplayCompositor',
                '--force-device-scale-factor=1',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-extensions',
                '--no-default-browser-check',
                '--disable-plugins',
                '--disable-translate',
                '--disable-sync',
                '--disable-component-extensions-with-background-pages',
                '--user-data-dir=' + process.cwd() + '/.wwebjs_auth/chromium-persistent'
            ]
        };

        // Add Termux/Android specific configurations
        if (isTermux || isAndroid) {
            console.log('📱 Detected Termux/Android environment');
            puppeteerConfig.args.push(
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-features=TranslateUI',
                '--disable-ipc-flooding-protection',
                '--disable-background-media-suspend'
            );
            
            // Try to find Chromium in Termux
            const fs = require('fs');
            const termuxChromiumPaths = [
                process.env.PREFIX + '/bin/chromium',
                process.env.PREFIX + '/bin/chromium-browser',
                '/data/data/com.termux/files/usr/bin/chromium'
            ];
            
            for (const chromiumPath of termuxChromiumPaths) {
                try {
                    if (fs.existsSync(chromiumPath)) {
                        puppeteerConfig.executablePath = chromiumPath;
                        console.log(`📱 Using Termux Chromium: ${chromiumPath}`);
                        break;
                    }
                } catch (e) {
                    // Continue to next path
                }
            }
            
            if (!puppeteerConfig.executablePath) {
                console.log('⚠️  Chromium not found in Termux. Install with: pkg install chromium');
            }
        } else {
            // Non-Termux environment (like Replit)
            puppeteerConfig.executablePath = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';
        }

        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "whatsapp-voice-bot",
                dataPath: "./.wwebjs_auth"
            }),
            puppeteer: puppeteerConfig,
            // Persistent session options
            session: "whatsapp-voice-bot-session",
            restartOnAuthFail: false
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
            console.log('🔍 Debugging mode enabled - all messages will show detailed logs');
        });

        // Handle ALL messages for debugging
        this.client.on('message_create', async (message) => {
            console.log('🔔 Message created event received!');
            console.log('📝 Content:', message.body || 'No body');
            console.log('👤 From me:', message.fromMe);
            console.log('📱 Message type:', message.type);
            
            try {
                await this.handleMessage(message);
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        // Handle incoming messages (legacy)
        this.client.on('message', async (message) => {
            console.log('🔔 Message event received!');
            console.log('📝 Content:', message.body || 'No body');
            console.log('👤 From me:', message.fromMe);
            
            try {
                await this.handleMessage(message);
            } catch (error) {
                console.error('Error handling message:', error);
            }
        });

        // Handle authentication success
        this.client.on('authenticated', () => {
            console.log('✅ Authentication successful!');
            console.log('🔒 Session saved - no need to scan QR again on restart');
        });

        // Handle authentication failure
        this.client.on('auth_failure', (msg) => {
            console.error('❌ Authentication failed:', msg);
            console.log('🔄 You may need to scan QR code again');
        });

        // Handle disconnection
        this.client.on('disconnected', (reason) => {
            console.log('⚠️ Client was logged out:', reason);
            console.log('🔄 Bot will try to reconnect automatically...');
        });

        // Handle loading session data
        this.client.on('loading_screen', (percent, message) => {
            console.log(`📱 Loading WhatsApp: ${percent}% - ${message}`);
        });
    }

    async handleMessage(message) {
        const content = message.body.trim();
        const isFromMe = message.fromMe;
        const chat = await message.getChat();
        const contact = await message.getContact();

        // Debug logging
        console.log(`📱 Message from: ${contact.name || contact.pushname || contact.number}`);
        console.log(`📝 Message content: "${content}"`);
        console.log(`🔍 From me: ${isFromMe}`);
        console.log(`💬 Chat type: ${chat.isGroup ? 'Group' : 'Individual'}`);

        // Only process messages from the bot owner (self)
        if (!isFromMe) {
            console.log('⚠️ Ignoring message (not from me)');
            return;
        }

        // Log received command
        console.log(`✅ Processing command: ${content}`);

        // Parse and handle commands
        if (content.startsWith('!save voice ')) {
            console.log('🎤 Handling save voice command');
            await this.handleSaveVoiceCommand(message, content);
        } else if (content.startsWith('!spam ')) {
            console.log('📤 Handling spam command');
            await this.handleSpamCommand(message, content);
        } else if (content.startsWith('!') && !content.includes(' ')) {
            console.log('▶️ Handling play voice command');
            await this.handlePlayVoiceCommand(message, content);
        } else if (content === '!list voices' || content === '!list') {
            console.log('📋 Handling list voices command');
            await this.handleListVoicesCommand(message);
        } else if (content.startsWith('!delete voice ')) {
            console.log('🗑️ Handling delete voice command');
            await this.handleDeleteVoiceCommand(message, content);
        } else if (content.startsWith('!')) {
            console.log('❓ Unknown command:', content);
            await message.reply(`❌ Unknown command: ${content}\n\nAvailable commands:\n- !save voice [name]\n- ![name] or just [name]\n- !list voices\n- !delete voice [name]\n- !spam [message] [amount]`);
        } else {
            // Check if message matches a saved voice name (without ! prefix)
            console.log('🔍 Checking for voice name match:', content);
            await this.handleSmartVoiceDetection(message, content);
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
                const voiceList = voices.map(voice => `• ${voice} → !${voice} or just "${voice}"`).join('\n');
                await message.reply(`🎵 Saved voices:\n${voiceList}\n\n💡 Smart play: Type ![name] or just the name directly!`);
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

    async handleSmartVoiceDetection(message, content) {
        // Only check for voice names if it's a single word without spaces
        if (content.includes(' ') || content.length === 0) {
            return; // Ignore multi-word messages or empty content
        }

        try {
            // Get list of saved voices
            const voices = await this.voiceHandler.listVoices();
            
            // Check if the message content exactly matches a saved voice name
            if (voices.includes(content)) {
                console.log(`🎵 Smart voice detection: Found voice "${content}"`);
                const voiceMedia = await this.voiceHandler.getVoice(content);
                if (voiceMedia) {
                    await message.reply(voiceMedia);
                    console.log(`🔊 Auto-played voice: ${content}`);
                } else {
                    console.log(`❌ Voice file missing for: ${content}`);
                }
            }
        } catch (error) {
            console.error('Error in smart voice detection:', error);
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
            const delay = 50; // 50ms delay = 20 messages per second (much faster!)

            for (let i = 1; i <= amount; i++) {
                await chat.sendMessage(`${messageText}`);
                
                // Log every 10 messages to reduce console spam
                if (i % 10 === 0 || i === amount) {
                    console.log(`📤 Spam progress: ${i}/${amount} messages sent`);
                }
                
                // Add minimal delay for smooth sending
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
    console.log(`🔍 Voice check - hasMedia: ${message.hasMedia}, type: ${message.type}, pending: ${bot.voiceHandler.getAnyPendingVoice()}`);
    
    if (message.hasMedia && (message.type === 'ptt' || message.type === 'audio')) { // ptt or audio = voice message
        const pendingVoice = bot.voiceHandler.getAnyPendingVoice();
        console.log(`🎤 Voice message detected! Pending voice: ${pendingVoice}, From me: ${message.fromMe}`);
        
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
