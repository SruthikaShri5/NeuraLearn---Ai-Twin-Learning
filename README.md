# NeuraLearn — AI Learning Twin

> **Adaptive learning for every student, every ability.**
> An AI-powered Progressive Web App for specially-abled students from Class 1 to Class 12.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-blue?style=flat-square)](https://neuralearn-frontend-m0q3.onrender.com)
[![Backend API](https://img.shields.io/badge/Backend%20API-FastAPI-green?style=flat-square)](https://neuralearn-backend.onrender.com/api/health)
[![GitHub](https://img.shields.io/badge/GitHub-NeuraLearn-black?style=flat-square)](https://github.com/SruthikaShri5/NeuraLearn---Ai-Twin-Learning)

---

## 🧠 What is NeuraLearn?

NeuraLearn is an AI-powered adaptive learning platform that creates a personal **"Learning Twin"** for each student. It personalises the entire learning experience — content format, UI style, voice speed, emotional support, and pacing — based on each student's grade level, disability type, and real-time emotional state.

**Built for:** Specially-abled students (visual, hearing, motor, cognitive, speech disabilities)
**Curriculum:** CBSE/ICSE aligned, Class 1–12 (38+ lessons across Mathematics, Science, Environmental Studies)
**Roles:** Student · Teacher · Parent

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

### ♿ Disability-Adaptive Learning
| Disability | What Changes |
|---|---|
| Visual | Auto TTS on load, read-aloud buttons, adaptive voice speed |
| Hearing | No audio, visual step-by-step cards with icons |
| Motor | Keyboard-only quiz (press 1-4), large tap targets |
| Cognitive | Bite-sized steps, hint system, one concept at a time |
| Speech | Text-only interactions, no speaking required |

### 🤖 AI Features
- **Emotion Detection** — Webcam-based facial analysis (brightness/motion heuristics) with simulated fallback
- **Adaptive TTS Speed** — frustrated→0.8x, tired→0.85x, neutral→0.9x, happy→1.0x, bored→1.2x
- **AI Companion "Neura"** — Canvas orb (senior) or mascot (junior) that mirrors emotional state
- **AI Tutor** — Gemini 2.0 Flash powered chat with image upload support (attach textbook photos)
- **Spaced Repetition** — SM-2 algorithm schedules reviews at optimal intervals
- **Mood Picker** — Manual self-report every 3 quizzes with mismatch detection

### 🎮 Gamification
- XP points, levels, streaks, achievements
- Focus Tree — grows every minute in focus mode, awards +50 XP at 25 min
- Confetti on quiz scores ≥ 80%
- Streak flame particle animation

### 👩‍🏫 Teacher Dashboard
- Student roster with XP, streak, avg score, last active
- Live Classroom Heatmap (green/yellow/red, polls every 30s)
- At-risk student report (multi-factor: score, inactivity, streak)
- Misconception Heatmap — **real per-student, per-lesson scores** from actual submissions
- Direct messaging to students
- Broadcast announcements to class
- Class creation with 8-character join codes
- Assignment creation with grading

### 👨‍👩‍👧 Parent Dashboard
- Child progress tracking with Recharts session graphs
- Tip of the Day (rule-based, daily rotation)
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

---

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

### Backend
| Technology | Purpose |
|---|---|
| FastAPI | REST API framework |
| Uvicorn | ASGI server |
| Motor | Async MongoDB driver |
| PyJWT + bcrypt | Auth tokens + password hashing |
| httpx | Gemini API calls |
| Pydantic | Request/response validation |
| SMTP | Password reset emails (optional) |

### Infrastructure
| Service | Purpose |
|---|---|
| MongoDB Atlas | Cloud database |
| Render | Backend + Frontend hosting |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB Atlas account

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
ADMIN_EMAIL=admin@neuralearn.com
ADMIN_PASSWORD=Admin123!
GEMINI_API_KEY=your-gemini-key-optional
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
│   ├── server.py              # Main FastAPI app (55+ endpoints)
│   ├── connections_router.py  # Class/messaging/PTM endpoints (24 endpoints)
│   ├── curriculum_data.py     # 38+ CBSE lessons (Class 1-12)
│   ├── seed_cbse_curriculum.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── App.js             # Routing + keyboard shortcuts
        ├── pages/             # 13 page components
        ├── components/        # 27 feature components
        │   ├── AICompanion.js      # Canvas orb with emotion colours
        │   ├── AITutor.js          # Gemini chat + image upload
        │   ├── EmotionDetector.js  # Webcam analysis
        │   ├── MisconceptionHeatmap.js  # Real data heatmap
        │   ├── VirtualTour.js      # Guided onboarding tour
        │   ├── FocusMode.js + FocusTree.js
        │   ├── VoiceNav.js         # 15+ voice commands
        │   ├── StudyRoadmap.js     # D3 skill tree
        │   └── ui/            # 45 Radix UI primitives
        └── lib/
            ├── store.js       # Zustand state
            ├── auth-context.js
            ├── api.js         # Axios + JWT interceptors
            ├── tts.js         # Adaptive TTS speed
            └── offlineDB.js   # Dexie IndexedDB
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

## 🌐 API Endpoints (55+)

| Category | Endpoints |
|---|---|
| Auth | register, login, logout, refresh, me, forgot-password, reset-password |
| User | update profile, update settings |
| Lessons | list (grade-filtered), get by id, submit quiz |
| Spaced Repetition | due reviews, full schedule |
| Knowledge Graph | concepts (grade-filtered), mastery |
| Analytics | session data, mastery stats |
| Teacher | students, class analytics, lessons, risk report, misconceptions, live status, concept-mastery |
| Parent | children progress (with avg_score), grade lessons |
| AI | tutor chat (Gemini 2.0 Flash + image), legacy tutor |
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

`"next question"` · `"show hint"` · `"read aloud"` · `"stop reading"` · `"focus mode"` · `"breathe"` · `"open tour"` · `"dashboard"` · `"knowledge graph"` · `"analytics"` · `"settings"` · `"submit"`

---

## 🚢 Deployment (Render)

### Backend (Web Service)
- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn server:app --host 0.0.0.0 --port $PORT`
- **Environment variables:** Set all vars from `.env` in Render dashboard

### Frontend (Static Site)
- **Build command:** `cd frontend && npm install && npm run build`
- **Publish directory:** `frontend/build`
- **Environment variable:** `REACT_APP_BACKEND_URL=https://your-backend.onrender.com`

---

## 🔐 Security

- JWT access tokens (1 hour) + refresh tokens (7 days) via HTTP-only cookies
- bcrypt password hashing (cost factor 12)
- Role-based route protection (student / teacher / parent / admin)
- Input validation with Pydantic
- CORS restricted to known origins + `FRONTEND_URL` env var
- Password reset via time-limited tokens (1 hour TTL, stored in MongoDB)
- Optional SMTP email delivery for password reset links

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

*Made with ❤️ for inclusive education — Team TECHIVA*
