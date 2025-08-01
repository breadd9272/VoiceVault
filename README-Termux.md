# WhatsApp Voice Bot - Termux Installation Guide

## 📱 Termux Me WhatsApp Voice Bot Setup Kaise Kare

### Step 1: Termux Install Kare
1. Google Play Store se **Termux** app download kare
2. Termux open kare

### Step 2: Bot Setup Kare
```bash
# Setup script chalaye
chmod +x termux-setup.sh
./termux-setup.sh
```

### Step 3: Bot Start Kare
```bash
# Bot start karne ke liye
./start-bot.sh
# Ya directly
node index.js
```

### Step 4: WhatsApp Connect Kare
1. Terminal me QR code dikhega
2. WhatsApp app me jaye > Settings > Linked Devices > Link a Device
3. QR code scan kare
4. Bot ready!

## 🤖 Commands (सभी कमांड्स)

### Voice Messages:
- `!save voice hello` - Voice message save kare "hello" naam se
- `!hello` - Saved voice "hello" play kare
- `!list voices` - Sabhi saved voices dekhe
- `!delete voice hello` - Voice "hello" delete kare

### Spam Messages:
- `!spam hello 10` - "hello" message 10 times send kare
- `!spam test message 5` - "test message" 5 times send kare
- Maximum 100 messages allowed
- Speed: 5 messages per second

## 🔧 Termux-Specific Features

### Storage Permissions:
```bash
termux-setup-storage
```

### Manual Dependencies (agar automatic setup fail ho):
```bash
pkg update
pkg install nodejs git
npm install whatsapp-web.js qrcode-terminal
```

### Troubleshooting:

#### Chrome/Chromium Issues:
```bash
# Browser install kare (optional)
pkg install chromium
```

#### Permission Issues:
```bash
# Storage permission de
termux-setup-storage
# Allow kare jab popup aaye
```

#### Node.js Issues:
```bash
# Node.js reinstall kare
pkg uninstall nodejs
pkg install nodejs
```

## 📂 Files Structure
```
whatsapp-voice-bot/
├── index.js              # Main bot file
├── termux-setup.sh       # Termux setup script
├── start-bot.sh          # Bot start script
├── voices/               # Voice files storage
├── commands/             # Bot commands
├── config/               # Configuration
└── utils/                # Utilities
```

## ⚠️ Important Notes

1. **Internet Connection**: Stable internet connection required
2. **Battery**: Keep phone charging during use
3. **Termux Background**: Termux background me run karne ke liye wake lock enable kare
4. **Storage**: Voice files phone storage me save hote hai

## 🚨 Common Issues & Solutions

### Bot Crash Hota Hai:
```bash
# Memory clear kare
pkill node
./start-bot.sh
```

### QR Code Nahi Dikh Raha:
```bash
# Terminal clear kare
clear
node index.js
```

### Voice Save Nahi Ho Raha:
- Storage permission check kare
- `termux-setup-storage` run kare

### Spam Feature Nahi Chal Raha:
- Bot se message send kare (self message)
- Commands sirf apne messages se work karte hai

## 📞 Usage Examples

```bash
# Voice save karne ka process:
You: !save voice hello
Bot: Ready to save voice as "hello". Please send the voice message now.
You: [Send voice message]
Bot: Voice saved as "hello". Use !hello to play it.

# Voice play kare:
You: !hello
Bot: [Plays saved voice]

# Spam use kare:
You: !spam test 5
Bot: Starting spam: "test" x 5 times
Bot: test
Bot: test
Bot: test
Bot: test
Bot: test
```

## 🔄 Auto-Start (Optional)

Bot ko automatic start karne ke liye:
```bash
# .bashrc me add kare
echo "cd /path/to/bot && ./start-bot.sh" >> ~/.bashrc
```

## 📱 Mobile Optimization

Bot mobile ke liye optimized hai:
- Low memory usage
- Battery efficient
- Mobile-friendly QR code display
- Termux environment detection
- Android-specific browser settings

## 💡 Pro Tips

1. **Background Running**: Termux:Boot app use kare auto-start ke liye
2. **Multiple Sessions**: tmux install kar ke multiple sessions chalaye
3. **Notifications**: Termux:API use kar ke notifications enable kare
4. **File Management**: `ls voices/` se saved voices dekhe

Happy Botting! 🤖