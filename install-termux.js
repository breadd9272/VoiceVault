#!/usr/bin/env node

// Termux Environment Detection and Setup
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🤖 WhatsApp Voice Bot - Termux Compatibility Check');
console.log('================================================');

// Check if running in Termux
const isTermux = process.env.PREFIX && process.env.PREFIX.includes('com.termux');
const isAndroid = process.platform === 'android';

console.log(`📱 Platform: ${process.platform}`);
console.log(`🏠 PREFIX: ${process.env.PREFIX || 'Not set'}`);
console.log(`📦 Node Version: ${process.version}`);
console.log(`🔍 Termux Detected: ${isTermux ? 'Yes' : 'No'}`);
console.log(`🤖 Android Detected: ${isAndroid ? 'Yes' : 'No'}`);

if (isTermux) {
    console.log('\n✅ Termux environment detected!');
    console.log('📝 Applying Termux-specific optimizations...');
    
    // Create optimized start script for Termux
    const termuxStartScript = `#!/bin/bash
echo "🤖 Starting WhatsApp Voice Bot in Termux..."
echo "📱 Termux Environment: $(uname -a)"
echo "📊 Memory Usage: $(free -h | grep Mem)"
echo "🔋 Battery: \$(termux-battery-status 2>/dev/null | grep percentage || echo 'N/A')"
echo "================================================"
echo "📱 QR Code will appear below - scan with WhatsApp"
echo "================================================"

# Set environment variables for better performance
export NODE_OPTIONS="--max-old-space-size=1024"
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Start the bot
node index.js
`;

    fs.writeFileSync('start-termux.sh', termuxStartScript);
    
    try {
        execSync('chmod +x start-termux.sh');
        console.log('✅ Created Termux-optimized start script: start-termux.sh');
    } catch (error) {
        console.log('⚠️ Could not set execute permission (this is normal in some environments)');
    }
    
} else {
    console.log('\n📱 Non-Termux environment detected');
    console.log('🔧 Standard configuration will be used');
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = require('./package.json');
const requiredDeps = ['whatsapp-web.js', 'qrcode-terminal'];

requiredDeps.forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`✅ ${dep} - OK`);
    } catch (error) {
        console.log(`❌ ${dep} - Missing (run: npm install ${dep})`);
    }
});

// Create voices directory if it doesn't exist
if (!fs.existsSync('voices')) {
    fs.mkdirSync('voices');
    console.log('📁 Created voices directory');
}

console.log('\n🎯 Setup Complete!');
console.log('================');

if (isTermux) {
    console.log('📱 For Termux, run: ./start-termux.sh');
} else {
    console.log('🖥️  For standard systems, run: node index.js');
}

console.log('\n📋 Available Commands:');
console.log('- !save voice [name] - Save voice message');
console.log('- ![name] - Play voice message');
console.log('- !list voices - List all voices');
console.log('- !delete voice [name] - Delete voice');
console.log('- !spam [message] [amount] - Send spam messages (5/sec, max 100)');

console.log('\n🔧 Troubleshooting:');
if (isTermux) {
    console.log('- Storage issues: run termux-setup-storage');
    console.log('- Browser issues: pkg install chromium');
    console.log('- Permission issues: Allow storage access when prompted');
} else {
    console.log('- Browser issues: Install Chrome/Chromium');
    console.log('- Permission issues: Check file system permissions');
}

console.log('\n🚀 Ready to start your WhatsApp Voice Bot!');