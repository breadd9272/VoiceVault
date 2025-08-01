# 🔧 Termux Installation Guide - Puppeteer Fix

## 📱 Step-by-Step Termux Setup (Android)

### Problem:
Puppeteer Android platform issue during `npm install`:
```
Error: Unsupported platform: android
```

### 🚀 Complete Solution:

#### Method 1: Quick Fix Script
```bash
# Run this in your Termux:
chmod +x termux-fix.sh
./termux-fix.sh
```

#### Method 2: Manual Fix (Step by Step)

**Step 1: Update Termux**
```bash
pkg update -y
```

**Step 2: Install Node.js and Chromium**
```bash
pkg install nodejs chromium git -y
```

**Step 3: Setup Storage Permissions**
```bash
termux-setup-storage
# Accept the permission when prompted
```

**Step 4: Skip Puppeteer Download**
```bash
# Set environment variables
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_SKIP_DOWNLOAD=true

# Create .npmrc file
echo "puppeteer_skip_chromium_download=true" > .npmrc
echo "puppeteer_skip_download=true" >> .npmrc
echo "optional=false" >> .npmrc
```

**Step 5: Clean Install**
```bash
# Remove any existing installations
rm -rf node_modules package-lock.json

# Install dependencies manually
npm install whatsapp-web.js@1.19.5 --no-optional --ignore-scripts
npm install qrcode-terminal@0.12.0 --no-optional
```

**Step 6: Set Chromium Path**
```bash
# Set environment variable for Chromium
export PUPPETEER_EXECUTABLE_PATH=$PREFIX/bin/chromium
```

**Step 7: Start Bot**
```bash
node index.js
```

### 🎯 Quick Commands for Copy-Paste:

```bash
# Complete setup in one go:
pkg update -y && pkg install nodejs chromium git -y && termux-setup-storage
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_SKIP_DOWNLOAD=true
echo "puppeteer_skip_chromium_download=true" > .npmrc
echo "puppeteer_skip_download=true" >> .npmrc
rm -rf node_modules package-lock.json
npm install whatsapp-web.js@1.19.5 qrcode-terminal@0.12.0 --no-optional --ignore-scripts
export PUPPETEER_EXECUTABLE_PATH=$PREFIX/bin/chromium
node index.js
```

### 🔍 Verification Commands:

**Check Node.js:**
```bash
node --version  # Should show v14+ 
```

**Check Chromium:**
```bash
which chromium  # Should show path
$PREFIX/bin/chromium --version  # Should show version
```

**Test Dependencies:**
```bash
node -e "require('whatsapp-web.js'); console.log('✅ WhatsApp Web JS working')"
node -e "require('qrcode-terminal'); console.log('✅ QR Code Terminal working')"
```

### 🚨 Common Issues & Solutions:

#### Issue 1: "Chromium not found"
```bash
pkg install chromium
export PUPPETEER_EXECUTABLE_PATH=$PREFIX/bin/chromium
```

#### Issue 2: "Permission denied"
```bash
termux-setup-storage
chmod +x *.sh
```

#### Issue 3: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install whatsapp-web.js qrcode-terminal --no-optional
```

#### Issue 4: "Browser launch failed"
```bash
# Try different Chromium flags
export PUPPETEER_ARGS="--no-sandbox --disable-setuid-sandbox"
```

#### Issue 5: "Out of memory"
```bash
# Reduce memory usage
export NODE_OPTIONS="--max-old-space-size=256"
```

### 📱 Termux-Specific Tips:

1. **Battery**: Keep phone plugged in during setup
2. **Storage**: Use `termux-setup-storage` for file access
3. **Memory**: Close other apps during installation
4. **Permissions**: Allow all Termux permissions
5. **Updates**: Keep Termux updated from F-Droid

### 🎯 Expected Output After Fix:

```
📱 Detected Termux/Android environment
📱 Using Termux Chromium: /data/data/com.termux/files/usr/bin/chromium
🚀 Starting WhatsApp Voice Bot...

=== WhatsApp Voice Bot ===
Scan the QR code below with your WhatsApp mobile app:

[QR CODE appears here]

Waiting for authentication...
```

### 🔄 Permanent Environment Setup:

Add to your `~/.bashrc` file:
```bash
echo 'export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true' >> ~/.bashrc
echo 'export PUPPETEER_SKIP_DOWNLOAD=true' >> ~/.bashrc  
echo 'export PUPPETEER_EXECUTABLE_PATH=$PREFIX/bin/chromium' >> ~/.bashrc
echo 'export NODE_OPTIONS="--max-old-space-size=256"' >> ~/.bashrc
source ~/.bashrc
```

### ✅ Success Checklist:

- [ ] Termux updated
- [ ] Node.js installed
- [ ] Chromium installed  
- [ ] Storage permissions granted
- [ ] Environment variables set
- [ ] Dependencies installed without errors
- [ ] Bot starts and shows QR code
- [ ] WhatsApp authentication works

### 🆘 If Still Not Working:

1. Restart Termux app completely
2. Clear Termux app data (if necessary)
3. Reinstall Termux from F-Droid
4. Try alternative approach with different whatsapp-web.js version
5. Check Termux community forums for latest solutions

---

**Ab aap ka WhatsApp Voice Bot Termux mein perfect chal jayega! 🚀📱**