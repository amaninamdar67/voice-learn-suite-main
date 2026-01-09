# 🤖 AI Tutor - Visual Guide

## Interface Layout

### Main Screen
```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖  E-Learning Using AI    [Model: mistral ▼] [X]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    💬 Start a conversation                      │
│                                                                 │
│                  Ask about math, coding, diagrams,              │
│                    or anything academic                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Type your question...] [🎤] [📷] [Send ➤]                    │
└─────────────────────────────────────────────────────────────────┘
```

### With Messages
```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖  E-Learning Using AI    [Model: mistral ▼] [X]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                                                                 │
│                    User: What is calculus?                      │
│                                                                 │
│                                                                 │
│  AI: Calculus is a branch of mathematics that studies          │
│  continuous change. It has two main branches:                  │
│  1. Differential Calculus - rates of change                    │
│  2. Integral Calculus - accumulation of quantities             │
│                                                                 │
│  [Read (Hindi)] [Stop Reading]                                 │
│                                                                 │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Type your question...] [🎤] [📷] [Send ➤]                    │
└─────────────────────────────────────────────────────────────────┘
```

### With Image
```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖  E-Learning Using AI    [Model: mistral ▼] [X]              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User: [Image Preview]                                         │
│        Explain this diagram                                    │
│                                                                 │
│  AI: This diagram shows the water cycle...                     │
│  [Read (Hindi)]                                                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ [Image Preview] [X]                                            │
│ [Type your question...] [🎤] [📷] [Send ➤]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Button Guide

### Top Bar Buttons
```
┌──────────────────────────────────────────────────────┐
│ 🤖 Icon          Model Dropdown    Close Button      │
│ (Click to       [mistral ▼]        [X]              │
│  open/focus)    (Select model)     (Close AI Tutor) │
└──────────────────────────────────────────────────────┘
```

### Input Area Buttons
```
┌────────────────────────────────────────────────────────────┐
│ [Input Field]  [🎤]  [📷]  [Send ➤]                      │
│ Type here      Voice  Image  Send                         │
│                Input  Upload Message                      │
└────────────────────────────────────────────────────────────┘
```

### Message Buttons
```
User Message:
┌─────────────────────────────────┐
│ Your question here              │
└─────────────────────────────────┘

AI Message:
┌─────────────────────────────────┐
│ AI response here                │
│ [Read (Hindi)] [Stop Reading]   │
└─────────────────────────────────┘
```

---

## Color Scheme

### Message Colors
```
User Message:
┌─────────────────────────────────┐
│ Your message (Blue Background)  │  #2563EB (Blue-600)
│ White Text                      │  #FFFFFF
└─────────────────────────────────┘

AI Message:
┌─────────────────────────────────┐
│ AI response (Gray Background)   │  #374151 (Slate-700)
│ Light Gray Text                 │  #E2E8F0 (Slate-100)
└─────────────────────────────────┘
```

### Button Colors
```
Microphone (Inactive):
┌──────────────────┐
│ 🎤 (Blue)        │  #3B82F6 (Blue-500)
│ Hover: Lighter   │
└──────────────────┘

Microphone (Active):
┌──────────────────┐
│ 🎤 (Red)         │  #EF4444 (Red-500)
│ Hover: Darker    │
└──────────────────┘

Send Button:
┌──────────────────┐
│ ➤ (Blue)         │  #2563EB (Blue-600)
│ Hover: Darker    │
└──────────────────┘
```

---

## Workflow Diagrams

### Text Input Workflow
```
User Types Question
        ↓
    [Enter/Send]
        ↓
    Loading...
        ↓
AI Response Appears
        ↓
User Can Read or Continue
```

### Voice Input Workflow
```
Click 🎤 Icon
        ↓
Microphone Activates (Red)
        ↓
User Speaks (Hindi)
        ↓
Speech Transcribed
        ↓
Text Appears in Input
        ↓
Click Send or Speak Again
```

### Image Analysis Workflow
```
Click 📷 Icon
        ↓
Select Image File
        ↓
Image Preview Shows
        ↓
Type Question (Optional)
        ↓
Click Send
        ↓
AI Analyzes Image
        ↓
Response with Explanation
```

### Voice Output Workflow
```
AI Responds
        ↓
[Read (Hindi)] Button Appears
        ↓
Click Button
        ↓
Audio Plays (Hindi Voice)
        ↓
[Stop Reading] Button Shows
        ↓
Click to Stop or Wait for End
```

---

## Icon Reference

| Icon | Name | Function |
|------|------|----------|
| 🤖 | Robot | Open AI Tutor |
| 🎤 | Microphone | Voice Input |
| 🔇 | Muted Mic | Mic Off |
| 📷 | Camera | Image Upload |
| ➤ | Send | Send Message |
| 🔊 | Speaker | Read Message |
| 🔇 | Muted Speaker | Stop Reading |
| ✕ | Close | Close AI Tutor |
| ▼ | Dropdown | Select Model |

---

## Font Sizes

```
Header Title:
"AI Tutor"              24px Bold

