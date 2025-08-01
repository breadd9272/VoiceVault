# WhatsApp Voice Bot

## Overview

This is a WhatsApp bot that enables users to save, manage, and replay voice messages through text commands. The bot integrates with WhatsApp Web using the `whatsapp-web.js` library and provides a command-based interface for voice message management. Users can save voice messages with custom names, list all saved voices, delete specific voices, replay them on demand, and send spam messages at a controlled rate.

## User Preferences

Preferred communication style: Simple, everyday language.
User prefers Urdu/Hindi language for communication.
User wants Termux/mobile compatibility for running the bot on Android devices.

## System Architecture

### Core Architecture Pattern
The application follows a modular, event-driven architecture with clear separation of concerns:

- **Main Bot Controller** (`index.js`): Handles WhatsApp client initialization, authentication, and message routing
- **Command Handler** (`voiceHandler.js`): Manages voice-specific operations and file storage
- **Configuration Management** (`config/config.js`): Centralized configuration for timeouts, file limits, and supported formats
- **File Management Utilities** (`utils/fileManager.js`): Handles file system operations and validation

### WhatsApp Integration
- Uses `whatsapp-web.js` with LocalAuth strategy for persistent authentication
- Implements QR code authentication for initial setup
- Configured with Puppeteer for headless browser automation with optimized arguments for server environments

### Voice Message Storage
- File-based storage system using local directory structure
- Configurable storage directory (`voices/` by default)
- Support for multiple audio formats (OGG, MP3, WAV, M4A)
- File size limitations (16MB maximum) and validation

### Command Processing  
- Text-based command interface with specific prefixes
- Stateful command handling for multi-step operations (save voice workflow)
- Pending voice tracking using in-memory Map for temporary state management
- Spam messaging feature with rate limiting (5 messages per second, max 100 messages)
- Message parsing and validation for command parameters

### Error Handling and Logging
- Comprehensive error handling for file operations and WhatsApp events
- Console-based logging with configurable log levels
- Directory creation and permission handling

## External Dependencies

### Primary Dependencies
- **whatsapp-web.js**: WhatsApp Web API integration and messaging capabilities
- **qrcode-terminal**: QR code generation for WhatsApp authentication in terminal

### Runtime Environment
- **Node.js**: JavaScript runtime environment (v14+ required)
- **Puppeteer**: Automated browser control (bundled with whatsapp-web.js)
- **File System**: Local storage for voice message persistence
- **Cross-platform**: Supports Linux, Windows, macOS, and Android (via Termux)
- **Mobile Optimization**: Memory-optimized for Android devices with Termux-specific configurations

### WhatsApp Integration Requirements
- WhatsApp account for bot operation
- Network connectivity for WhatsApp Web service
- Browser automation capabilities through Puppeteer

### File System Dependencies
- Local storage access for voice file management
- Directory creation and file manipulation permissions
- Support for audio file formats and MIME type validation