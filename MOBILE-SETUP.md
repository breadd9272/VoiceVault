# 📱 WhatsApp Voice Bot - Mobile/Termux Setup Guide

## 🚀 Quick Setup (Termux Android)

### Method 1: Automatic Setup
```bash
# Clone/download the bot files to your Termux
chmod +x deploy-termux.sh
./deploy-termux.sh
```

### Method 2: Manual Setup
```bash
# Update Termux
pkg update -y

# Install Node.js and Git
pkg install nodejs git -y

# Setup storage permissions
termux-setup-storage

# Install bot dependencies
npm install whatsapp-web.js qrcode-terminal

# Start the bot
node index.js
```

## 📋 Commands Reference

### Voice Commands:
- `!save voice hello` - Voice message ko "hello" naam se save kare
- `!hello` - Saved voice "hello" play kare  
- `!list voices` - Sabhi saved voices ki list dekhe
- `!delete voice hello` - Voice "hello" delete kare

### Spam Commands:
- `!spam hello 10` - "hello" message 10 times send kare
- `!spam test message 5` - "test message" 5 times send kare
- Rate: 5 messages per second, Maximum: 100 messages

## 🔧 Termux Optimizations

### Memory Optimization:
```bash
export NODE_OPTIONS="--max-old-space-size=256"
```

### Battery Optimization:
```bash
termux-wake-lock  # Prevent sleep during bot operation
```

### Storage Setup:
```bash
termux-setup-storage  # Allow access to phone storage
```

## 📂 File Structure
```
whatsapp-voice-bot/
├── index.js                 # Main bot file (Termux-compatible)
├── deploy-termux.sh         # Automatic setup script
├── termux-setup.sh          # Basic setup script
├── install-termux.js        # Environment checker
├── start-termux.sh          # Termux-optimized starter
├── README-Termux.md         # Detailed Termux guide
├── voices/                  # Voice files storage
└── commands/                # Bot command handlers
```

## 🚨 Troubleshooting

### Common Issues:

#### 1. Browser/Chrome Issues:
```bash
pkg install chromium
```

#### 2. Storage Permission Issues:
```bash
termux-setup-storage
# Allow access when prompted
```

#### 3. Memory Issues:
```bash
# Restart Termux app
# Or reduce memory usage:
export NODE_OPTIONS="--max-old-space-size=128"
```

#### 4. QR Code Not Visible:
```bash
clear
node index.js
```

#### 5. Bot Crashes:
```bash
pkill node
rm -rf .wwebjs_auth .wwebjs_cache
node index.js
```

## 📱 Mobile-Specific Features

### Environment Detection:
- Automatically detects Termux environment
- Applies mobile-optimized settings
- Uses appropriate storage paths

### Memory Management:
- Reduced memory footprint for mobile devices
- Optimized garbage collection
- Battery-efficient operations

### Background Operation:
- Wake lock support to prevent app sleep
- Persistent sessions
- Automatic restart capabilities

## 🎯 Performance Tips

1. **Battery**: Keep phone plugged in during heavy usage
2. **Memory**: Close other apps to free RAM
3. **Storage**: Use internal storage for better performance
4. **Network**: Ensure stable internet connection
5. **Background**: Enable background app refresh for Termux

## 🔐 Security Notes

- Bot only responds to messages from your WhatsApp account
- Voice files stored locally on your device
- No data sent to external servers
- WhatsApp Web authentication required

## 📊 System Requirements

- **Android**: 5.0+ (API 21+)
- **RAM**: Minimum 2GB (4GB recommended)
- **Storage**: 100MB+ free space
- **Internet**: Stable connection required
- **Termux**: Latest version from F-Droid or GitHub

## 🔄 Updates & Maintenance

### Update Bot:
```bash
git pull origin main  # If using git
npm update            # Update dependencies
```

### Clean Cache:
```bash
rm -rf .wwebjs_auth .wwebjs_cache
```

### Check Status:
```bash
node install-termux.js  # Run compatibility check
```

## 💡 Advanced Usage

### Auto-Start on Boot:
1. Install Termux:Boot from F-Droid
2. Create `~/.termux/boot/start-bot` script
3. Add bot startup commands

### Multiple Sessions:
```bash
pkg install tmux
tmux new-session -d -s whatsapp-bot 'node index.js'
```

### Notifications:
```bash
pkg install termux-api
# Enable notifications for bot events
```

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run `node install-termux.js` for diagnostics
3. Ensure all permissions are granted
4. Try restarting Termux app
5. Clear WhatsApp Web sessions and reconnect

---

Happy mobile botting! 🤖📱