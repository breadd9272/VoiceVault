#!/bin/bash

# WhatsApp Voice Bot - Termux Fix Script
echo "🔧 Fixing Puppeteer Android Issue..."
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if in Termux
if [[ -z "$PREFIX" ]] || [[ "$PREFIX" != *"com.termux"* ]]; then
    print_error "This fix is specifically for Termux environment"
    exit 1
fi

print_status "Cleaning up previous installations..."
rm -rf node_modules package-lock.json .npm

print_status "Setting Puppeteer environment variables..."
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_SKIP_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=""

# Create .npmrc to skip Puppeteer downloads permanently
print_status "Creating .npmrc configuration..."
cat > .npmrc << EOF
puppeteer_skip_chromium_download=true
puppeteer_skip_download=true
optional=false
EOF

print_status "Installing Chromium browser for Termux..."
pkg install chromium -y

# Create custom browser launcher
print_status "Creating browser configuration..."
mkdir -p config
cat > config/browser.js << 'EOF'
const os = require('os');
const fs = require('fs');

function getBrowserExecutablePath() {
    // Termux Chromium paths
    const termuxPaths = [
        '/data/data/com.termux/files/usr/bin/chromium',
        '/data/data/com.termux/files/usr/bin/chromium-browser',
        process.env.PREFIX + '/bin/chromium',
        process.env.PREFIX + '/bin/chromium-browser'
    ];
    
    for (const path of termuxPaths) {
        if (fs.existsSync(path)) {
            return path;
        }
    }
    
    // Fallback to system chromium
    return 'chromium';
}

function getBrowserArgs() {
    return [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--memory-pressure-off',
        '--max_old_space_size=256'
    ];
}

module.exports = {
    getBrowserExecutablePath,
    getBrowserArgs
};
EOF

print_status "Using Termux-optimized package.json..."
cp package-termux.json package.json

print_status "Installing dependencies manually..."
npm install whatsapp-web.js@1.19.5 --no-optional --ignore-scripts
npm install qrcode-terminal@0.12.0 --no-optional

# Verify installation
print_status "Verifying installation..."
if node -e "console.log('✅ Node.js working'); require('whatsapp-web.js'); console.log('✅ WhatsApp-web.js working'); require('qrcode-terminal'); console.log('✅ QRCode-terminal working');" 2>/dev/null; then
    print_success "All dependencies installed successfully!"
else
    print_error "Installation verification failed"
    exit 1
fi

print_success "🎉 Termux fix completed!"
echo ""
echo "📋 Next steps:"
echo "   node index.js    # Start the bot"
echo ""
echo "🔧 If you still get browser errors:"
echo "   pkg install chromium"
echo "   export PUPPETEER_EXECUTABLE_PATH=\$PREFIX/bin/chromium"