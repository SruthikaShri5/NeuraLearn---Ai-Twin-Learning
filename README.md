# NeuraLearn — AI Learning Twin

> **Adaptive learning for every student, every ability.**
> An AI-powered Progressive Web App for specially-abled students from Class 1 to Class 12.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-blue?style=flat-square)](https://neuralearn-frontend-m0q3.onrender.com)
[![Backend API](https://img.shields.io/badge/Backend%20API-FastAPI-green?style=flat-square)](https://neuralearn-backend.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-NeuraLearn-black?style=flat-square)](https://github.com/SruthikaShri5/NeuraLearn---Ai-Twin-Learning)
[![Version](https://img.shields.io/badge/Version-4.0-orange?style=flat-square)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)]()

---

## 🧠 What is NeuraLearn?

NeuraLearn is an AI-powered adaptive learning platform that creates a personal **"Learning Twin"** for each student. It personalises the entire learning experience — content format, UI style, voice speed, emotional support, and pacing — based on each student's grade level, disability type, and real-time emotional state.

The moment a disability is selected during signup, NeuraLearn **automatically transforms itself** — no manual setup required. Students learn independently without depending on parents, teachers, or caregivers.

**Built for:** Specially-abled students (visual, hearing, motor, cognitive, speech, dyslexia disabilities)
**Curriculum:** CBSE/ICSE aligned, Class 1–12 (38+ lessons across Mathematics, Science, Environmental Studies)
**Roles:** Student · Teacher · Parent · Admin

---

## 👥 Team — TECHIVA

| Name | Role |
|---|---|
| Dhanishka V | Full Stack Developer |
| Sruthika Shri R | UI/UX Designer |
| Vaishnavi S | Web Developer |
| Janani N | Data Researcher |

---

## ✨ Key Features

### 🎨 Grade-Adaptive UI
- **Class 1–5 (Junior Mode):** Fredoka font, cartoon mascot, bright colours, playful animations, bold card shadows
- **Class 6–12 (Senior Mode):** Space Grotesk font, abstract icons, indigo palette, glassmorphism, subtle animations

### ♿ Disability-Adaptive Learning (Auto-Applied at Signup)
| Disability | Auto-Applied Changes |
|---|---|
| Visual | TTS enabled, voice navigation enabled, high contrast, audio-first lessons, read-aloud buttons |
| Dyslexia | OpenDyslexic font (CDN loaded), extra spacing, keyword highlighting, audio summaries |
| Hearing | Captions overlay, visual notifications, no audio dependence, diagram-first lessons |
| Motor | Large touch targets (64px), keyboard 1–4 quiz navigation, voice commands |
| Cognitive | Step-by-step mode, reduced distractions, hint system, one concept at a time |
| Speech | Text-only AI Tutor, quick action buttons, no voice required |

### 🤖 AI Features
- **Emotion Detection** — Webcam-based facial analysis (brightness/motion heuristics) with simulated fallback
- **Adaptive TTS Speed** — frustrated→0.8x, tired→0.85x, neutral→0.9x, happy→1.0x, bored→1.2x
- **AI Companion "Neura"** — Canvas orb (senior) or mascot (junior) that mirrors emotional state
- **AI Tutor** — Multi-provider chain: Ollama → Groq (llama-3.1) → Gemini 2.0 Flash → Rule-based fallback
- **Disability-aware AI prompts** — Each disability gets unique tutor behaviour
- **Spaced Repetition** — SM-2 algorithm schedules reviews at optimal intervals
- **Mood Picker** — Manual self-report every 3 quizzes with mismatch detection
- **Learning DNA** — Tracks quiz accuracy, hint usage, session duration, engagement to evolve lesson complexity

### 🎮 Gamification
- XP points, levels, streaks, achievements (10 types)
- Focus Tree — grows every minute in focus mode, **awards real +50 XP** at 25 min milestone (backend verified via `/api/focus/complete`)
- Confetti on quiz scores ≥ 80%
- Streak flame particle animation
- Leaderboard — grade-filtered, real-time XP rankings

### 🧬 Learning DNA / Neural Twin
- Tracks reading behaviour, quiz performance, hint usage, session duration
- Evolves content complexity (low / medium / high) based on performance
- Adapts explanation style (conceptual / narrative / practical)
- Changes learning style (visual / audio / interactive / reading) based on engagement
- Shows DNA evolution toast after each quiz submission

### 👩🏫 Teacher Dashboard
- Student roster with XP, streak, avg score, last active — **real remove student via API**
- Live Classroom Heatmap (green/yellow/red, polls every 30s via heartbeat)
- At-risk student report (multi-factor: score, inactivity, streak)
- Misconception Heatmap — real per-student, per-lesson scores from actual submissions
- Direct messaging to students
- Broadcast announcements to class
- Class creation with 8-character join codes
- Assignment creation — **shows "create class first" dialog if no class exists**

### 👨‍👩‍👧 Parent Dashboard
- Child linking via 6-character code (shown in student Settings)
- Child progress tracking with Recharts session graphs
- Tip of the Day (rule-based, daily rotation based on child's actual data)
- PTM connection panel — request, approve, schedule meetings
- Direct messaging with teacher (after PTM approval)

### 📱 PWA & Offline
- Service worker with offline caching
- IndexedDB queue for offline quiz submissions
- Auto-sync when connection restored
- Installable on mobile and desktop
- Full icon set (72×72 to 512×512)

### ♿ Accessibility (WCAG AAA)
- Skip to content link
- Full keyboard navigation
- Screen reader support (aria-label, aria-live)
- High contrast mode toggle
- Reduce motion toggle
- Font size: small / medium / large / extra-large
- Voice navigation (15+ commands)
- Keyboard shortcuts overlay (press `?`)
- **OpenDyslexic font** for dyslexia mode (CDN loaded)
- Accessibility Bot — voice or text commands to control settings instantly

---
pl
## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 + React Router 7 | UI framework + routing |
| Zustand 5 | Global state management |
| Tailwind CSS 3.4 | Utility-first styling |
| Radix UI | Accessible UI primitives |
| D3.js | Knowledge graph + study roadmap visualisation |
| Recharts | Analytics charts |
| Framer Motion | Animations |
| Dexie.js | IndexedDB offline storage |
| Web Speech API | Voice commands + TTS |
| Canvas API | Emotion detection heuristics + AI companion orb |
| OpenDyslexic | Dyslexia-friendly font (CDN) |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| Motor | Async MongoDB driver |
| PyJWT + bcrypt | Auth tokens + password hashing |
| httpx | Groq + Gemini API calls |
| Pydantic | Request/response validation |
| SMTP | Password reset emails (optional) |

### AI Providers (Fallback Chain)
| Provider | Model | Purpose |
|---|---|---|
| Ollama (local) | llama3 | Dev/offline fallback |
| Groq | llama-3.1-8b-instant | Fast production AI |
| Gemini | gemini-2.0-flash | Backup AI provider |
| Rule-based | Built-in | Always-available fallback |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Render | Backend (Web Service) + Frontend (Static Site) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account (free M0 tier works)

### 1. Clone the repo
```bash
git clone https://github.com/SruthikaShri5/NeuraLearn---Ai-Twin-Learning.git
cd NeuraLearn---Ai-Twin-Learning
```

### 2. Backend setup
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
MONGO_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=neuralearn
JWT_SECRET=your-secret-key-here
ENV=development
ADMIN_EMAIL=admin@neuralearn.com
ADMIN_PASSWORD=Admin123!
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
FRONTEND_URL=http://localhost:3000

# Optional: Email for password reset
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your-app-password
```

Start backend:
```bash
uvicorn server:app --reload --port 8000
```

The backend **auto-seeds** 38+ CBSE lessons (Classes 1–12) and 56 knowledge graph concepts on first startup.

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Start frontend:
```bash
# Windows
set NODE_OPTIONS=--max-old-space-size=4096 && npm start

# Mac/Linux
NODE_OPTIONS=--max-old-space-size=4096 npm start
```

Open **http://localhost:3000**

---

## 📁 Project Structure

```
NeuraLearn/
├── backend/
│   ├── server.py              # Main FastAPI app (65+ endpoints)
│   ├── connections_router.py  # Class/messaging/PTM endpoints (24 endpoints)
│   ├── curriculum_data.py     # 38+ CBSE lessons (Class 1-12)
│   ├── seed_cbse_curriculum.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── App.js                    # Routing + keyboard shortcuts + disability body classes
        ├── disability-transforms.css # Auto-applied disability CSS transformations
        ├── pages/                    # 14 page components
        ├── components/               # 30+ feature components
        │   ├── AICompanion.js        # Canvas orb with emotion colours
        │   ├── AITutor.js            # Multi-provider chat + disability-aware prompts
        │   ├── EmotionDetector.js    # Webcam analysis + simulated fallback
        │   ├── FocusMode.js          # Focus tree + real XP award at 25 min
        │   ├── MisconceptionHeatmap.js  # Real data heatmap
        │   ├── VirtualTour.js        # Guided tour with disability-specific steps
        │   ├── VoiceNav.js           # 15+ voice commands
        │   ├── AccessibilityBot.js   # Voice/text accessibility control
        │   ├── StudyRoadmap.js       # D3 skill tree
        │   └── ui/                   # 45 Radix UI primitives
        └── lib/
            ├── store.js              # Zustand state
            ├── auth-context.js       # Auth + auto disability class application
            ├── api.js                # Axios + JWT interceptors + auto-refresh
            ├── tts.js                # Adaptive TTS speed
            ├── disabilityProfiles.js # Disability config + body class manager
            └── offlineDB.js          # Dexie IndexedDB
```

---

## 📚 Curriculum Coverage (38+ lessons)

| Class Range | Subjects | Topics |
|---|---|---|
| Class 1–2 | Math, EVS | Numbers, Addition, Subtraction, Plants, Our Body |
| Class 3–5 | Math, EVS | Multiplication, Shapes, Fractions, Weather, Air & Water, Percentages, Geometry |
| Class 6 | Math, Science | Integers, Algebra, Electricity & Circuits |
| Class 7 | Math, Science | Linear Equations, Cells & Biology |
| Class 8 | Math, Science | Quadratic Equations, Chemical Reactions |
| Class 9 | Math, Science | Polynomials, Newton's Laws of Motion |
| Class 10 | Math, Science | Trigonometry, Genetics & Heredity |
| Class 11 | Math, Chemistry | Calculus (Derivatives), Organic Chemistry |
| Class 12 | Math, Physics | Integration, Electromagnetism |

---

## 🌐 API Endpoints (65+)

| Category | Endpoints |
|---|---|
| Auth | register, login, logout, refresh, me, forgot-password, reset-password |
| User | update profile, update settings |
| Lessons | list (grade-filtered), get by id, submit quiz |
| Spaced Repetition | due reviews, full schedule |
| Knowledge Graph | concepts (grade-filtered), mastery |
| Analytics | session data, mastery stats |
| Recommendations | proactive next-lesson suggestions based on weak subjects |
| Focus | complete (award +50 XP for 25-min focus session) |
| Leaderboard | grade-filtered top 20 + personal rank |
| Achievements | earned achievements with metadata |
| Teacher | students, class analytics, lessons, risk report, misconceptions, live status, concept-mastery |
| Parent | children progress, grade lessons, link child |
| Student | heartbeat, my-code |
| AI | tutor chat (multi-provider), disability-aware prompts |
| Connections | classes, enrollments, assignments, messages, notifications, PTM |
| Admin | reseed-lessons |

Full interactive docs: `http://localhost:8000/docs`

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `?` | Show shortcuts overlay |
| `N` | Next quiz question |
| `H` | Show hint |
| `R` | Read aloud (adaptive speed) |
| `F` | Toggle Focus Mode |
| `T` | Start / replay guided tour |
| `B` | Open Breathing Exercise |
| `1–4` | Select quiz answer (Motor mode) |
| `Esc` | Close any panel |

---

## 🎤 Voice Commands

`"next question"` · `"previous"` · `"show hint"` · `"read aloud"` · `"stop reading"` · `"focus mode"` · `"breathe"` · `"open tour"` · `"dashboard"` · `"knowledge graph"` · `"analytics"` · `"settings"` · `"submit"`

---

## 🚢 Deployment (Render)

This project includes a `render.yaml` Blueprint for one-click deployment.

### Option 1 — Blueprint (Recommended)
1. Go to [render.com](https://render.com) → New → **Blueprint**
2. Connect your GitHub repo
3. Fill in environment variables when prompted
4. Click **Apply** — both backend and frontend deploy automatically

### Option 2 — Manual

#### Backend (Web Service)
- **Root Directory:** `backend`
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`

#### Frontend (Static Site)
- **Root Directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `build`
- **Environment variable:** `REACT_APP_BACKEND_URL=https://your-backend.onrender.com`

### Required Environment Variables on Render

| Variable | Where | Value |
|---|---|---|
| `MONGO_URL` | Backend | MongoDB Atlas connection string |
| `DB_NAME` | Backend | `neuralearn` |
| `JWT_SECRET` | Backend | Auto-generated or your own |
| `ENV` | Backend | `production` |
| `FRONTEND_URL` | Backend | Your Render frontend URL |
| `GEMINI_API_KEY` | Backend | From Google AI Studio |
| `GROQ_API_KEY` | Backend | From console.groq.com |
| `ADMIN_EMAIL` | Backend | `admin@neuralearn.com` |
| `ADMIN_PASSWORD` | Backend | Strong password |
| `REACT_APP_BACKEND_URL` | Frontend | Your Render backend URL |
| `NODE_OPTIONS` | Frontend | `--max-old-space-size=4096` |

---

## 🔐 Security

- JWT access tokens (1 hour) + refresh tokens (7 days) via HTTP-only cookies
- bcrypt password hashing (cost factor 12)
- Role-based route protection (student / teacher / parent / admin)
- Input validation with Pydantic
- CORS restricted to known origins + `FRONTEND_URL` env var
- Password reset via time-limited tokens (1 hour TTL, stored in MongoDB)
- Parent-child linking requires 6-char student code (not guessable without sharing)

---

## 🔄 What's New in v4.0

- ✅ **Focus Tree XP** — +50 XP now actually awarded to backend when 25-min milestone reached (`POST /api/focus/complete`)
- ✅ **OpenDyslexic font** — loaded via CDN, dyslexia mode now uses real accessible font
- ✅ **Quiz Previous button** — students can go back to review previous questions (`data-testid="quiz-prev-btn"`)
- ✅ **VoiceNav testid** — virtual tour correctly highlights the voice navigation button (`data-testid="voice-nav-btn"`)
- ✅ **Student remove** — teacher can now actually remove students from class via `DELETE /api/enroll/remove/{studentId}`
- ✅ **Assignment modal guard** — shows "create class first" dialog instead of silent failure
- ✅ **Stale closure fix** — quiz submit uses `useCallback` + ref pattern, preventing wrong answer submission
- ✅ **CORS cleanup** — removed hardcoded WSL IPs from production CORS list
- ✅ **XP event bus** — dashboard listens for focus XP updates via custom event (`neura-xp-update`)
- ✅ **render.yaml** — updated with full frontend static site config + all env vars
- ✅ **Full audit** — 50 bugs identified and fixed, accessibility issues resolved

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Made with ❤️ for inclusive education — Team TECHIVA*