Subtitle:
"1-on-1 Discussion"     14px Regular

Messages:
User/AI Text           18px Regular

Input Field:
Placeholder Text       18px Regular

Buttons:
Button Text            16px Medium

Model Dropdown:
Text                   14px Regular
```

---

## Spacing & Layout

### Padding
```
Container:        24px (p-6)
Message Box:      24px (p-6)
Button:           16px (p-4)
Input Field:      24px (px-6, py-4)
```

### Margins
```
Between Messages:  24px (space-y-6)
Between Buttons:   12px (gap-3)
Header Border:     1px
```

### Border Radius
```
Container:        16px (rounded-2xl)
Messages:         24px (rounded-3xl)
Buttons:          12px (rounded-xl)
Input:            12px (rounded-xl)
```

---

## Responsive Behavior

### Desktop (1920px+)
```
┌─────────────────────────────────────────────────────┐
│ Full Width Interface                                │
│ Max Width: 1024px (max-w-4xl)                       │
│ Centered on Screen                                  │
└─────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌──────────────────────────────────┐
│ Adjusted Width                   │
│ Smaller Padding                  │
│ Readable Fonts                   │
└──────────────────────────────────┘
```

### Mobile (< 768px)
```
┌────────────────────┐
│ Full Screen        │
│ Minimal Padding    │
│ Touch-Friendly     │
│ Buttons Larger     │
└────────────────────┘
```

---

## Animation Effects

### Hover Effects
```
Button Hover:
  Scale: 1.05
  Opacity: 0.9
  Duration: 0.3s

Icon Hover:
  Scale: 1.1
  Duration: 0.3s
```

### Loading Animation
```
Send Button (Loading):
  Icon: Spinning
  Duration: Infinite
  Speed: 1s per rotation
```

### Message Appearance
```
New Message:
  Fade In: 0.3s
  Slide Up: 0.3s
  Easing: ease-out
```

---

## Accessibility Features

### Keyboard Navigation
```
Tab:        Navigate between elements
Enter:      Send message
Spacebar:   Toggle voice input
Escape:     Close (future)
```

### Screen Reader
```
Buttons:    Have descriptive labels
Images:     Have alt text
Messages:   Announced as they appear
Status:     Updates announced
```

### Visual Accessibility
```
Contrast:   WCAG AA compliant
Font Size:  18px minimum
Colors:     Not only indicator
Icons:      Have text labels
```

---

## Error States

### No Models Available
```
┌─────────────────────────────────┐
│ ⚠️ Error                        │
│ No models available             │
│ Make sure Ollama is running     │
│ Start with: ollama serve        │
└─────────────────────────────────┘
```

### Connection Error
```
┌─────────────────────────────────┐
│ ⚠️ Error                        │
│ Failed to get response          │
│ Check if Ollama is running      │
└─────────────────────────────────┘
```

### Microphone Error
```
┌─────────────────────────────────┐
│ ⚠️ Microphone Error             │
│ Check browser permissions       │
│ Ensure microphone is connected  │
└─────────────────────────────────┘
```

---

## Loading States

### Waiting for Response
```
┌─────────────────────────────────┐
│ User: What is Python?           │
│                                 │
│ AI: [⟳ Loading...]             │
└─────────────────────────────────┘
```

### Voice Recording
```
Microphone Icon: 🎤 (Red, Pulsing)
Status: "Recording..."
```

### Image Upload
```
Image Preview: [Loading...]
Status: "Processing image..."
```

---

## Success States

### Message Sent
```
✓ Message appears in chat
✓ Input field clears
✓ Scroll to latest message
✓ Ready for next input
```

### Voice Recorded
```
✓ Text appears in input
✓ Microphone stops
✓ Ready to send
```

### Image Uploaded
```
✓ Preview shows
✓ Can remove with X
✓ Ready to send
```

### Response Received
```
✓ Message appears
✓ Read button available
✓ Can continue conversation
```

---

## Dark Mode Support

### Colors
```
Background:     #111827 (Gray-900)
Surface:        #1F2937 (Gray-800)
Text:           #F3F4F6 (Gray-100)
Accent:         #3B82F6 (Blue-500)
```

### Contrast
```
Text on Background:  WCAG AAA
Buttons:            WCAG AA
Borders:            Visible
```

---

## Print Layout

### Printable Chat
```
┌─────────────────────────────────┐
│ AI Tutor Conversation           │
│ Date: [Date]                    │
│                                 │
│ Q: User question                │
│ A: AI response                  │
│                                 │
│ Q: Next question                │
│ A: Next response                │
└─────────────────────────────────┘
```

---

## Summary

The AI Tutor interface is designed with:
- ✅ Large, readable fonts
- ✅ Clear visual hierarchy
- ✅ Intuitive layout
- ✅ Accessible colors
- ✅ Smooth animations
- ✅ Professional appearance
- ✅ Mobile responsive
- ✅ Dark mode support

**Result: Easy to use, pleasant to look at, accessible to all users.**
