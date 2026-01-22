# 🎤 Gotcha - Meeting Intelligence Assistant

**AI-Powered Voice Notes with Real-Time Insights**

---

## 🎯 Product Vision

A professional meeting assistant that combines:
1. **Voice Recording** - High-quality audio capture for meetings/lectures
2. **Live AI Insights** - Real-time question suggestions & action detection as you type
3. **Smart Summarization** - Automatic TF-IDF based extractive summaries
4. **Action Extraction** - Detects tasks, deadlines, decisions automatically
5. **Offline-First** - Zero backend, complete privacy

---

## ✨ Key Features

### 🎤 Voice Recording
- **Native Quality**: Using expo-av for high-fidelity recording
- **Background Recording**: Continue recording even when screen is off
- **Pause/Resume**: Full control over recording session
- **Duration Tracking**: Live timer with professional pulsing animation

### 🧠 AI Insights Engine
- **Extractive Summarization**: TF-IDF algorithm generates 3-sentence summaries
- **Question Detection**: Finds all questions in your notes
- **Action Items**: Auto-detects tasks with keywords like "need to", "should", "must"
- **Decision Tracking**: Highlights agreed-upon decisions
- **Key Topics**: Frequency-based topic extraction

### 🎨 Premium UI/UX - "Tech Noir" Design

**Color Palette:**
- **Primary**: Electric Blue (`#0EA5E9`)
- **Secondary**: Cyber Purple (`#8B5CF6`)
- **Accent**: Neon Green (`#10B981`)
- **Background**: Deep Black with blue tints

**Components:**
- Glassmorphic cards with real blur (`expo-blur`)
- Pulsing recording button with glow animation
- Floating insights panel (slide-up)
- Live recording status bar
- Haptic feedback on every interaction

---

## 🏗️ Technical Architecture

### Stack
```
Frontend: React Native (Expo)
Voice: expo-av (native recording)
AI: Custom TF-IDF + pattern matching (zero-budget)
Storage: AsyncStorage (local-first)
UI: expo-blur + custom animations
```

### File Structure
```
├── App.js                          # Main app orchestrator
├── src/
│   ├── components/
│   │   ├── VoiceNoteEditor.js     # Main note editor with voice
│   │   ├── NotesLibrary.js        # All notes grid
│   │   ├── VoiceUI.js             # Voice recording components
│   │   └── ModernUI.js            # Glass components, overlays
│   ├── services/
│   │   ├── VoiceService.js        # Audio recording logic
│   │   ├── NoteService.js         # AsyncStorage CRUD
│   │   └── NotificationService.js # Native reminders
│   └── utils/
│       ├── nlp.js                  # Temporal detection (chrono)
│       └── aiInsights.js          # Summarization & extraction
```

---

## 🚀 How It Works

### Scenario: Team Meeting

**User opens app** → **Starts typing notes:**
```
Team standup - Jan 21, 2026

- Mike mentioned the API redesign is 80% complete
- Need to deploy to staging by Friday
- Sarah raised concerns about scalability
- decided to add caching layer
- Question: What's the timeline for load testing?
```

**AI Analyzes in Real-Time:**

**Suggested Questions appear:**
- "When is the target completion date?"
- "Who is responsible for this?"

**User taps "View Insights":**

**AI Panel Shows:**
- **Summary**: "API redesign 80% complete. Deploy to staging by Friday. Decided to add caching layer."
- **Action Items** (1):
  - "Need to deploy to staging by Friday"
- **Questions** (1):
  - "What's the timeline for load testing?"
- **Decisions** (1):
  - "decided to add caching layer"
- **Key Topics**: api, staging, caching, testing, scalability

---

## 🎤 Voice Recording Flow

1. **User taps Microphone button** → Recording starts
2. **Live status bar appears** with pulsing red dot + duration
3. **User speaks meeting content** (silent mode, no distraction)
4. **Tap square to stop** → Recording saved
5. **Placeholder added to note**: `[Voice Recording - 3:45]`
6. **Future**: Transcription with Whisper.cpp or free API

---

## 🎨 UI/UX Highlights

### Recording Button
- **Idle**: Electric blue circle with mic icon
- **Recording**: Pulsing red square with glow animation
- **Haptic**: Heavy impact on start, light on stop

### Insights Panel
- **Slide-up animation**: Spring physics (tension: 80)
- **Glass morphism**: `BlurView` intensity 90
- **Color-coded sections**:
  - Questions: Blue badges with "?"
  - Actions: Green bullets
  - Topics: Purple chips

### Professional Polish
- Tabular numbers for duration timer
- Letter-spacing on section titles
- Smooth transitions (200ms - 300ms)
- Consistent 24dp padding

---

## 💡 Why This Wins

| Feature | Gotcha | Otter.ai | Apple Notes | Notion |
|---------|--------|----------|-------------|--------|
| Free voice recording | ✅ | ⚠️ (limited) | ✅ | ❌ |
| AI insights | ✅ | ✅ | ❌ | ⚠️ (basic) |
| Works offline | ✅ | ❌ | ✅ | ❌ |
| No signup | ✅ | ❌ | ✅ | ❌ |
| Privacy-first | ✅ | ❌ | ✅ | ❌ |

**Unique Differentiator**: Real-time AI insights **while you type** (not after recording ends).

---

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Voice recording
- [x] AI insights (extractive)
- [x] Question suggestions
- [x] Action detection
- [ ] Transcription (Whisper.cpp integration)

### Phase 2
- [ ] Voice transcription in real-time
- [ ] Multi-speaker detection
- [ ] Export to PDF/Markdown
- [ ] Calendar integration

### Phase 3
- [ ] Meeting summary emails
- [ ] Team collaboration (P2P)
- [ ] AI voice assistant ("Ask me about this meeting")

---

## 🛠️ Development

### Prerequisites
```bash
# Install dependencies
cd "/Users/aravindg/Desktop/reminder app"
npm install

# Run app
npx expo start
```

### Testing Voice Features
1. Grant microphone permissions when prompted
2. Tap blue mic button to start recording
3. Speak for ~10 seconds
4. Tap red square to stop
5. Voice note placeholder appears in text

### Testing AI Insights
1. Type a meeting note (>50 characters)
2. Include keywords: "need to", "decided", questions with "?"
3. Wait 1 second for analysis
4. Tap "View Insights" button
5. Review extracted content

---

## 📖 Technical Notes

### Summarization Algorithm (TF-IDF)
```javascript
1. Split text into sentences
2. For each sentence:
   - Calculate term frequency (TF) = word count / sentence length
   - Calculate inverse document frequency (IDF) = log(total sentences / sentences with word)
   - Score = TF * IDF
3. Rank sentences by score
4. Return top N sentences in original order
```

### Pattern Matching
```javascript
// Action detection
ACTION_INDICATORS = ['need to', 'should', 'must', 'have to']

// Decision detection  
DECISION_KEYWORDS = ['decided', 'agreed', 'approved']

// Question detection
Starts with: what, why, how... OR ends with '?'
```

---

## 🎯 Use Cases

1. **Silent Meetings** (no typing noise)
   - Record voice, add text notes later
   - AI suggests questions in real-time

2. **Lecture Notes** (students)
   - Record professor, take key notes
   - AI extracts action items (assignments)

3. **Interview Prep**
   - Record practice answers
   - AI summarizes key points

4. **Brainstorming Sessions**
   - Capture ideas via voice
   - AI finds patterns & themes

---

## 📄 License

MIT

---

**Built with:** React Native, Expo, chrono-node, expo-av
**Author:** Gotcha AI Team
**Version:** 2.0.0 (Voice Edition)
**Date:** January 2026

