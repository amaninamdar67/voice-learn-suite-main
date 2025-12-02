# Voice Navigation V2 - Complete Specification

## Current Status
✅ Basic voice navigation with spacebar activation
✅ Simple commands: "go to dashboard", "open settings"
✅ ON/OFF toggle in TopBar
✅ Read Page feature with Piper TTS

## Required Upgrades

### 1. Two-State Voice System

#### ON State (Full Features)
- Continuous listening when activated
- All commands available:
  - Navigation: "go to X", "go back", "scroll up/down"
  - Content: "open document", "open item 1", "open video 2"
  - Reading: "read page", "start reading", "stop reading"
  - Control: "voice navigation off"

#### OFF State (Wake-word Only)
- Low-power wake-word listener
- ONLY listens for:
  - "voice navigation on"
  - "turn on voice navigation"
  - "enable voice navigation"
- All other commands ignored
- Minimal CPU usage

### 2. Document System

#### Opening Documents
- Commands: "open document", "open item 1", "open title <name>"
- Opens IN-PAGE (not new tab)
- Built-in back button + "go back" command
- Returns to document list view

#### Full Document Reading
- Reads ALL pages, not just visible content
- Structured reading:
  - Headings (with emphasis)
  - Paragraphs (in order)
  - Table cells (row by row)
  - Lists (with bullet indicators)
- OCR fallback for scanned PDFs

#### Reading Controls
- "start reading" - begins from current position
- "stop reading" - stops and remembers position
- "pause reading" - temporary pause
- "continue reading" - resume from pause
- "next page" - skip to next page
- "previous page" - go back one page

### 3. Content-Specific Commands

#### Videos
- "open video 1"
- "play lecture 3"
- "open lesson titled <name>"

#### Quizzes
- "open quiz 2"
- "start quiz 1"

#### Assignments
- "open assignment 4"
- "view assignment 3"

### 4. Universal Navigation

Always active when ON:
- "go back" - browser history back
- "scroll up" / "scroll down"
- "next" / "previous"
- "open item X"
- "close" - close modals/overlays
- "search for <keyword>"

### 5. Error Handling

When command unclear:
1. Read back what was heard
2. Suggest closest match
3. Ask for confirmation
4. Never lock user out (wake-word always active)

## Implementation Plan

### Phase 1: Core Infrastructure (Current Session)
- [x] Whisper + Piper setup
- [x] Voice server running
- [x] Read Page feature
- [ ] Wake-word detection system
- [ ] Two-state voice manager

### Phase 2: Document System
- [ ] In-page document viewer
- [ ] Full-page text extraction
- [ ] Structured reading engine
- [ ] Reading controls (pause/resume/navigate)
- [ ] OCR integration for scanned PDFs

### Phase 3: Content Commands
- [ ] Item detection (videos, quizzes, assignments)
- [ ] Number-based opening ("open item 1")
- [ ] Title-based opening ("open video titled X")
- [ ] Context-aware command routing

### Phase 4: Advanced Features
- [ ] Command history
- [ ] Fuzzy matching for unclear commands
- [ ] Confirmation dialogs
- [ ] Voice feedback for all actions

## Technical Architecture

### Wake-word Detection
```javascript
// Lightweight listener when OFF
const wakeWords = ['voice navigation on', 'turn on voice', 'enable voice'];
// Uses minimal resources, only checks for these phrases
```

### Full Command Engine (when ON)
```javascript
// Comprehensive command parser
const commandCategories = {
  navigation: ['go to', 'open', 'back', 'scroll'],
  reading: ['read', 'start reading', 'stop', 'pause', 'continue'],
  content: ['open video', 'open quiz', 'open assignment'],
  control: ['voice navigation off', 'close', 'search']
};
```

### Document Reader
```javascript
// Multi-page document reading
const documentReader = {
  extractAllPages: () => {}, // Get full document text
  structureContent: () => {}, // Parse headings, paragraphs, tables
  readSequentially: () => {}, // Read page by page
  handleControls: () => {} // Pause, resume, navigate
};
```

## Next Steps

1. Test current Read Page feature
2. Implement wake-word detection
3. Build two-state voice manager
4. Create document viewer component
5. Integrate full reading engine

## Notes

- Keep browser Web Speech API for navigation (fast)
- Use Piper for document reading (high quality)
- Whisper for offline/fallback only
- All features must work for blind users
- No new tabs - everything in-page
