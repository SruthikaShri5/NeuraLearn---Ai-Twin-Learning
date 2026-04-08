# NeuraLearn - Product Requirements Document

## Original Problem Statement
NeuraLearn is a PWA adaptive learning ecosystem for specially-abled students. Combines cognitive-emotional AI, knowledge graph, multi-modal input, haptic feedback, and predictive intervention. Targets Class 1-12 + College learners. Must be WCAG AAA accessible.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async)
- **Frontend**: React 19 + Tailwind CSS + Shadcn/UI
- **Auth**: JWT with httpOnly cookies + Bearer token
- **State**: Zustand (client), MongoDB (server)
- **Charts**: Recharts (analytics), D3.js (knowledge graph)
- **Animations**: CSS keyframes, react-confetti
- **Font**: Fredoka (headings) + Nunito (body)

## User Personas
1. **Specially-abled students** (visual, hearing, motor, cognitive, speech disabilities)
2. **Students Class 1-12** learning Math & Science
3. **College students** across Science, Commerce, Arts streams

## Core Requirements (Implemented - Apr 7, 2026)
### Authentication
- [x] Signup with multi-step form (basic info, profile, avatar selection)
- [x] Login with email/password
- [x] JWT access + refresh tokens (httpOnly cookies)
- [x] Protected routes
- [x] Logout
- [x] Password reset flow
- [x] Admin seeding

### Pages & Navigation
- [x] Landing Page with hero, features, community section
- [x] Login Page
- [x] Signup Page (3-step with 12 avatars)
- [x] Onboarding Wizard (4 steps: welcome, accessibility, input modes, goals)
- [x] Dashboard (XP, streak, level, badges, lessons grid, quick actions)
- [x] Lesson Page (learn phase → quiz phase → results with confetti)
- [x] Knowledge Graph (D3.js force-directed, 56 concepts, color-coded mastery)
- [x] Analytics Page (4 Recharts: daily sessions, mastery scores, distribution, session count)
- [x] Settings Page (accessibility, haptic, sound, input channels, privacy)
- [x] 404 Page (mascot + Go Home)
- [x] Breathing Interface (4-7-8 pattern with animated orb)

### Content
- [x] 56 knowledge concepts (28 math + 28 science, Class 1-12)
- [x] 6 seed lessons with quizzes (5 questions each)
- [x] Mastery tracking per concept
- [x] XP + scoring system

### Accessibility (WCAG AAA)
- [x] Skip-to-main-content link
- [x] ARIA labels and roles
- [x] Keyboard focus indicators (3px ring)
- [x] High contrast mode toggle
- [x] Reduce motion toggle
- [x] Font size options (small/medium/large/extra-large)
- [x] data-testid on all interactive elements

### Design System
- [x] Pastel palette: Sunshine Yellow, Lavender Mist, Mint Breeze, Coral Glow, Sky Blue, Peach Cream
- [x] Neo-brutalist cards with 2px borders + offset shadows
- [x] 56px+ touch targets
- [x] Fredoka + Nunito fonts

## P0 Backlog (Next Phase)
- [x] PWA manifest.json + service worker for offline
- [x] More lesson content (10 total: addition, subtraction, multiplication, fractions, matter, living things, energy, algebra, cells, Newton's laws, quadratic equations, photosynthesis, trigonometry)
- [x] Emotion detection UI (webcam + canvas heuristics, simulated fallback)
- [x] 3D AI Companion (Three.js animated orb with particle orbits, canvas fallback)
- [x] Responsive soundscape (Web Audio API — focus, calm, energize, nature presets)
- [x] Haptic vibration patterns (Vibration API — correct, wrong, complete, click, breathe)
- [x] Real spaced-repetition algorithm (SM-2 on backend, due reviews on dashboard)
- [x] Streak flame animation (Canvas particle system)
- [ ] TensorFlow.js LSTM intervention engine

## P1 Backlog
- [ ] Federated peer-to-peer learning stats (WebRTC)
- [ ] Multi-modal input fusion (gaze, voice, gesture)
- [ ] Interactive 3D progress landscape
- [ ] Parent/guardian account linking
- [ ] Social OAuth (Google/Microsoft)

## P2 Backlog
- [ ] Code splitting per route
- [ ] Lighthouse PWA 90+ score
- [ ] Full curriculum (all subjects, all grades)
- [ ] Export learning data
- [ ] Streak flame animation + particle effects
