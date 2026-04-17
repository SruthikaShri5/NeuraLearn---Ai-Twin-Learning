import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, BookOpen, Brain, Trophy, Sparkles,
  RefreshCw, Volume2, VolumeX, ChevronRight, ChevronLeft, Lightbulb } from "lucide-react";
import Confetti from "react-confetti";
import { vibrate } from "@/lib/haptics";
import { playFeedback } from "@/lib/soundscape";

// ─── Text-to-Speech for Visual disability ───────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  utt.pitch = 1;
  window.speechSynthesis.speak(utt);
}
function stopSpeaking() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ─── Read-Aloud Button (Visual) ──────────────────────────────────────────────
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

// ─── Step-by-Step for Cognitive disability ───────────────────────────────────
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

// ─── Hint system for Cognitive ───────────────────────────────────────────────
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
        <button onClick={() => setShown(s => s + 1)} className="text-xs font-bold text-[#7c3aed] hover:underline mt-1">
          Show hint {shown + 1}
        </button>
      )}
    </div>
  );
}

// ─── Visual Animation for Hearing disability ─────────────────────────────────
function VisualExplanation({ text, subject }) {
  const emoji = subject === "mathematics" ? "📐" : "🔬";
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

// ─── Keyboard navigation for Motor disability ────────────────────────────────
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
      <p className="text-xs text-[#64748B] font-semibold">Press 1–{options.length} on keyboard to select</p>
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

// ─── Main LessonPage ─────────────────────────────────────────────────────────
export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const disability = user?.disability_type || "prefer_not_to_say";

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

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const { data } = await api.get(`/lessons/${lessonId}`);
        setLesson(data.lesson);
        // Auto-read for visual disability
        if (disability === "visual" && data.lesson?.introduction) {
          setTimeout(() => speak(`Lesson: ${data.lesson.title}. ${data.lesson.introduction}`), 500);
        }
      } catch { navigate("/dashboard"); }
      finally { setLoading(false); }
    };
    fetchLesson();
    return () => stopSpeaking();
  }, [lessonId, navigate, disability]);

  const submitQuiz = async () => {
    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const { data } = await api.post("/lessons/submit-quiz", { lesson_id: lessonId, answers, time_spent_seconds: timeSpent });
      setResult(data);
      setPhase("results");
      if (data.score >= 80) { setShowConfetti(true); vibrate('complete'); playFeedback('complete'); }
      else if (data.score >= 60) { vibrate('correct'); playFeedback('correct'); }
      else { vibrate('wrong'); playFeedback('wrong'); }
      if (data.next_review_date) setNextReviewDate(data.next_review_date);
      if (disability === "visual") speak(`Quiz complete. Your score is ${data.score} percent.`);
    } catch {}
  };

  const handleAnswer = useCallback((qId, answer) => {
    setSelected(answer);
    setAnswers((a) => ({ ...a, [qId]: answer }));
    vibrate('click');
    playFeedback('click');
    if (disability === "visual") speak(`Selected: ${answer}`);
  }, [disability]);

  const nextQuestion = () => {
    const quiz = lesson?.quiz || [];
    if (currentQ < quiz.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(answers[quiz[currentQ + 1]?.id] || null);
      if (disability === "visual") speak(quiz[currentQ + 1]?.question || "");
    } else { submitQuiz(); }
  };

  if (loading || !lesson) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#118AB2] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const quiz = lesson.quiz || [];
  const currentQuestion = quiz[currentQ];

  // Split explanation into steps for cognitive
  const explanationSteps = lesson.explanation
    ? lesson.explanation.split(". ").filter(s => s.trim().length > 5).map(s => s.trim() + (s.endsWith(".") ? "" : "."))
    : [lesson.explanation];

  // Hints from examples for cognitive
  const hints = lesson.examples?.map(e => `${e.problem} → ${e.answer}`) || [];

  // Disability banner config
  const banners = {
    visual: { bg: "bg-[#0F172A]", text: "text-white", msg: "🔊 Text-to-speech active — content will be read aloud automatically" },
    hearing: { bg: "bg-[#118AB2]/10", text: "text-[#118AB2]", msg: "👁️ Visual learning mode — all content shown as visual steps, no audio needed" },
    motor: { bg: "bg-[#06D6A0]/10", text: "text-[#06D6A0]", msg: "⌨️ Keyboard mode active — press number keys 1–4 to select quiz answers" },
    cognitive: { bg: "bg-[#FFD166]/20", text: "text-[#b8860b]", msg: "🧠 Step-by-step mode — content broken into small, easy steps with hints available" },
    speech: { bg: "bg-[#C8B6FF]/20", text: "text-[#7c3aed]", msg: "✍️ Text-only mode — all interactions are text-based, no speaking required" },
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
          <Badge className="bg-[#118AB2]/10 text-[#118AB2] border-2 border-[#118AB2]">
            {lesson.subject === 'mathematics' ? 'Math' : 'Science'} · {lesson.grade?.replace("_", " ")}
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

        {/* ── LEARN PHASE ── */}
        {phase === "learn" && (
          <div className="space-y-6" data-testid="lesson-learn-phase">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {lesson.title}
              </h1>
              {disability === "visual" && (
                <ReadAloudBtn text={`${lesson.title}. ${lesson.introduction}. ${lesson.explanation}`} label="Read lesson" />
              )}
            </div>

            {/* Introduction */}
            <div className="neura-card p-6 bg-[#118AB2]/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#118AB2]" />
                  <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Introduction</h2>
                </div>
                {disability === "visual" && <ReadAloudBtn text={lesson.introduction} label="Read" />}
              </div>
              <p className="text-[#334155] text-lg leading-relaxed">{lesson.introduction}</p>
            </div>

            {/* Explanation — adaptive per disability */}
            <div className="neura-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#C8B6FF]" />
                  <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    {disability === "cognitive" ? "Step by Step" : "Let's Learn"}
                  </h2>
                </div>
                {disability === "visual" && <ReadAloudBtn text={lesson.explanation} label="Read" />}
              </div>

              {/* VISUAL: plain text + read aloud */}
              {(disability === "visual" || disability === "speech" || disability === "prefer_not_to_say" || !disability) && (
                <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
              )}

              {/* HEARING: visual step-by-step with icons, no audio */}
              {disability === "hearing" && (
                <VisualExplanation text={lesson.explanation} subject={lesson.subject} />
              )}

              {/* MOTOR: plain text, keyboard-friendly */}
              {disability === "motor" && (
                <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
              )}

              {/* COGNITIVE: step-by-step broken sentences */}
              {disability === "cognitive" && (
                <StepByStep steps={explanationSteps} />
              )}

              {/* MULTIPLE: combination */}
              {disability === "multiple" && (
                <div className="space-y-4">
                  <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
                  <ReadAloudBtn text={lesson.explanation} label="Read aloud" />
                </div>
              )}
            </div>

            {/* Examples */}
            <div className="neura-card p-6 bg-[#FFD166]/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#FFD166]" />
                <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
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
                      <span className="text-2xl shrink-0">{lesson.subject === "mathematics" ? "🔢" : "🧪"}</span>
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

            <button
              onClick={() => {
                setPhase("quiz");
                if (disability === "visual") speak("Quiz time! Listen to each question carefully.");
              }}
              className={`neura-btn bg-[#06D6A0] text-[#0F172A] text-lg w-full ${disability === "motor" ? 'h-20 text-xl' : 'h-14'}`}
              data-testid="start-quiz-btn"
            >
              <Trophy className="w-5 h-5" /> Take the Quiz!
            </button>
          </div>
        )}

        {/* ── QUIZ PHASE ── */}
        {phase === "quiz" && currentQuestion && (
          <div className="space-y-6" data-testid="lesson-quiz-phase">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
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

            <button
              onClick={nextQuestion}
              disabled={!selected}
              className={`neura-btn bg-[#118AB2] text-white text-lg w-full disabled:opacity-40 ${disability === "motor" ? 'h-20 text-xl' : 'h-14'}`}
              data-testid="quiz-next-btn"
            >
              {currentQ < quiz.length - 1 ? <>Next <ArrowRight className="w-5 h-5" /></> : <>Submit Quiz <Check className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {/* ── RESULTS PHASE ── */}
        {phase === "results" && result && (
          <div className="text-center space-y-6" data-testid="lesson-results-phase">
            <div className={`neura-card p-8 ${result.score >= 70 ? 'bg-[#06D6A0]/10' : 'bg-[#FFD166]/10'}`}>
              <div className="text-6xl mb-4" aria-hidden="true">
                {result.score >= 80 ? "🎉" : result.score >= 70 ? "👏" : "💪"}
              </div>
              <h2 className="text-3xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                {result.score >= 80 ? "Amazing Job!" : result.score >= 70 ? "Well Done!" : "Keep Trying!"}
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
    </div>
  );
}
