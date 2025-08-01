#!/bin/bash

# WhatsApp Voice Bot - Termux Deployment Script
echo "🤖 WhatsApp Voice Bot - Termux Deployment"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running in Termux
if [[ -z "$PREFIX" ]] || [[ "$PREFIX" != *"com.termux"* ]]; then
    print_warning "This script is optimized for Termux environment"
    print_warning "Continuing with standard Linux setup..."
fi

# Step 1: Update packages
print_status "Updating Termux packages..."
if command -v pkg >/dev/null 2>&1; then
    pkg update -y
    print_success "Packages updated"
else
    print_warning "pkg command not found, using apt..."
    apt update -y
fi

# Step 2: Install Node.js
print_status "Installing Node.js..."
if command -v pkg >/dev/null 2>&1; then
    pkg install nodejs -y
else
    apt install nodejs npm -y
fi

if command -v node >/dev/null 2>&1; then
    print_success "Node.js installed: $(node --version)"
else
    print_error "Failed to install Node.js"
    exit 1
fi

# Step 3: Install Git (if needed)
print_status "Installing Git..."
if command -v pkg >/dev/null 2>&1; then
    pkg install git -y
else
    apt install git -y
fi

# Step 4: Setup storage permissions (Termux specific)
if [[ "$PREFIX" == *"com.termux"* ]]; then
    print_status "Setting up storage permissions..."
    if command -v termux-setup-storage >/dev/null 2>&1; then
        termux-setup-storage
        print_success "Storage permissions setup completed"
    else
        print_warning "termux-setup-storage not available"
    fi
fi

# Step 5: Create directories
print_status "Creating directories..."
mkdir -p voices
mkdir -p .wwebjs_auth
mkdir -p .wwebjs_cache

# For Termux, also create in home directory
if [[ "$PREFIX" == *"com.termux"* ]]; then
    mkdir -p "$HOME/whatsapp-bot-voices"
    print_success "Created Termux-specific directories"
fi

# Step 6: Install npm dependencies (Termux-optimized)
print_status "Installing npm dependencies..."

# Use Termux-specific package.json if available
if [[ "$PREFIX" == *"com.termux"* ]] && [[ -f "package-termux.json" ]]; then
    print_status "Using Termux-optimized package configuration..."
    cp package-termux.json package.json
fi

# Skip Puppeteer download for Android
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_SKIP_DOWNLOAD=true

# Install dependencies without Puppeteer browser download
if [[ -f "package.json" ]]; then
    npm install --no-optional
else
    # Manual installation for Termux
    print_status "Manual dependency installation for Termux..."
    npm install whatsapp-web.js@1.19.5 qrcode-terminal@0.12.0 --no-optional
fi

if [[ $? -eq 0 ]]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 7: Run environment check
print_status "Running environment compatibility check..."
if [[ -f "install-termux.js" ]]; then
    node install-termux.js
else
    print_warning "install-termux.js not found, skipping compatibility check"
fi

# Step 8: Create optimized start scripts
print_status "Creating start scripts..."

# Main start script
cat > start-bot.sh << 'EOF'
#!/bin/bash
echo "🤖 Starting WhatsApp Voice Bot..."
echo "================================="

# Environment info
echo "📱 Platform: $(uname -a)"
echo "📦 Node Version: $(node --version)"
echo "🏠 Working Directory: $(pwd)"

# Memory optimization for mobile devices
export NODE_OPTIONS="--max-old-space-size=512"

# Start the bot
echo "🚀 Launching bot..."
echo "📱 QR Code will appear below - scan with WhatsApp"
echo "================================================"
node index.js
EOF

# Termux-specific start script
if [[ "$PREFIX" == *"com.termux"* ]]; then
    cat > start-termux.sh << 'EOF'
#!/bin/bash
echo "📱 Starting WhatsApp Voice Bot in Termux..."
echo "==========================================="

# Termux-specific info
echo "📱 Termux Environment: $(uname -a)"
if command -v termux-battery-status >/dev/null 2>&1; then
    echo "🔋 Battery: $(termux-battery-status | grep percentage | cut -d'"' -f4)%"
fi
echo "💾 Available Memory: $(free -h | grep Mem | awk '{print $7}')"
echo "🏠 Home Directory: $HOME"
echo "📁 Storage: $(df -h $HOME | tail -1 | awk '{print $4}' | sed 's/G/ GB/')"

# Termux optimizations
export NODE_OPTIONS="--max-old-space-size=256"  # Lower memory for mobile
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Prevent sleep
if command -v termux-wake-lock >/dev/null 2>&1; then
    termux-wake-lock
    echo "🔒 Wake lock acquired"
fi

echo "🚀 Launching bot..."
echo "📱 QR Code will appear below - scan with WhatsApp"
echo "================================================"
node index.js
EOF
    chmod +x start-termux.sh
    print_success "Created Termux-optimized start script"
fi

chmod +x start-bot.sh

# Step 9: Test installation
print_status "Testing installation..."
if node -e "console.log('Node.js is working'); require('whatsapp-web.js'); console.log('whatsapp-web.js is working'); require('qrcode-terminal'); console.log('qrcode-terminal is working');" 2>/dev/null; then
    print_success "All dependencies are working correctly"
else
    print_error "Some dependencies are not working properly"
    print_status "Trying to fix dependencies..."
    npm install whatsapp-web.js qrcode-terminal --force
fi

# Step 10: Final instructions
echo ""
print_success "🎉 WhatsApp Voice Bot setup completed!"
echo "======================================"
echo ""
echo "📋 Quick Start:"
if [[ "$PREFIX" == *"com.termux"* ]]; then
    echo "   ./start-termux.sh    (Recommended for Termux)"
else
    echo "   ./start-bot.sh       (Standard start)"
fi
echo "   node index.js        (Direct start)"
echo ""
echo "🤖 Available Commands:"
echo "   !save voice [name]   - Save voice message"
echo "   ![name]              - Play voice message"  
echo "   !list voices         - List all voices"
echo "   !delete voice [name] - Delete voice"
echo "   !spam [msg] [count]  - Send spam messages"
echo ""
echo "🔧 Troubleshooting:"
if [[ "$PREFIX" == *"com.termux"* ]]; then
    echo "   - Storage issues: termux-setup-storage"
    echo "   - Permission issues: Allow storage access"
    echo "   - Browser issues: pkg install chromium"
    echo "   - Memory issues: Restart Termux app"
else
    echo "   - Browser issues: Install Chrome/Chromium"
    echo "   - Permission issues: Check file permissions"
fi
echo ""
print_success "Ready to start your WhatsApp Voice Bot! 🚀"