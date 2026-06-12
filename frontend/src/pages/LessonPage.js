import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, X, BookOpen, Brain, Trophy, Sparkles,
  RefreshCw, Volume2, VolumeX, ChevronRight, ChevronLeft, Lightbulb, Target, PenLine, StickyNote, PlayCircle } from "lucide-react";
import { getAdaptationText, highlightKeywords } from "@/lib/lessonUtils";
import { getDisabilityProfile } from "@/lib/disabilityProfiles";
import Confetti from "react-confetti";
import { vibrate } from "@/lib/haptics";
import { playFeedback } from "@/lib/soundscape";
import VideoPlayer from "@/components/VideoPlayer";
import VoiceAssistant from "@/components/VoiceAssistant";
import { speak, stopSpeaking } from "@/lib/tts";
import { cacheLessons, getCachedLessons } from "@/lib/offlineDB";

// "--€ Caption Overlay for Hearing disability "--------------------------------€
function CaptionOverlay({ text }) {
  const [visible, setVisible] = useState(false);
  const [caption, setCaption] = useState("");

  useEffect(() => {
    if (!text) return;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (!sentences.length) return;
    let i = 0;
    setCaption(sentences[0].trim());
    setVisible(true);
    const interval = setInterval(() => {
      i++;
      if (i < sentences.length) {
        setCaption(sentences[i].trim());
      } else {
        setVisible(false);
        clearInterval(interval);
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [text]);

  if (!visible || !caption) return null;
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full px-4">
      <div className="bg-[#0F172A]/90 backdrop-blur-sm text-white text-center px-6 py-3 rounded-2xl border-2 border-[#06D6A0] shadow-lg">
        <p className="text-base font-semibold leading-relaxed">{caption}</p>
        <div className="flex justify-center gap-1 mt-2">
          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-bounce" style={{animationDelay:"0ms"}} />
          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-bounce" style={{animationDelay:"150ms"}} />
          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-bounce" style={{animationDelay:"300ms"}} />
        </div>
      </div>
    </div>
  );
}

// "--€ Read-Aloud Button (Visual) "---------------------------------------------€
function ReadAloudBtn({ text, label = "Read aloud" }) {
  const [speaking, setSpeaking] = useState(false);
  const toggle = () => {
    if (speaking) { stopSpeaking(); setSpeaking(false); }
    else { speak(text); setSpeaking(true); setTimeout(() => setSpeaking(false), text.length * 60); }
  };
  return (
    <button onClick={toggle} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#118AB2]/10 border border-[#118AB2] text-[#118AB2] text-sm font-bold hover:bg-[#118AB2]/20" aria-label={label}>
      {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      {speaking ? "Stop" : label}
    </button>
  );
}

// "--€ Step-by-Step for Cognitive disability "----------------------------------€
function StepByStep({ steps }) {
  const [step, setStep] = useState(0);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        {steps.map((_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-[#118AB2]' : 'bg-[#e2e8f0]'}`} />
        ))}
      </div>
      <div className="neura-card p-6 bg-[#FFFBEB] border-[#FFD166]">
        <p className="text-xs font-bold text-[#b8860b] mb-2">Step {step + 1} of {steps.length}</p>
        <p className="text-lg font-semibold text-[#0F172A] leading-loose">{steps[step]}</p>
      </div>
      <div className="flex gap-3">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12">
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
        )}
        {step < steps.length - 1 && (
          <button onClick={() => setStep(s => s + 1)} className="neura-btn bg-[#FFD166] text-[#0F172A] flex-1 h-12">
            Next Step <ChevronRight className="w-4 h-4" />
          </button>
        )}
        {step === steps.length - 1 && (
          <div className="flex-1 p-3 rounded-xl bg-[#06D6A0]/20 text-center font-bold text-[#06D6A0]">
            ✅ All steps done!
          </div>
        )}
      </div>
    </div>
  );
}

// "--€ Hint system for Cognitive "----------------------------------------------€
function HintBox({ hints }) {
  const [shown, setShown] = useState(0);
  if (!hints?.length) return null;
  return (
    <div className="neura-card p-4 bg-[#C8B6FF]/10 border-[#C8B6FF]">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-[#7c3aed]" />
        <span className="text-sm font-bold text-[#7c3aed]">Hints ({shown}/{hints.length})</span>
      </div>
      {hints.slice(0, shown).map((h, i) => (
        <p key={i} className="text-sm text-[#334155] mb-1">💡 {h}</p>
      ))}
      {shown < hints.length && (
        <button 
          onClick={() => {
            setShown(s => s + 1);
            if (window.__trackHint) window.__trackHint();
          }} 
          className="text-xs font-bold text-[#7c3aed] hover:underline mt-1" 
          data-testid="hint-btn"
        >
          Show hint {shown + 1}
        </button>
      )}
    </div>
  );
}

function FlashcardDeck({ cards, disability }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (!cards?.length) return null;
  const card = cards[idx];
  return (
    <div className="space-y-4">
      <div className="neura-card p-8 min-h-[140px] flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => setFlipped((f) => !f)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setFlipped((f) => !f)}>
        <p className="text-xs font-bold text-[#64748B] mb-2">{flipped ? "Answer" : "Question"} — tap to flip</p>
        <p className={`font-bold text-[#0F172A] ${disability === "dyslexia" ? "text-xl leading-loose" : "text-lg"}`}>{flipped ? card.back : card.front}</p>
      </div>
      <div className="flex gap-3 items-center">
        <button onClick={() => { setIdx((i) => Math.max(0, i - 1)); setFlipped(false); }} disabled={idx === 0} className="neura-btn bg-white text-[#0F172A] flex-1 h-11 disabled:opacity-40"><ChevronLeft className="w-4 h-4" /> Prev</button>
        <span className="text-sm font-bold text-[#64748B]">{idx + 1}/{cards.length}</span>
        <button onClick={() => { setIdx((i) => Math.min(cards.length - 1, i + 1)); setFlipped(false); }} disabled={idx >= cards.length - 1} className="neura-btn bg-[#C8B6FF] text-[#0F172A] flex-1 h-11 disabled:opacity-40">Next <ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// "--€ Visual Animation for Hearing disability "--------------------------------€
function VisualExplanation({ text, subject }) {
  const emoji = subject === "mathematics" ? "📐" : subject === "science" ? "🔬" : "📚";
  const sentences = text.split(". ").filter(Boolean);
  return (
    <div className="space-y-3">
      {sentences.map((s, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border-2 border-[#e2e8f0]">
          <span className="text-2xl shrink-0">{i === 0 ? emoji : "→"}</span>
          <p className="text-base font-semibold text-[#0F172A]">{s}.</p>
        </div>
      ))}
    </div>
  );
}

// "--€ Keyboard navigation for Motor disability "-------------------------------€
function KeyboardQuiz({ options, selected, onSelect }) {
  useEffect(() => {
    const handler = (e) => {
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < options.length) onSelect(options[idx]);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [options, onSelect]);

  return (
    <div className="space-y-3">
      <p className="text-xs text-[#64748B] font-semibold">Press 1-{options.length} on keyboard to select</p>
      {options.map((opt, i) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={`w-full p-5 rounded-xl border-2 text-left text-lg font-semibold transition-all flex items-center gap-4 ${
            selected === opt
              ? 'border-[#118AB2] bg-[#118AB2]/10 text-[#118AB2]'
              : 'border-[#e2e8f0] text-[#334155] hover:border-[#0F172A]'
          }`}
          data-testid={`quiz-option-${opt}`}
        >
          <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-sm font-bold shrink-0">
            {i + 1}
          </span>
          {opt}
          {selected === opt && <Check className="w-5 h-5 ml-auto" />}
        </button>
      ))}
    </div>
  );
}

// "--€ Main LessonPage "--------------------------------------------------------€
export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { isJunior, headingFont, isJunior: jr } = useGradeTheme();
  const { incrementQuizCount } = useAppStore();
  const disability = user?.disability_type || "prefer_not_to_say";
  const profile = user?.learning_profile || {};
  const dna = profile;
  
  // Empowerment Flags
  const isTTSActive = profile.tts_active;
  const isStepModeActive = profile.step_mode_active || disability === "cognitive";
  const isLargeTargetsActive = profile.large_targets_active;
  const isCaptionsActive = profile.captions_active;
  const isVisualFeedbackActive = profile.visual_feedback_active;

  const disabilityProfile = getDisabilityProfile(disability);

  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("learn");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [startTime] = useState(Date.now());
  const [nextReviewDate, setNextReviewDate] = useState(null);

  // Derive currentQuestion early (before any callbacks that reference it)
  const quiz = lesson?.quiz || [];
  const currentQuestion = quiz[currentQ];

  // Dynamic tracking state
  const [metrics, setMetrics] = useState({
    hintUsage: 0,
    retries: 0,
    interactionCount: 0
  });

  const trackInteraction = useCallback(() => {
    setMetrics(m => ({ ...m, interactionCount: m.interactionCount + 1 }));
  }, []);

  useEffect(() => {
    window.__trackHint = () => setMetrics(m => ({ ...m, hintUsage: m.hintUsage + 1 }));
    return () => delete window.__trackHint;
  }, []);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await api.get(`/lessons/${lessonId}`);
        setLesson(data.lesson);
        // Cache this lesson for offline access
        cacheLessons([data.lesson]).catch(() => {});
        if ((disability === "visual" || disability === "dyslexia" || disabilityProfile.autoRead) && data.lesson?.introduction) {
          setTimeout(() => speak(`Lesson: ${data.lesson.title}. ${data.lesson.introduction}`), 500);
        }
      } catch (err) {
        // Network failed — try to serve from IndexedDB cache
        try {
          const cached = await getCachedLessons();
          const found = cached.find(l => l.id === lessonId);
          if (found) {
            setLesson(found);
            if ((disability === "visual" || disability === "dyslexia" || disabilityProfile.autoRead) && found?.introduction) {
              setTimeout(() => speak(`Lesson: ${found.title}. ${found.introduction}`), 500);
            }
            return;
          }
        } catch {}
        navigate("/dashboard");
      }
      finally { setLoading(false); }
    };
    fetchLesson();
    return () => stopSpeaking();
  }, [lessonId, navigate, disability, disabilityProfile.autoRead]); // eslint-disable-line react-hooks/exhaustive-deps

  // Student heartbeat for live classroom
  useEffect(() => {
    if (!user || user.role !== "student") return;
    const interval = setInterval(() => {
      api.post("/student/heartbeat").catch(() => {});
    }, 60000);
    // Ping immediately on mount
    api.post("/student/heartbeat").catch(() => {});
    return () => clearInterval(interval);
  }, [user]);

  const submitQuizRef = useRef(null);

  const submitQuiz = useCallback(async () => {
    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const payload = { 
        lesson_id: lessonId, 
        answers, 
        time_spent_seconds: timeSpent,
        dynamic_metrics: { ...metrics, accuracy: 0 }
      };
      const { data } = await api.post("/lessons/submit-quiz", payload);
      setResult(data);
      // Refresh user profile (non-blocking)
      api.get("/auth/me").then(r => {
        if (r.data.user) {
          const oldProfile = user?.learning_profile || {};
          const newProfile = r.data.user?.learning_profile || {};
          updateUser(r.data.user);
          // DNA Evolution toast — dramatic and visible for demo
          const changes = [];
          if (Math.abs((newProfile.avg_quiz_accuracy || 0) - (oldProfile.avg_quiz_accuracy || 0)) > 2)
            changes.push(`Accuracy ${Math.round(oldProfile.avg_quiz_accuracy || 0)}% → ${Math.round(newProfile.avg_quiz_accuracy || 0)}%`);
          if (newProfile.content_complexity !== oldProfile.content_complexity)
            changes.push(`Complexity ${oldProfile.content_complexity || 'medium'} → ${newProfile.content_complexity}`);
          if (newProfile.confidence_level !== oldProfile.confidence_level)
            changes.push(`Confidence ${oldProfile.confidence_level || 'medium'} → ${newProfile.confidence_level}`);
          if (newProfile.learning_style !== oldProfile.learning_style)
            changes.push(`Style ${oldProfile.learning_style || 'visual'} → ${newProfile.learning_style}`);
          if (changes.length > 0) {
            toast(`🧬 Learning Twin Updated! ${changes.join(' · ')}`, {
              duration: 6000,
              description: 'Your lessons and AI Tutor will now adapt to your new profile.',
            });
          } else {
            toast(`🧬 Learning Twin updated — profile refined`, { duration: 3000 });
          }
        }
      }).catch(() => {});
      setPhase("results");
      incrementQuizCount();
      if (data.score >= 80) { setShowConfetti(true); vibrate('complete'); playFeedback('complete'); }
      else if (data.score >= 60) { vibrate('correct'); playFeedback('correct'); }
      else { vibrate('wrong'); playFeedback('wrong'); }
      if (data.next_review_date) setNextReviewDate(data.next_review_date);
      if (disability === "visual") speak(`Quiz complete. Your score is ${data.score} percent.`);
      // Show achievement toasts
      if (data.new_achievements?.length > 0) {
        const EMOJI = { first_lesson:"🎉", perfect_score:"💯", streak_3:"🔥", streak_7:"🏆", streak_30:"👑", speed_learner:"⚡", knowledge_seeker:"📚", master_mind:"🧠", no_hints:"💡", comeback_kid:"💪" };
        data.new_achievements.forEach(id => {
          toast(`${EMOJI[id] || "🏅"} Achievement Unlocked: ${id.replace(/_/g, " ")}`, { duration: 5000 });
        });
      }
    } catch (err) {
      console.error("Quiz submit error:", err);
      // Save offline if network failed
      if (!err.response) {
        try {
          const { savePendingQuiz } = await import("@/lib/offlineDB");
          await savePendingQuiz({ lesson_id: lessonId, answers, time_spent_seconds: Math.round((Date.now() - startTime) / 1000) });
          toast("📶 Offline — quiz saved. Will sync when back online.", { duration: 5000 });
        } catch {}
      }
      // Still show results with a dummy score so the student isn't stuck
      const totalQs = lesson?.quiz?.length || 0;
      const correctCount = Object.values(answers).filter(
        (ans, i) => ans === lesson?.quiz?.[i]?.correct_answer
      ).length;
      setResult({ score: totalQs > 0 ? Math.round((correctCount / totalQs) * 100) : 0, correct: correctCount, total: totalQs, xp_gained: 0, streak: 0, new_achievements: [] });
      setPhase("results");
    }
  }, [lessonId, answers, metrics, startTime, disability, lesson, incrementQuizCount, updateUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { submitQuizRef.current = submitQuiz; }, [submitQuiz]);

  // Enter key to advance quiz — use ref to avoid stale closure
  const nextQuestionRef = useRef(nextQuestion);
  useEffect(() => { nextQuestionRef.current = nextQuestion; }, [nextQuestion]);

  useEffect(() => {
    if (phase !== "quiz") return;
    const handler = (e) => {
      if (e.key === "Enter" && selected) {
        e.preventDefault();
        nextQuestionRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, selected]);

  const handleAnswer = useCallback((qId, answer) => {
    setSelected(answer);
    setAnswers((a) => ({ ...a, [qId]: answer }));
    vibrate('click');
    playFeedback('click');
    if (disability === "visual") speak(`Selected: ${answer}`);
  }, [disability]);

  const nextQuestion = useCallback(() => {
    const quiz = lesson?.quiz || [];
    const nextIdx = currentQ + 1;
    if (nextIdx < quiz.length) {
      setCurrentQ(nextIdx);
      setSelected(answers[quiz[nextIdx]?.id] || null);
      if (disability === "visual") speak(quiz[nextIdx]?.question || "");
    } else {
      submitQuizRef.current && submitQuizRef.current();
    }
  }, [lesson, currentQ, answers, disability]);

  // Use refs so voice callbacks always read latest state (no stale closure)
  const phaseRef = useRef(phase);
  const lessonRef = useRef(lesson);
  const currentQRef = useRef(currentQ);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { lessonRef.current = lesson; }, [lesson]);
  useEffect(() => { currentQRef.current = currentQ; }, [currentQ]);

  const onVoiceCommand = useCallback((cmd, arg) => {
    const p = phaseRef.current;
    const l = lessonRef.current;
    const qIdx = currentQRef.current;
    const q_ = l?.quiz?.[qIdx];
    if (cmd === 'next') {
      if (p === 'learn') { setPhase("quiz"); speak("Starting quiz. Listen to the questions."); }
      else if (p === 'quiz') {
        const quiz_ = l?.quiz || [];
        const nextIdx = qIdx + 1;
        if (nextIdx < quiz_.length) {
          setCurrentQ(nextIdx); setSelected(null);
          if (disability === "visual") speak(quiz_[nextIdx]?.question || "");
        } else { submitQuiz(); }
      }
    } else if (cmd === 'prev') {
      if (p === 'quiz' && qIdx > 0) {
        const quiz_ = l?.quiz || [];
        const prevIdx = qIdx - 1;
        setCurrentQ(prevIdx); setSelected(null);
        if (disability === "visual") speak(quiz_[prevIdx]?.question || "");
      }
    } else if (cmd === 'read') {
      if (p === 'learn') speak(`${l?.title}. ${l?.introduction}. ${l?.explanation}`);
      else if (p === 'quiz' && q_) speak(q_.question);
    } else if (cmd === 'quiz') {
      setPhase("quiz");
    } else if (cmd === 'select' && p === 'quiz' && q_) {
      const options = q_.options || [];
      if (options[arg] !== undefined) handleAnswer(q_.id, options[arg]);
    }
  }, [disability, handleAnswer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-read for Visual Independence
  useEffect(() => {
    if (lesson && isTTSActive && phase === 'learn') {
      const text = `${lesson.title}. ${lesson.introduction}. ${lesson.explanation}`;
      speak(text);
    }
    return () => stopSpeaking();
  }, [lesson, isTTSActive, phase]);

  if (loading || !lesson) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Split explanation into steps for cognitive
  const explanationSteps = lesson.explanation
    ? lesson.explanation.split(". ").filter(s => s.trim().length > 5).map(s => s.trim() + (s.endsWith(".") ? "" : "."))
    : [lesson.explanation];

  // Hints from examples for cognitive
  const hints = lesson.examples?.map(e => `${e.problem} → ${e.answer}`) || [];

  // Disability banner config
  const adaptationTip = getAdaptationText(lesson, disability);
  const banners = {
    dyslexia: { bg: "bg-[#FFD166]/20", text: "text-[#b8860b]", msg: "📖 Dyslexia-friendly mode — short sentences, highlighted keywords, audio support" },
    visual: { bg: "bg-[#118AB2]/10", text: "text-[#118AB2]", msg: "🔊 Text-to-speech active - content will be read aloud automatically" },
    hearing: { bg: "bg-[#118AB2]/10", text: "text-[#118AB2]", msg: "👁️ Visual learning mode - all content shown as visual steps, no audio needed" },
    motor: { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]", msg: "⌨️ Keyboard mode active - press number keys 1-4 to select quiz answers" },
    cognitive: { bg: "bg-[#FFD166]/20", text: "text-[#b8860b]", msg: "🧠 Step-by-step mode - content broken into small, easy steps with hints available" },
    speech: { bg: "bg-[#C8B6FF]/20", text: "text-[#7c3aed]", msg: "✅ Text-only mode - all interactions are text-based, no speaking required" },
  };
  const banner = banners[disability];

  return (
    <div className="min-h-screen bg-[#FAFAFA]" data-testid="lesson-page">
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} onConfettiComplete={() => setShowConfetti(false)} />}

      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-[#334155] hover:text-[#0F172A]" data-testid="lesson-back-link">
            <ArrowLeft className="w-5 h-5" /> Dashboard
          </Link>
          <Badge className={`border-2 ${isJunior ? "bg-[#118AB2]/10 text-[#118AB2] border-[#118AB2]" : "bg-indigo-500/10 text-indigo-600 border-indigo-500/40"}`}>
            {lesson.subject === 'mathematics' ? 'Math' : lesson.subject} · {lesson.grade?.replace("_", " ")}
          </Badge>
        </div>
      </nav>

      {/* Disability mode banner */}
      {banner && (
        <div className={`${banner.bg} px-6 py-2.5 text-center`}>
          <p className={`text-sm font-semibold ${banner.text}`}>{banner.msg}</p>
        </div>
      )}

      <main id="main-content" className="max-w-4xl mx-auto px-6 py-8">

        {/* "-€ LEARN PHASE "-€ */}
        {phase === "learn" && (
          <div className="space-y-6" data-testid="lesson-learn-phase">
            <div className="flex items-start justify-between gap-4">
              <h1 className={`font-bold text-[#0F172A] ${isJunior ? "text-3xl" : "text-2xl"}`} style={headingFont}>
                {lesson.title}
              </h1>
              {(disability === "visual" || disability === "dyslexia") && (
                <ReadAloudBtn text={`${lesson.title}. ${lesson.introduction}. ${lesson.explanation}`} label="Read lesson" />
              )}
            </div>

            {/* Learning DNA personalisation badge */}
            {dna.learning_style && dna.content_complexity && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#C8B6FF]/20 border border-[#C8B6FF] text-[#7c3aed]">
                  🧬 Personalised for your learning style: {dna.learning_style}
                </span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  dna.content_complexity === 'high' ? 'bg-[#06D6A0]/10 border-[#06D6A0] text-[#065f46]' :
                  dna.content_complexity === 'low'  ? 'bg-[#FFD166]/10 border-[#FFD166] text-[#b8860b]' :
                  'bg-[#118AB2]/10 border-[#118AB2] text-[#118AB2]'
                }`}>
                  {dna.content_complexity === 'high' ? '🚀 Advanced level' : dna.content_complexity === 'low' ? '🌱 Foundation level' : '📗 Standard level'}
                </span>
              </div>
            )}

            {lesson.key_concepts?.length > 0 && (
              <div className="neura-card p-6 bg-[#06D6A0]/5">
                <div className="flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-[#06D6A0]" /><h2 className="font-bold text-[#0F172A]" style={headingFont}>Learning Objectives</h2></div>
                <ul className="space-y-2">{lesson.key_concepts.map((obj, i) => (<li key={i} className="flex gap-2 text-[#334155]"><span className="text-[#06D6A0] font-bold">✓</span>{obj}</li>))}</ul>
              </div>
            )}

            {/* Introduction */}
            <div className="neura-card p-6 bg-[#118AB2]/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#118AB2]" />
                  <h2 className="font-bold text-[#0F172A]" style={headingFont}>Introduction</h2>
                </div>
                {disability === "visual" && <ReadAloudBtn text={lesson.introduction} label="Read" />}
              </div>
              <p className="text-[#334155] text-lg leading-relaxed">{lesson.introduction}</p>
            </div>

            {/* Video Lesson Section */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-[#118AB2]" />
                <h2 className="font-bold text-[#0F172A]" style={headingFont}>Video Lesson</h2>
              </div>
              <VideoPlayer topic={lesson.title} videoUrl={lesson.video_url} disability={disability} lessonContent={[lesson.introduction, lesson.explanation].filter(Boolean).join("\n\n")} />
            </section>

            {/* Explanation - adaptive per Learning DNA & Disability */}
            <div className="neura-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#C8B6FF]" />
                  <h2 className="font-bold text-[#0F172A]" style={headingFont}>
                    {dna.explanation_style === "narrative" ? "The Story So Far" : "Let's Learn"}
                  </h2>
                </div>
                {(disability === "visual" || dna.learning_style === "audio") && <ReadAloudBtn text={lesson.explanation} label="Read" />}
              </div>

              {/* Learning DNA Adaptation Banner */}
              <div className="mb-6 p-4 bg-slate-900 rounded-xl text-white border-b-4 border-[#118AB2]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#FFD166]" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD166]">Neural Twin Adaptation</span>
                </div>
                <p className="text-xs font-bold opacity-90">
                  {dna.learning_style === 'visual' ? '🎨 Prioritizing visual models for your profile.' :
                   dna.learning_style === 'audio' ? '🔊 Optimizing for auditory learning flow.' :
                   dna.learning_style === 'interactive' ? '🕹️ Building an experimental learning path.' :
                   '📖 Focusing on structured narrative reading.'}
                </p>
              </div>

              {/* 1. DYSLEXIA: Always apply fonts/spacing regardless of DNA */}
              {disability === "dyslexia" && (
                <div className="text-[#334155] text-lg leading-loose space-y-2" dangerouslySetInnerHTML={{ __html: highlightKeywords(lesson.explanation, lesson.key_concepts?.slice(0, 5) || [lesson.title]).split(". ").map((s) => `<p class="mb-2">• ${s.trim()}${s.endsWith(".") ? "" : "."}</p>`).join("") }} />
              )}

              {/* 2. DNA: INTERACTIVE Learner */}
              {dna.learning_style === "interactive" && disability !== "dyslexia" && (
                <div className="space-y-6">
                   <div className="p-5 bg-[#06D6A0]/10 border-2 border-dashed border-[#06D6A0] rounded-2xl text-center">
                     <p className="font-bold text-[#065f46] mb-3">Experimental Challenge</p>
                     <p className="text-sm text-[#334155] mb-4">Can you find the core idea in the text below? Click it once you find it!</p>
                     <p className="p-4 bg-white rounded-lg border-2 border-[#e2e8f0] cursor-pointer hover:border-[#06D6A0]" onClick={() => trackInteraction()}>
                       {lesson.explanation.split(". ")[0]}...
                     </p>
                   </div>
                   <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
                </div>
              )}

              {/* 3. DNA: AUDIO Learner */}
              {dna.learning_style === "audio" && disability !== "dyslexia" && disability !== "hearing" && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center p-8 bg-[#118AB2]/5 rounded-2xl border-2 border-[#118AB2]">
                    <Volume2 className="w-12 h-12 text-[#118AB2] mb-3 animate-bounce" />
                    <p className="text-center font-bold text-[#118AB2]">Listen to the rhythmic explanation</p>
                    <ReadAloudBtn text={lesson.explanation} label="Play Master Audio" />
                  </div>
                  <p className="text-[#334155] text-lg leading-relaxed opacity-60 italic">"{lesson.explanation.slice(0, 100)}..."</p>
                </div>
              )}

              {/* 4. DNA: VISUAL / READING or Default */}
              {(dna.learning_style === "visual" || dna.learning_style === "reading" || (!dna.learning_style)) && disability !== "dyslexia" && (
                <>
                  {/* COGNITIVE or Short Attention Span or low complexity: break into steps */}
                  {(disability === "cognitive" || dna.attention_span_score < 0.5 || dna.content_complexity === "low") ? (
                    <StepByStep steps={explanationSteps} />
                  ) : dna.explanation_style === "narrative" ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-[#118AB2]/5 rounded-xl border-l-4 border-[#118AB2]">
                        <p className="text-[#334155] text-lg leading-relaxed italic">"{ lesson.explanation.split('.')[0] }."</p>
                      </div>
                      <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
                    </div>
                  ) : dna.content_complexity === "high" ? (
                    <div className="space-y-3">
                      <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
                      {lesson.real_life_example && (
                        <div className="p-4 bg-[#06D6A0]/10 rounded-xl border border-[#06D6A0]">
                          <p className="text-xs font-bold text-[#065f46] mb-1">Advanced Application</p>
                          <p className="text-sm text-[#334155]">{lesson.real_life_example}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
                  )}
                </>
              )}
            </div>

            {lesson.real_life_example && (
              <div className="neura-card p-4 bg-[#118AB2]/5"><p className="text-sm font-bold text-[#118AB2] mb-1">Real-Life Example</p><p className="text-[#334155]">{lesson.real_life_example}</p></div>
            )}

            {/* Examples */}
            <div className="neura-card p-6 bg-[#FFD166]/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#FFD166]" />
                <h2 className="font-bold text-[#0F172A]" style={headingFont}>
                  {disability === "cognitive" ? "Try This Example" : "Examples"}
                </h2>
              </div>

              {/* Cognitive: one example at a time with hint */}
              {disability === "cognitive" ? (
                <div className="space-y-4">
                  {lesson.examples?.[0] && (
                    <div className="p-5 bg-white rounded-xl border-2 border-[#FFD166]">
                      <p className="font-bold text-[#0F172A] text-xl mb-2">{lesson.examples[0].problem}</p>
                      <p className="text-[#118AB2] font-bold text-lg">✅ Answer: {lesson.examples[0].answer}</p>
                      <p className="text-[#334155] mt-2 text-base">{lesson.examples[0].explanation}</p>
                    </div>
                  )}
                  <HintBox hints={hints.slice(1)} />
                </div>
              ) : disability === "hearing" ? (
                /* Hearing: visual cards with emoji */
                <div className="space-y-3">
                  {lesson.examples?.map((ex, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border-2 border-[#0F172A] flex items-start gap-3">
                      <span className="text-2xl shrink-0">{lesson.subject === "mathematics" ? "📐" : "🔬"}</span>
                      <div>
                        <p className="font-bold text-[#0F172A] text-lg">{ex.problem}</p>
                        <p className="text-[#118AB2] font-bold mt-1">✅ {ex.answer}</p>
                        <p className="text-[#334155] text-sm mt-1">{ex.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Default: standard examples */
                <div className="space-y-4">
                  {lesson.examples?.map((ex, i) => (
                    <div key={i} className="p-4 bg-white rounded-xl border-2 border-[#0F172A]">
                      <p className="font-bold text-[#0F172A] text-lg">{ex.problem}</p>
                      <p className="text-[#118AB2] font-bold mt-1">Answer: {ex.answer}</p>
                      <p className="text-[#334155] text-sm mt-1">{ex.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {lesson.activity && (
              <div className="neura-card p-6 bg-[#118AB2]/5">
                <div className="flex items-center gap-2 mb-3"><PenLine className="w-5 h-5 text-[#118AB2]" /><h2 className="font-bold text-[#0F172A]" style={headingFont}>Interactive Activity</h2></div>
                <p className="text-[#334155]">{lesson.activity}</p>
              </div>
            )}

            {lesson.flashcards?.length > 0 && (
              <div className="neura-card p-6">
                <div className="flex items-center gap-2 mb-4"><StickyNote className="w-5 h-5 text-[#FFD166]" /><h2 className="font-bold text-[#0F172A]" style={headingFont}>Flashcards</h2></div>
                <FlashcardDeck cards={lesson.flashcards} disability={disability} />
              </div>
            )}

            {lesson.revision_notes && (
              <div className="neura-card p-6 bg-[#f8fafc]"><div className="flex items-center gap-2 mb-3"><RefreshCw className="w-5 h-5 text-[#64748B]" /><h2 className="font-bold text-[#0F172A]" style={headingFont}>Revision Notes</h2></div><pre className="text-sm text-[#334155] whitespace-pre-wrap font-sans">{lesson.revision_notes}</pre></div>
            )}

            {adaptationTip && (
              <div className="neura-card p-4 bg-[#f1f5f9]"><p className="text-xs font-bold text-[#64748B] mb-1">Accessibility tip for your profile:</p><p className="text-sm text-[#334155]">♿ {adaptationTip}</p></div>
            )}

            <button
              onClick={() => {
                setPhase("quiz");
                if (disability === "visual" || disability === "dyslexia") speak("Quiz time! Listen to each question carefully.");
              }}
              className={`neura-btn text-lg w-full ${disability === "motor" ? 'h-20 text-xl' : 'h-14'} ${
                isJunior ? "bg-[#06D6A0] text-[#0F172A]" : "bg-indigo-600 text-white"
              }`}
              data-testid="start-quiz-btn"
            >
              <Trophy className="w-5 h-5" /> {isJunior ? "Take the Quiz! 🏆" : "Start Quiz"}
            </button>
          </div>
        )}

        {/* "-€ QUIZ PHASE "-€ */}
        {phase === "quiz" && currentQuestion && (
          <div className="space-y-6" data-testid="lesson-quiz-phase">
            <div className="flex items-center justify-between">
              <h2 className={`font-bold text-[#0F172A] ${isJunior ? "text-xl" : "text-lg"}`} style={headingFont}>
                Question {currentQ + 1} of {quiz.length}
              </h2>
              <div className="flex items-center gap-2">
                <Badge className="bg-[#C8B6FF] text-[#0F172A] border-2 border-[#0F172A]">Quiz</Badge>
                {disability === "visual" && (
                  <ReadAloudBtn text={currentQuestion.question} label="Read question" />
                )}
              </div>
            </div>
            <Progress value={((currentQ + 1) / quiz.length) * 100} className="h-3 bg-[#e2e8f0]" />

            <div className={`neura-card ${disability === "motor" ? 'p-10' : 'p-8'}`}>
              <p className={`font-bold text-[#0F172A] mb-6 ${disability === "motor" ? 'text-2xl' : 'text-xl'}`} data-testid="quiz-question">
                {currentQuestion.question}
              </p>

              {/* Motor: keyboard-navigable quiz */}
              {disability === "motor" ? (
                <KeyboardQuiz
                  options={currentQuestion.options || []}
                  selected={selected}
                  onSelect={(opt) => handleAnswer(currentQuestion.id, opt)}
                />
              ) : disability === "cognitive" ? (
                /* Cognitive: one option at a time with clear visual */
                <div className="space-y-4">
                  {currentQuestion.options?.map((opt, i) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(currentQuestion.id, opt)}
                      className={`w-full p-5 rounded-xl border-2 text-left text-lg font-semibold transition-all flex items-center gap-3 ${
                        selected === opt
                          ? 'border-[#06D6A0] bg-[#06D6A0]/10 text-[#0F172A]'
                          : 'border-[#e2e8f0] text-[#334155] hover:border-[#FFD166] hover:bg-[#FFD166]/10'
                      }`}
                      data-testid={`quiz-option-${opt}`}
                    >
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        selected === opt ? 'bg-[#06D6A0] text-white' : 'bg-[#f1f5f9] text-[#64748B]'
                      }`}>
                        {selected === opt ? "✓" : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                /* Default / Visual / Hearing / Speech */
                <div className="space-y-3">
                  {currentQuestion.options?.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(currentQuestion.id, opt)}
                      className={`w-full p-4 rounded-xl border-2 text-left text-lg font-semibold transition-all ${
                        selected === opt
                          ? 'border-[#118AB2] bg-[#118AB2]/10 text-[#118AB2] shadow-[3px_3px_0px_#118AB2]'
                          : 'border-[#e2e8f0] text-[#334155] hover:border-[#0F172A]'
                      }`}
                      data-testid={`quiz-option-${opt}`}
                    >
                      {selected === opt && <span className="mr-2">✓</span>}
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              {currentQ > 0 && (
                <button
                  onClick={() => { setCurrentQ(q => q - 1); setSelected(answers[quiz[currentQ - 1]?.id] || null); }}
                  className={`neura-btn bg-white text-[#0F172A] ${disability === "motor" ? 'h-20 text-xl flex-1' : 'h-14 px-6'}`}
                  data-testid="quiz-prev-btn"
                >
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
              )}
              <button
                onClick={nextQuestion}
                disabled={!selected}
                className={`neura-btn text-lg disabled:opacity-40 ${currentQ > 0 ? 'flex-1' : 'w-full'} ${disability === "motor" ? 'h-20 text-xl' : 'h-14'} ${
                  isJunior ? "bg-[#118AB2] text-white" : "bg-indigo-600 text-white"
                }`}
                data-testid="quiz-next-btn"
              >
                {currentQ < quiz.length - 1 ? <>Next <ArrowRight className="w-5 h-5" /></> : <>Submit Quiz <Check className="w-5 h-5" /></>}
              </button>
            </div>
          </div>
        )}

        {/* "-€ RESULTS PHASE "-€ */}
        {phase === "results" && result && (
          <div className="text-center space-y-6" data-testid="lesson-results-phase">
            <div className={`neura-card p-8 ${result.score >= 70 ? 'bg-[#06D6A0]/10' : 'bg-[#FFD166]/10'}`}>
              <div className="text-6xl mb-4" aria-hidden="true">
                {result.score >= 80 ? "🎉" : result.score >= 70 ? "💛" : "💪"}
              </div>
              <h2 className={`font-bold text-[#0F172A] mb-2 ${isJunior ? "text-3xl" : "text-2xl"}`} style={headingFont}>
                {result.score >= 80 ? (isJunior ? "Amazing Job! 🎉" : "Excellent Result") : result.score >= 70 ? (isJunior ? "Well Done! 💛" : "Good Work") : (isJunior ? "Keep Trying! 💪" : "Keep Practising")}
              </h2>
              <p className="text-5xl font-bold text-[#118AB2] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }} data-testid="quiz-score">
                {result.score}%
              </p>
              <div className="flex justify-center gap-6 text-[#334155]">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#06D6A0]">{result.correct}</p>
                  <p className="text-sm font-bold">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#EF476F]">{result.total - result.correct}</p>
                  <p className="text-sm font-bold">Incorrect</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#FFD166]">+{result.xp_gained}</p>
                  <p className="text-sm font-bold">XP Earned</p>
                </div>
              </div>
              {nextReviewDate && (
                <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[#64748B]">
                  <RefreshCw className="w-4 h-4" />
                  <span>Next review: {new Date(nextReviewDate).toLocaleDateString()}</span>
                  {result.interval_days && <span className="font-bold text-[#118AB2]">({result.interval_days} days)</span>}
                </div>
              )}
              {disability === "visual" && (
                <div className="mt-4">
                  <ReadAloudBtn
                    text={`You scored ${result.score} percent. You got ${result.correct} out of ${result.total} correct. You earned ${result.xp_gained} XP.`}
                    label="Read results"
                  />
                </div>
              )}
            </div>

            {/* Question Review Section */}
            <div className="space-y-4 text-left">
              <h3 className={`font-bold text-[#0F172A] ${isJunior ? "text-xl" : "text-lg"}`} style={headingFont}>
                Review Your Answers
              </h3>
              {quiz.map((q, i) => {
                const userAns = answers[q.id];
                const isCorrect = userAns === q.correct_answer;
                return (
                  <div key={q.id} className={`neura-card p-4 border-2 ${isCorrect ? 'border-[#06D6A0] bg-[#06D6A0]/5' : 'border-[#EF476F] bg-[#EF476F]/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-[#06D6A0] text-white' : 'bg-[#EF476F] text-white'}`}>
                        {isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-[#0F172A] text-sm">Question {i + 1}: {q.question}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                          <div className="text-xs">
                            <span className="font-bold text-[#64748B] uppercase tracking-tight">Your Answer:</span>
                            <p className={`font-semibold ${isCorrect ? 'text-[#065f46]' : 'text-[#991b1b]'}`}>
                              {userAns || "No answer provided"}
                            </p>
                          </div>
                          {!isCorrect && (
                            <div className="text-xs">
                              <span className="font-bold text-[#64748B] uppercase tracking-tight">Correct Answer:</span>
                              <p className="font-semibold text-[#065f46]">{q.correct_answer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard" className="flex-1">
                <button className={`neura-btn bg-white text-[#0F172A] w-full ${disability === "motor" ? 'h-20' : 'h-14'}`} data-testid="back-to-dashboard-btn">
                  <ArrowLeft className="w-5 h-5" /> Dashboard
                </button>
              </Link>
              <button
                onClick={() => { setPhase("learn"); setCurrentQ(0); setAnswers({}); setSelected(null); setResult(null); }}
                className={`neura-btn bg-[#118AB2] text-white flex-1 ${disability === "motor" ? 'h-20' : 'h-14'}`}
                data-testid="retry-lesson-btn"
              >
                Try Again <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </main>
      {/* Caption Overlay for hearing disability */}
      {disability === "hearing" && (
        <CaptionOverlay text={lesson ? `${lesson.introduction}. ${lesson.explanation}` : ""} />
      )}

      {/* Voice Assistant for Auditory Learners */}
      {(disability === 'visual' || user?.learning_profile?.learning_style === 'audio') && (
        <VoiceAssistant onCommand={onVoiceCommand} />
      )}
    </div>
  );
}
