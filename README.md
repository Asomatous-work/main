# 🧠 Gotcha - AI-Powered Smart Notes

**Notion meets Grammarly for Actions**

An intelligent note-taking app that automatically detects actionable items (reminders, tasks, meetings) as you write and helps you execute them with 1-tap confirmation.

---

## ✨ Features

### 🎯 Core Functionality
- **Smart Detection**: AI analyzes your notes in real-time to find:
  - 📞 **Calls** - "Call Sarah tomorrow at 2pm"
  - 📅 **Meetings** - "Standup next Monday 10am"
  - ✅ **Tasks** - "Finish report by Friday"
  - ⏰ **Deadlines** - "Submit proposal due next week"

- **Inline Suggestions**: Floating action cards appear as you type (like Grammarly)
- **1-Tap Execution**: Confirm actions instantly without leaving your note
- **100% Local-First**: All notes stored on-device with AsyncStorage
- **Zero Backend**: No servers, no signup, complete privacy

### 🎨 Premium UI/UX
- **Glassmorphic Design**: Real native blur effects (expo-blur)
- **Haptic Feedback**: Feel every interaction
- **Dark Mode**: "Aurora" gradient with deep blacks
- **Smooth Animations**: Spring physics for organic feel

---

## 🏗️ Technical Architecture

### Stack
- **Framework**: React Native (Expo)
- **NLP Engine**: `chrono-node` (on-device temporal parsing)
- **Storage**: AsyncStorage (local-first)
- **Notifications**: expo-notifications (native OS)
- **UI**: Custom glassmorphism components

### File Structure
```
├── App.js                          # Main orchestrator
├── src/
│   ├── components/
│   │   ├── NoteEditor.js          # Rich text with AI detection
│   │   ├── NotesLibrary.js        # All notes grid
│   │   └── ModernUI.js            # Glass components, overlays
│   ├── services/
│   │   ├── NoteService.js         # AsyncStorage CRUD
│   │   └── NotificationService.js # Native reminders
│   └── utils/
│       └── nlp.js                  # Action detection engine
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Xcode) or Android Studio

### Installation
```bash
cd "/Users/aravindg/Desktop/reminder app"
npm install
npx expo start
```

### Running
- **iOS**: Press `i` (requires Xcode)
- **Android**: Press `a` (requires Android Studio)
- **Physical Device**: Scan QR with Expo Go app

---

## 🧪 How It Works

### Example Flow
1. **User writes**: 
   ```
   Monday meeting notes:
   - Call Mike about Q1 budget tomorrow at 2pm
   - Review design mockups
   ```

2. **AI detects**:
   - Action card appears: **CALL** | "Call Mike about Q1 budget" | Tomorrow, 2:00 PM

3. **User confirms**: Taps ✓ → Native reminder scheduled

4. **Result**: User gets notification tomorrow at 2pm

---

## 🎯 Why This is Different

| Feature | Gotcha | Notion | Apple Notes | Siri |
|---------|--------|--------|-------------|------|
| Auto-detect actions from notes | ✅ | ❌ | ❌ | ❌ |
| Works offline | ✅ | ❌ | ✅ | ❌ |
| No signup required | ✅ | ❌ | ✅ | ✅ |
| Inline AI suggestions | ✅ | ⚠️ (basic) | ❌ | ❌ |
| Privacy-first | ✅ | ❌ | ✅ | ⚠️ |

---

## 🔮 Future Roadmap

### Phase 2
- [ ] Voice notes → Action detection
- [ ] PDF/Image import with OCR
- [ ] Recurring tasks ("Every Monday...")
- [ ] Share Extension (iOS)
- [ ] Android system-wide overlay popup

### Phase 3
- [ ] Collaboration (P2P, no servers)
- [ ] Templates library
- [ ] Export to Calendar apps
- [ ] Siri Shortcuts integration

---

## 📖 Development Notes

### NLP Detection Logic
The `analyzeText()` function uses:
1. **Chrono.js**: Temporal parsing ("tomorrow", "next Friday")
2. **Keyword Patterns**: Intent classification (call, meeting, task)
3. **Confidence Scoring**: High/Medium/Low based on context

### Storage Schema
```javascript
{
  id: "timestamp-random",
  title: "Meeting Notes",
  content: "Full markdown text...",
  createdAt: "2026-01-21T18:00:00Z",
  updatedAt: "2026-01-21T19:00:00Z",
  detectedActions: [
    {
      type: "call",
      title: "Call Sarah",
      date: Date,
      confidence: "high"
    }
  ]
}
```

---

## 🛠️ Troubleshooting

### Common Issues

**Problem**: "Xcode must be fully installed"
- **Solution**: Install Xcode from App Store, then run:
  ```bash
  sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
  ```

**Problem**: Notifications not appearing
- **Solution**: Grant permissions in iOS Settings > Gotcha > Notifications

**Problem**: Blur not working on Android
- **Solution**: Update `expo-blur` or test on physical device (not all emulators support blur)

---

## 📄 License

MIT License - Feel free to use this for your research or commercial projects.

---

## 🙏 Credits

Built with ❤️ using:
- [Expo](https://expo.dev)
- [Chrono](https://github.com/wanasit/chrono)
- [Lucide Icons](https://lucide.dev)

---

**Made by:** Gotcha AI Team
**Version:** 1.0.0 (MVP)
**Date:** January 2026
