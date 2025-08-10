# University of Limpopo Emergency Voice Detection System

This document describes the AI-powered voice recognition system built for the University of Limpopo Emergency System that continuously monitors for emergency phrases and triggers instant alerts.

## Features

### 🎯 Core Functionality
- **Continuous Voice Monitoring**: Runs in the background listening for emergency phrases
- **AI-Powered Detection**: Uses both Web Speech API and Hugging Face Transformers
- **Offline Capability**: Includes Whisper model for offline speech recognition
- **Real-time Alerts**: Instant notifications when emergency phrases are detected
- **Audio Recording**: Captures audio clips around emergency detections
- **GPS Location**: Automatically includes location data with alerts

### 🚨 Emergency Categories
- **Medical**: "help me", "I'm hurt", "call an ambulance", "chest pain", etc.
- **Security**: "call security", "I'm being followed", "intruder", "robbery", etc.  
- **Fire**: "fire", "smoke", "building is on fire", etc.
- **General**: "emergency", "help", "urgent help needed", "SOS", etc.

### ⚙️ Configuration
- **Custom Phrases**: Add/remove emergency phrases via the UI
- **Confidence Levels**: Adjustable detection sensitivity per phrase
- **Category Management**: Organize phrases by emergency type
- **Detection History**: View past detections with audio playback

## Usage

### Getting Started
1. Navigate to **Dashboard → Audio Recording**
2. Click **"Start Detection"** to begin voice monitoring
3. The system will request microphone permissions
4. Once active, it continuously listens for emergency phrases

### Adding Custom Phrases
1. In the Emergency Phrases section, enter a new phrase
2. Select the appropriate category (Medical, Security, Fire, General)
3. Click the **+** button to add
4. The phrase will be immediately active for detection

### Emergency Detection Flow
1. **Detection**: System identifies an emergency phrase in speech
2. **Location**: Automatically captures GPS coordinates (if available)
3. **Audio Clip**: Records 30 seconds of audio around the detection
4. **Alert**: Shows browser notification and plays alert sound
5. **Logging**: Saves detection to history with timestamp and details

## Mobile Deployment (Capacitor)

This system is configured for mobile deployment using Capacitor for both Android and iOS.

### Prerequisites
- Node.js and npm installed
- Android Studio (for Android deployment)
- Xcode (for iOS deployment, macOS only)

### Setup Instructions

1. **Export to GitHub** (via Lovable interface)
2. **Clone and Install**:
   ```bash
   git clone [your-repo-url]
   cd [project-name]
   npm install
   ```

3. **Add Mobile Platforms**:
   ```bash
   npx cap add android
   npx cap add ios
   ```

4. **Build and Sync**:
   ```bash
   npm run build
   npx cap sync
   ```

5. **Run on Device/Emulator**:
   ```bash
   # For Android
   npx cap run android
   
   # For iOS (macOS only)
   npx cap run ios
   ```

### Mobile-Specific Features
- **Background Processing**: Continues monitoring when app is minimized
- **Native Notifications**: Uses device notification system
- **Battery Optimization**: Efficient resource usage for all-day monitoring
- **Permission Handling**: Proper microphone and location permissions

## Technical Implementation

### Architecture
```
EmergencyVoiceRecognition.ts (Core Engine)
├── Web Speech API (Primary recognition)
├── Whisper Model (Offline fallback)
├── Audio Recording (MediaRecorder API)
├── Location Services (Geolocation API)
└── Emergency Detection (Pattern matching)

EmergencyVoiceDetector.tsx (React Component)
├── Control Interface (Start/Stop detection)
├── Phrase Management (Add/Remove phrases)
├── Detection History (View past alerts)
└── Audio Playback (Review detection clips)
```

### Default Emergency Phrases (26 total)

**Medical (8 phrases)**:
- "help me", "I'm hurt", "I need medical help"
- "call an ambulance", "medical emergency"
- "I can't breathe", "chest pain", "heart attack"

**Security (7 phrases)**:
- "call security", "help me please"
- "someone is attacking me", "I'm being followed"
- "intruder", "robbery", "call the police"

**Fire (4 phrases)**:
- "fire", "smoke", "building is on fire"
- "call fire department"

**General (7 phrases)**:
- "emergency", "help", "urgent help needed"
- "call for help", "mayday", "SOS"

### Performance Optimizations
- **Chunked Processing**: Audio processed in 10-second chunks
- **WebGPU Acceleration**: Uses WebGPU for Whisper model when available
- **Efficient Pattern Matching**: Optimized phrase detection algorithms
- **Memory Management**: Automatic cleanup of audio buffers
- **Battery Conscious**: Minimal resource usage for continuous operation

## Configuration Files

### Emergency Phrases Config
Custom phrases are stored in localStorage and can be exported/imported:
```json
{
  "phrase": "custom emergency phrase",
  "category": "medical|security|fire|general", 
  "confidence": 0.8
}
```

### Capacitor Configuration
The `capacitor.config.ts` file is pre-configured for the University of Limpopo project:
- App ID: `app.lovable.956b9256554f442eba4010015872a126`
- App Name: `emergency-linkup`
- Splash screen with UL branding
- Notification settings optimized for emergency alerts

## Security & Privacy

### Data Handling
- **Local Processing**: Voice recognition happens on-device
- **No Cloud Storage**: Audio clips stored locally only
- **Privacy First**: No voice data sent to external servers
- **Secure Storage**: Emergency history encrypted in localStorage

### Permissions Required
- **Microphone**: Continuous audio monitoring
- **Location**: GPS coordinates for emergency alerts
- **Notifications**: Browser/system notifications for alerts

## Troubleshooting

### Common Issues

**"Speech recognition not supported"**
- Ensure you're using a modern browser (Chrome, Edge, Safari)
- Check microphone permissions in browser settings

**"No audio detected"**
- Verify microphone is working and not muted
- Check system audio levels
- Try refreshing the page and restarting detection

**"WebGPU not available"**
- Fallback to Web Speech API is automatic
- No impact on core functionality

### Browser Support
- **Chrome/Edge**: Full support (recommended)
- **Firefox**: Web Speech API support varies
- **Safari**: Good support on macOS/iOS
- **Mobile Browsers**: Full support via Capacitor

## Development

### Adding New Features
The system is designed to be extensible:
- Add new emergency categories in `EmergencyPhrase` interface
- Extend pattern matching in `calculatePhraseMatch()` 
- Add new alert channels in `sendEmergencyAlert()`
- Integrate with backend emergency services

### Testing
Test the system by:
1. Speaking emergency phrases clearly into the microphone
2. Verifying detection appears in history
3. Checking alert notifications appear
4. Testing audio clip playback

---

For more information about mobile capabilities and deployment, visit: https://lovable.dev/blogs/TODO