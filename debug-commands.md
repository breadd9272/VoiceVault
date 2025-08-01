# 🔧 Commands Debug Guide

## Aap ka bot ready hai! Ab commands test karte hain:

### 📝 Test Commands (WhatsApp me send karo):

1. **Basic test:**
   ```
   !list
   ```

2. **Voice save test:**
   ```
   !save voice hello
   ```

3. **Play voice test:**
   ```
   !hello
   ```

4. **Spam test:**
   ```
   !spam test 3
   ```

### 🔍 Debug Information:

Bot ab detailed logs show karega jab aap command send karoge:

```
📱 Message from: [Your Name]
📝 Message content: "!list"
🔍 From me: true
💬 Chat type: Individual
✅ Processing command: !list
📋 Handling list voices command
```

### ⚠️ Common Issues:

1. **Commands not working?**
   - Check if `From me: true` shows in logs
   - Make sure you're sending from same phone that scanned QR
   - Commands must start with `!` (exclamation mark)

2. **No response?**
   - Check console logs for errors
   - Make sure bot shows "ready" message
   - Try simple `!list` command first

3. **Voice commands not working?**
   - First save a voice: `!save voice test`
   - Then send voice message when prompted
   - Then play it: `!test`

### 📋 Available Commands:

- `!save voice [name]` - Voice message save karo
- `![name]` - Saved voice play karo  
- `!list` or `!list voices` - All voices list dekho
- `!delete voice [name]` - Voice delete karo
- `!spam [message] [count]` - Spam messages send karo

### 🚨 If Still Not Working:

1. Bot console me detailed logs check karo
2. Make sure "From me: true" dikhta hai
3. Try restarting WhatsApp Web session
4. Clear `.wwebjs_auth` and reconnect if needed

---

**Ab commands try karo aur console logs dekho kya ho raha hai! 🔍**