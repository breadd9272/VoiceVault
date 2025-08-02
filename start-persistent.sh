#!/bin/bash

# WhatsApp Voice Bot - Persistent Session Starter
echo "🔒 Starting WhatsApp Voice Bot with Persistent Authentication"
echo "============================================================"

# Create auth directory if it doesn't exist
mkdir -p .wwebjs_auth/chromium-persistent

# Check if session already exists
if [ -d ".wwebjs_auth/session-whatsapp-voice-bot" ]; then
    echo "✅ Found existing session - no QR scan needed!"
    echo "🚀 Starting bot with saved authentication..."
else
    echo "📱 No existing session found"
    echo "🔍 QR code will appear for first-time setup"
    echo "💡 After scanning once, bot will auto-login on restart"
fi

# Start the bot
node index.js