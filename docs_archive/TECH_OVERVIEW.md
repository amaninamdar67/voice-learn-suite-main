# Voice Learn Suite - Technology Overview

## Project Summary
Voice Learn Suite is a comprehensive Learning Management System (LMS) with integrated AI tutoring capabilities, voice navigation, and multi-role support (Students, Teachers, Mentors, Parents, Admins).

---

## Core Technology Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Supabase Client** - Real-time database and auth

### Backend
- **Node.js + Express** - REST API server
- **Supabase** - PostgreSQL database with RLS (Row Level Security)
- **JWT Authentication** - Secure user sessions

### AI & Voice Features
- **Groq API** - Fast text analysis and Q&A (FREE tier)
- **Google Gemini** - Image and document analysis (FREE tier, 60 req/min)
- **Perplexity AI** - Advanced document understanding (FREE tier available)
- **Claude API** - Image analysis and complex reasoning (optional)
- **Web Speech API** - Browser-native voice input/output
- **Whisper** - Speech-to-text transcription

---

## AI Integration Architecture

### How AI Features Connect

```
User Input (Text/Image/Voice)
    ↓
Frontend Component (AITutorNew.tsx)
    ↓
Backend Route (ai-tutor-routes.js)
    ↓
AI Provider Selection (Groq/Gemini/Perplexity/Claude)
    ↓
API Call with Context
    ↓
Response Processing & Storage
    ↓
Frontend Display + Voice Output
```

### AI Provider Selection Logic
- **Groq** - Default for text analysis (fastest, free)
- **Gemini** - Image/document analysis (free tier)
- **Perplexity** - Complex document queries (free tier)
- **Claude** - Premium image analysis (optional)

---

## Key Backend Files & Their Purpose

### AI Routes
| File | Purpose |
|------|---------|
| `backend/ai-tutor-routes.js` | Main AI tutor endpoint - handles text queries, context management |
| `backend/ai-tutor-sessions-routes.js` | Session management for AI tutor conversations |
| `backend/groq-ai-routes.js` | Groq API integration - text analysis |
| `backend/gemini-ai-routes.js` | Google Gemini integration - image/document analysis |
| `backend/perplexity-ai-routes.js` | Perplexity AI integration - advanced document understanding |
| `backend/claude-ai-routes.js` | Claude API integration - premium image analysis |

### Core System Routes
| File | Purpose |
|------|---------|
| `backend/server.js` | Main Express server setup, middleware, route mounting |
| `backend/messaging-routes.js` | User-to-user messaging system |
| `backend/mentor-routes.js` | Mentor dashboard and management |
| `backend/teacher-routes.js` | Teacher content management |
| `backend/announcements-routes.js` | System announcements |
| `backend/mentor-parent-messaging.js` | Mentor-parent communication |
| `backend/lms-routes.js` | LMS core features (lessons, quizzes, assignments) |

### Voice & Navigation
| File | Purpose |
|------|---------|
| `backend/voice-server.js` | Voice command processing |
| `backend/whisper-voice-server.js` | Whisper speech-to-text integration |

### Admin & Linking
| File | Purpose |
|------|---------|
| `backend/admin-linking-routes.js` | Admin user linking and role management |
| `backend/parent-mentor-routes.js` | Parent-mentor relationship management |

---

## Key Frontend Components & Their Purpose

### AI Tutor Components
| File | Purpose |
|------|---------|
| `src/components/AITutor/AITutorNew.tsx` | Main AI tutor chat interface - text-based Q&A |
| `src/components/AITutor/AITutorEnhanced.tsx` | Enhanced version with voice and image support |
| `src/pages/AITutorPage.tsx` | Dedicated AI tutor page |
| `src/hooks/useAITutorAnalysis.ts` | Hook for AI analysis logic |

### Communication Components
| File | Purpose |
|------|---------|
| `src/pages/Messages.tsx` | Main messaging interface |
| `src/pages/Mentor/MentorCommunication.tsx` | Mentor messaging |
| `src/pages/Parent/ParentMentorCommunication.tsx` | Parent-mentor chat |
| `src/components/MentorParent/MentorParentChat.tsx` | Reusable chat component |

### Voice & Navigation
| File | Purpose |
|------|---------|
| `src/hooks/useVoiceContent.ts` | Voice input/output handling |
| `src/hooks/useWhisperVoiceNavigation.ts` | Whisper integration for voice commands |
| `src/hooks/useEnhancedVoiceNavigation.ts` | Advanced voice navigation |
| `src/components/VoiceSettings/VoiceSettingsPanel.tsx` | Voice settings UI |

### Layout & UI
| File | Purpose |
|------|---------|
| `src/components/Layout/MainLayout.tsx` | Main app layout wrapper |
| `src/components/Layout/Sidebar.tsx` | Navigation sidebar |
| `src/components/Layout/TopBar.tsx` | Header with user info |
| `src/components/Layout/NotificationPanel.tsx` | Notifications display |
| `src/contexts/ThemeContext.tsx` | Dark/light mode management |

### Dashboard Pages
| File | Purpose |
|------|---------|
| `src/pages/Student/StudentDashboard.tsx` | Student home page |
| `src/pages/Teacher/TeacherDashboard.tsx` | Teacher home page |
| `src/pages/Mentor/MentorDashboard.tsx` | Mentor home page |
| `src/pages/Parent/ParentDashboard.tsx` | Parent home page |
| `src/pages/Admin/AdminDashboard.tsx` | Admin control panel |

---

## Database Schema Files

