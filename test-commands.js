// Quick command test for debugging
const { Client, LocalAuth } = require('whatsapp-web.js');

console.log('🔍 Testing message event handling...');

// Create a simple test to verify message events are working
const testClient = new Client({
    authStrategy: new LocalAuth({
        clientId: "test-client"
    })
});

testClient.on('message', (message) => {
    console.log('✅ Message event is working!');
    console.log('Message:', message.body);
    console.log('From me:', message.fromMe);
});

console.log('Test setup complete. Check your main bot logs for message events.');