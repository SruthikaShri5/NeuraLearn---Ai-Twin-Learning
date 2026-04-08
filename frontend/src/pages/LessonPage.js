import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, BookOpen, Brain, Trophy, Sparkles, RefreshCw } from "lucide-react";
import Confetti from "react-confetti";
import { vibrate } from "@/lib/haptics";
import { playFeedback } from "@/lib/soundscape";

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState("learn"); // learn | quiz | results
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
      } catch {
        navigate("/dashboard");
      } finally { setLoading(false); }
    };
    fetchLesson();
  }, [lessonId, navigate]);

  const submitQuiz = async () => {
    try {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      const { data } = await api.post("/lessons/submit-quiz", {
        lesson_id: lessonId,
        answers,
        time_spent_seconds: timeSpent,
      });
      setResult(data);
      setPhase("results");
      if (data.score >= 80) {
        setShowConfetti(true);
        vibrate('complete');
        playFeedback('complete');
      } else if (data.score >= 60) {
        vibrate('correct');
        playFeedback('correct');
      } else {
        vibrate('wrong');
        playFeedback('wrong');
      }
      if (data.next_review_date) setNextReviewDate(data.next_review_date);
    } catch {}
  };

  const handleAnswer = (qId, answer) => {
    setSelected(answer);
    setAnswers((a) => ({ ...a, [qId]: answer }));
    vibrate('click');
    playFeedback('click');
  };

  const nextQuestion = () => {
    const quiz = lesson?.quiz || [];
    if (currentQ < quiz.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(answers[quiz[currentQ + 1]?.id] || null);
    } else {
      submitQuiz();
    }
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
            {lesson.subject === 'mathematics' ? 'Math' : 'Science'} - {lesson.grade?.replace("_", " ")}
          </Badge>
        </div>
      </nav>

      <main id="main-content" className="max-w-4xl mx-auto px-6 py-8">
        {/* Learning Phase */}
        {phase === "learn" && (
          <div className="space-y-6" data-testid="lesson-learn-phase">
            <h1 className="text-3xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              {lesson.title}
            </h1>

            {/* Introduction */}
            <div className="neura-card p-6 bg-[#118AB2]/5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-[#118AB2]" />
                <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Introduction</h2>
              </div>
              <p className="text-[#334155] text-lg leading-relaxed">{lesson.introduction}</p>
            </div>

            {/* Explanation */}
            <div className="neura-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-[#C8B6FF]" />
                <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Let's Learn</h2>
              </div>
              <p className="text-[#334155] text-lg leading-relaxed">{lesson.explanation}</p>
            </div>

            {/* Examples */}
            <div className="neura-card p-6 bg-[#FFD166]/10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#FFD166]" />
                <h2 className="font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Examples</h2>
              </div>
              <div className="space-y-4">
                {lesson.examples?.map((ex, i) => (
                  <div key={i} className="p-4 bg-white rounded-xl border-2 border-[#0F172A]">
                    <p className="font-bold text-[#0F172A] text-lg">{ex.problem}</p>
                    <p className="text-[#118AB2] font-bold mt-1">Answer: {ex.answer}</p>
                    <p className="text-[#334155] text-sm mt-1">{ex.explanation}</p>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setPhase("quiz")} className="neura-btn bg-[#06D6A0] text-[#0F172A] text-lg w-full h-14" data-testid="start-quiz-btn">
              <Trophy className="w-5 h-5" /> Take the Quiz!
            </button>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === "quiz" && currentQuestion && (
          <div className="space-y-6" data-testid="lesson-quiz-phase">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Question {currentQ + 1} of {quiz.length}
              </h2>
              <Badge className="bg-[#C8B6FF] text-[#0F172A] border-2 border-[#0F172A]">Quiz</Badge>
            </div>
            <Progress value={((currentQ + 1) / quiz.length) * 100} className="h-3 bg-[#e2e8f0]" />

            <div className="neura-card p-8">
              <p className="text-xl font-bold text-[#0F172A] mb-6" data-testid="quiz-question">
                {currentQuestion.question}
              </p>
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
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={nextQuestion}
              disabled={!selected}
              className="neura-btn bg-[#118AB2] text-white text-lg w-full h-14 disabled:opacity-40"
              data-testid="quiz-next-btn"
            >
              {currentQ < quiz.length - 1 ? <>Next <ArrowRight className="w-5 h-5" /></> : <>Submit Quiz <Check className="w-5 h-5" /></>}
            </button>
          </div>
        )}

        {/* Results Phase */}
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
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard" className="flex-1">
                <button className="neura-btn bg-white text-[#0F172A] w-full h-14" data-testid="back-to-dashboard-btn">
                  <ArrowLeft className="w-5 h-5" /> Dashboard
                </button>
              </Link>
              <button
                onClick={() => { setPhase("learn"); setCurrentQ(0); setAnswers({}); setSelected(null); setResult(null); }}
                className="neura-btn bg-[#118AB2] text-white flex-1 h-14"
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