### Core Tables
| File | Purpose |
|------|---------|
| `database/11_lms_core_schema.sql` | Lessons, quizzes, assignments core tables |
| `database/12_lms_tracking_schema.sql` | User progress tracking |
| `database/13_lms_videos_rankings.sql` | Video content and rankings |
| `database/14_assignments_schema.sql` | Assignment management |
| `database/15_community_schema.sql` | Community features |

### User & Relationship Tables
| File | Purpose |
|------|---------|
| `database/21_parent_mentor_linking.sql` | Parent-mentor relationships |
| `database/25_parent_child_link.sql` | Parent-child relationships |
| `database/26_mentor_student_link.sql` | Mentor-student relationships |
| `database/42_create_student_links_table.sql` | Student linking table |

### AI & Messaging
| File | Purpose |
|------|---------|
| `database/75_user_messages_table.sql` | User messaging storage |
| `database/76_add_announcement_tag.sql` | Announcement tagging |
| `database/77_ai_tutor_sessions.sql` | AI tutor conversation history |

### System Configuration
| File | Purpose |
|------|---------|
| `database/10_system_config.sql` | System settings and configuration |
| `database/03_domains_schema.sql` | Multi-domain/subdomain support |
| `database/20_add_super_admin_role.sql` | Admin role definitions |

### Security & Maintenance
| File | Purpose |
|------|---------|
| `database/FIX_RLS_POLICIES.sql` | Row-level security policies |
| `database/30_fix_rls_for_admin_deletes.sql` | Admin delete permissions |
| `database/31_disable_rls_admin_tables.sql` | Admin table access |

---

## How AI Features Work

### 1. Text-Based AI Tutor (AITutorNew.tsx)
```
User Types Question
    ↓
Frontend sends to /api/ai-tutor/analyze
    ↓
Backend routes to appropriate AI provider
    ↓
AI generates response with context
    ↓
Response stored in ai_tutor_sessions table
    ↓
Frontend displays with optional voice output
```

### 2. Image/Document Analysis
```
User Uploads Image/Document
    ↓
Frontend sends to /api/gemini/analyze or /api/perplexity/analyze
    ↓
AI provider analyzes content
    ↓
Structured response returned
    ↓
Results displayed in UI
```

### 3. Voice Integration
```
User Speaks
    ↓
Web Speech API captures audio
    ↓
Whisper transcribes to text
    ↓
Text sent to AI tutor
    ↓
Response generated
    ↓
Text-to-speech plays response
```

---

## API Endpoints Summary

### AI Tutor Endpoints
- `POST /api/ai-tutor/analyze` - Text analysis
- `POST /api/ai-tutor/sessions` - Session management
- `GET /api/ai-tutor/sessions/:id` - Get session history

### AI Provider Endpoints
- `POST /api/groq/analyze` - Groq text analysis
- `POST /api/gemini/analyze` - Gemini image analysis
- `POST /api/perplexity/analyze` - Perplexity document analysis
- `POST /api/claude/analyze` - Claude image analysis

### Messaging Endpoints
- `POST /api/messages` - Send message
- `GET /api/messages` - Get messages
- `DELETE /api/messages/:id` - Delete message

### Mentor/Parent Endpoints
- `GET /api/mentor/students` - Get mentor's students
- `POST /api/mentor/message` - Send mentor message
- `GET /api/parent/children` - Get parent's children

---

## Environment Configuration

### Required .env Variables
```
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Providers
GROQ_API_KEY=your_groq_key
GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key
CLAUDE_API_KEY=your_claude_key (optional)

# Frontend
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## File Organization

```
voice-learn-suite/
├── backend/                    # Express server & routes
│   ├── ai-tutor-routes.js     # Main AI tutor
│   ├── groq-ai-routes.js      # Groq integration
│   ├── gemini-ai-routes.js    # Gemini integration
│   ├── perplexity-ai-routes.js # Perplexity integration
│   └── [other routes]
├── src/
│   ├── components/
│   │   ├── AITutor/           # AI tutor UI
│   │   ├── Layout/            # Main layout
│   │   └── [other components]
│   ├── pages/                 # Page components
│   ├── hooks/                 # Custom hooks
│   ├── contexts/              # React contexts
│   └── lib/                   # Utilities
├── database/                  # SQL migration files
├── docs_archive/              # Archived documentation
└── TECH_OVERVIEW.md          # This file
```

---

## Key Features

### For Students
- AI tutor for Q&A and learning support
- Voice-based navigation
- Video lessons and quizzes
- Assignment submission
- Progress tracking

### For Teachers
- Content management (lessons, quizzes, assignments)
- Student performance analytics
- Class management
- Announcement system

### For Mentors
- Student mentoring sessions
- Progress monitoring
- Parent communication
- Performance analytics

### For Parents
- Child progress tracking
- Mentor communication
- Performance reports
- Announcements

### For Admins
- User management
- System configuration
- Domain/subdomain management
- Analytics and reporting

---

## Deployment Notes

1. **Database**: Supabase PostgreSQL with RLS enabled
2. **Frontend**: Vite build → static hosting (Vercel/Netlify)
3. **Backend**: Node.js server (Heroku/Railway/VPS)
4. **AI APIs**: Requires API keys from Groq, Gemini, Perplexity
5. **Voice**: Browser-native Web Speech API (no server needed)

---

## Performance Considerations

- **Groq** is fastest for text (default choice)
- **Gemini** has rate limits (60 req/min free tier)
- **Perplexity** best for complex documents
- **Claude** premium but most capable
- Voice processing happens client-side (Web Speech API)
- Database queries optimized with RLS policies

---

## Security

- JWT-based authentication
- Row-level security (RLS) on all tables
- API keys stored in environment variables
- Service role key for admin operations only
- User data isolated by subdomain/organization

---

For detailed setup and implementation guides, see the archived documentation in `docs_archive/` folder.
