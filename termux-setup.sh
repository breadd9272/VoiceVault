#!/bin/bash

# Termux WhatsApp Voice Bot Setup Script
echo "🚀 Setting up WhatsApp Voice Bot for Termux..."

# Update packages
echo "📦 Updating Termux packages..."
pkg update -y

# Install Node.js
echo "📦 Installing Node.js..."
pkg install nodejs -y

# Install git (if not already installed)
echo "📦 Installing Git..."
pkg install git -y

# Install storage permissions
echo "📱 Setting up storage permissions..."
termux-setup-storage

# Create voices directory
echo "📁 Creating voices directory..."
mkdir -p voices

# Install npm dependencies
echo "📦 Installing Node.js dependencies..."
npm install whatsapp-web.js qrcode-terminal

# Create start script
echo "📝 Creating start script..."
cat > start-bot.sh << 'EOF'
#!/bin/bash
echo "🤖 Starting WhatsApp Voice Bot..."
echo "📱 Make sure to allow storage permissions when prompted"
echo "📊 QR Code will appear below - scan with WhatsApp"
echo "================================================"
node index.js
EOF

chmod +x start-bot.sh

echo "✅ Termux setup complete!"
echo ""
echo "📱 To start the bot, run: ./start-bot.sh"
echo "📝 Or directly: node index.js"
echo ""
echo "🔑 First time setup:"
echo "1. Run: termux-setup-storage (if prompted)"
echo "2. Allow storage permissions"
echo "3. Start the bot and scan QR code"