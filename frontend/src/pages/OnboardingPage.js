import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Accessibility, Brain, Target, ArrowRight, 
  ArrowLeft, Check, Volume2, Eye, Keyboard, MousePointer, 
  Ear, MessageSquare, BookOpen, Lightbulb, Trophy, Mic 
} from "lucide-react";
import { speak, stopSpeaking } from "@/lib/tts";

const MASCOT_URL = "/mascot.svg";

const ONBOARDING_STEPS = [
  "Welcome",
  "Adaptive Setup",
  "Discovery Session",
  "Self-Learning Promise",
  "Learning Profile"
];

export default function OnboardingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [subStep, setSubStep] = useState(0);
  
  // Learning Profile Data
  const [profile, setProfile] = useState({
    learningStyle: user?.learning_style || "visual",
    explanationStyle: "conceptual",
    preferredLanguage: "english",
    discoveryMetrics: {
      visual: { time: 0, interactions: 0, accuracy: 0 },
      audio: { time: 0, interactions: 0, accuracy: 0 },
      reading: { time: 0, interactions: 0, accuracy: 0 },
      interactive: { time: 0, interactions: 0, accuracy: 0 },
    }
  });

  // Tracking for Discovery Session
  const [discoverySubStep, setDiscoverySubStep] = useState(0);
  const [subStepStartTime, setSubStepStartTime] = useState(Date.now());

  useEffect(() => {
    if (step === 2) setSubStepStartTime(Date.now());
  }, [step, discoverySubStep]);

  const recordMetric = (type, interactions = 1) => {
    const duration = Math.round((Date.now() - subStepStartTime) / 1000);
    setProfile(p => {
      if (!p.discoveryMetrics[type]) return p;
      return {
        ...p,
        discoveryMetrics: {
          ...p.discoveryMetrics,
          [type]: {
            ...p.discoveryMetrics[type],
            time: p.discoveryMetrics[type].time + duration,
            interactions: p.discoveryMetrics[type].interactions + interactions
          }
        }
      };
    });
  };

  const handleNext = () => {
    if (step === 2 && discoverySubStep < 5) {
      // Record metrics for current sub-step
      const types = ["intro", "visual", "audio", "interactive", "reading", "quiz"];
      if (discoverySubStep > 0) recordMetric(types[discoverySubStep]);
      setDiscoverySubStep(s => s + 1);
    } else if (step < ONBOARDING_STEPS.length - 1) {
      setStep(s => s + 1);
      setDiscoverySubStep(0);
    } else {
      finishOnboarding();
    }
  };

  const generateDNA = () => {
    const metrics = profile.discoveryMetrics;
    const scores = {
      visual: metrics.visual.time * 0.4 + metrics.visual.interactions * 10,
      audio: metrics.audio.time * 0.4 + metrics.audio.interactions * 10,
      interactive: metrics.interactive.time * 0.4 + metrics.interactive.interactions * 10,
      reading: metrics.reading.time * 0.4 + metrics.reading.interactions * 10,
    };
    
    const bestStyle = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    return {
      ...profile,
      learningStyle: bestStyle,
      explanationStyle: bestStyle === 'reading' ? 'narrative' : bestStyle === 'visual' ? 'visual' : 'conceptual',
      confidenceLevel: metrics.interactive.interactions > 3 ? 'high' : 'medium',
      attentionSpanScore: Math.min(1, (metrics.visual.time + metrics.audio.time + metrics.reading.time) / 120),
    };
  };

  const finishOnboarding = async () => {
    try {
      const finalDNA = generateDNA();
      const payload = {
        onboarding_complete: true,
        learning_profile: {
          preferred_language: finalDNA.preferredLanguage,
          learning_style: finalDNA.learningStyle,
          explanation_style: finalDNA.explanationStyle,
          confidence_level: finalDNA.confidenceLevel,
          attention_span_score: finalDNA.attentionSpanScore,
        }
      };
      await api.put("/user/profile", payload);
      const { data } = await api.get("/auth/me");
      if (data.user) updateUser(data.user);
      // Flag: launch tour immediately on dashboard
      localStorage.removeItem("neuralearn_tour_done");
      sessionStorage.setItem("neuralearn_launch_tour", "1");
      navigate("/dashboard");
    } catch (err) {
      console.error("Onboarding failed:", err);
      localStorage.removeItem("neuralearn_tour_done");
      sessionStorage.setItem("neuralearn_launch_tour", "1");
      navigate("/dashboard");
    }
  };

  const renderWelcome = () => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
      <div className="flex justify-center mb-4">
        <img src={MASCOT_URL} alt="Neura" className="w-32 h-32 float-animation" />
      </div>
      <h1 className="text-4xl font-bold text-[#1A1A2E]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
        Hi {user?.name?.split(" ")[0]}! I'm Neura.
      </h1>
      <p className="text-xl text-[#334155] leading-relaxed">
        I'm not just a learning app. I'm your companion that <span className="font-bold text-[#118AB2]">learns how you learn.</span>
      </p>
      <div className="bg-[#118AB2]/10 p-6 rounded-2xl border-2 border-[#118AB2]/20">
        <p className="text-[#0F172A] font-medium">
          Let's spend a few minutes setting up your personalized workspace so you can learn independently.
        </p>
      </div>
      <button onClick={handleNext} className="neura-btn bg-[#118AB2] text-white text-xl px-12 h-16 w-full shadow-lg">
        Start My Journey <ArrowRight className="ml-2" />
      </button>
    </motion.div>
  );

  const renderAdaptiveSetup = () => {
    const disability = user?.disability_type || "prefer_not_to_say";
    
    const adaptations = {
      visual: {
        icon: Eye,
        title: "Visual Independence",
        message: "I've already enabled my Audio-First engine. You can now learn entirely through voice and sound.",
        features: [
          { label: "Text-to-Speech (Active)", icon: Volume2 },
          { label: "Voice Navigation (Active)", icon: Mic },
          { label: "High Contrast (Active)", icon: Sparkles }
        ],
        demo: {
          label: "Test Voice Assist",
          action: () => speak("Voice assistant is active. You can now say 'Next' or 'Repeat' to control me.")
        }
      },
      hearing: {
        icon: Ear,
        title: "Visual Mastery",
        message: "I've prioritized text and visual cues. You'll never need to worry about missing an audio instruction.",
        features: [
          { label: "Real-time Captions (Active)", icon: MessageSquare },
          { label: "Visual Notifications (Active)", icon: Sparkles },
          { label: "Diagram-First Lessons", icon: BookOpen }
        ],
        demo: {
          label: "Test Visual Cue",
          action: () => {
            document.body.classList.add('visual-feedback');
            setTimeout(() => document.body.classList.remove('visual-feedback'), 2000);
          }
        }
      },
      dyslexia: {
        icon: BookOpen,
        title: "Stress-Free Reading",
        message: "I've updated every page with specialized fonts and spacing to make reading feel natural.",
        features: [
          { label: "Dyslexia Font (Active)", icon: BookOpen },
          { label: "Keyword Highlighting (Active)", icon: Lightbulb },
          { label: "Rhythmic Audio Support", icon: Volume2 }
        ],
        demo: {
          label: "Toggle Focus Guide",
          action: () => {
            speak("I will highlight key concepts as we read together.");
          }
        }
      },
      cognitive: {
        icon: Brain,
        title: "Focused Learning",
        message: "I've simplified my interface to help you focus on one thing at a time without distractions.",
        features: [
          { label: "Step-by-Step Mode (Active)", icon: Target },
          { label: "Reduced Distractions (Active)", icon: Sparkles },
          { label: "Guided Smart Hints", icon: Lightbulb }
        ],
        demo: {
          label: "Test Step Mode",
          action: () => speak("In this mode, I will only show you one idea at a time.")
        }
      },
      motor: {
        icon: Keyboard,
        title: "Effortless Control",
        message: "I've expanded my touch targets and enabled full keyboard mastery for you.",
        features: [
          { label: "Large Touch Targets (Active)", icon: MousePointer },
          { label: "Keyboard Shortcuts (Active)", icon: Keyboard },
          { label: "Voice Command Overlays", icon: Mic }
        ],
        demo: {
          label: "Highlight Buttons",
          action: () => speak("Buttons are now 50% larger and easier to click.")
        }
      },
      speech: {
        icon: MessageSquare,
        title: "Text-First Communication",
        message: "I've enabled full text-based interaction. You'll never need to speak or use voice commands.",
        features: [
          { label: "Text-Only AI Tutor (Active)", icon: MessageSquare },
          { label: "Quick Action Buttons (Active)", icon: Target },
          { label: "No Voice Required", icon: Volume2 }
        ],
        demo: {
          label: "Test Text Interaction",
          action: () => {
            document.body.classList.add('visual-feedback');
            setTimeout(() => document.body.classList.remove('visual-feedback'), 2000);
          }
        }
      }
    };

    const current = adaptations[disability] || adaptations.cognitive;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#118AB2]/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border-4 border-[#118AB2]">
            <current.icon className="w-10 h-10 text-[#118AB2]" />
          </div>
          <h2 className="text-3xl font-black text-[#1A1A2E]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {current.title} Enabled
          </h2>
          <p className="text-[#64748B] mt-2 font-medium px-4">{current.message}</p>
        </div>

        <div className="grid gap-3">
          {current.features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ x: -20, opacity: 0 }} 
              animate={{ x: 0, opacity: 1 }} 
              transition={{ delay: i * 0.1 }}
              className="flex items-center justify-between p-4 bg-white border-4 border-[#1A1A2E] rounded-2xl shadow-[4px_4px_0px_#1A1A2E]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#06D6A0]/10 rounded-lg">
                  <f.icon className="w-5 h-5 text-[#06D6A0]" />
                </div>
                <span className="font-bold text-[#334155]">{f.label}</span>
              </div>
              <Check className="w-6 h-6 text-[#06D6A0]" strokeWidth={4} />
            </motion.div>
          ))}
        </div>

        <div className="py-4">
           <button 
             onClick={current.demo.action}
             className="w-full p-4 rounded-2xl border-4 border-dashed border-[#118AB2] text-[#118AB2] font-black uppercase tracking-widest hover:bg-[#118AB2]/5 transition-colors"
           >
             <Sparkles className="w-5 h-5 inline-block mr-2" /> {current.demo.label}
           </button>
        </div>

        <button onClick={handleNext} className="neura-btn bg-[#118AB2] text-white w-full h-16 text-xl shadow-lg">
          I'm Ready to Learn Independently <ArrowRight className="ml-2" />
        </button>
      </motion.div>
    );
  };

  const renderDiscoverySession = () => {
    const samples = [
      {
        title: "Learning Discovery",
        desc: "I'm going to show you 4 different ways to learn. Don't worry about 'getting it right'—just experience them, and I'll learn what feels best for you.",
        btn: "Let's Discover",
        icon: Sparkles
      },
      {
        id: "visual",
        title: "Visual Sample",
        desc: "Watch this short animation about how a seed grows into a tree.",
        content: (
          <div className="aspect-video bg-gradient-to-br from-[#FFD166]/20 to-[#06D6A0]/20 rounded-2xl border-4 border-dashed border-[#118AB2] flex flex-col items-center justify-center p-8 text-center">
            <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <span className="text-6xl mb-4 block">🌱 → 🌳</span>
            </motion.div>
            <p className="font-bold text-[#118AB2]">I prefer seeing pictures and diagrams to understand things.</p>
          </div>
        ),
        btn: "I saw that",
        icon: Eye
      },
      {
        id: "audio",
        title: "Audio Sample",
        desc: "Listen to this short explanation.",
        content: (
          <div className="p-8 bg-[#118AB2]/10 rounded-2xl border-2 border-[#118AB2] text-center">
            <Volume2 className="w-16 h-16 text-[#118AB2] mx-auto mb-4 animate-pulse" />
            <button 
              onClick={() => {
                speak("Photosynthesis is how plants use sunlight to make food. They turn light into energy just like a solar panel!");
                recordMetric("audio", 1);
              }}
              className="neura-btn bg-white border-2 border-[#118AB2] text-[#118AB2] px-6 h-12"
            >
              Play Audio
            </button>
          </div>
        ),
        btn: "I heard that",
        icon: Volume2
      },
      {
        id: "interactive",
        title: "Interactive Sample",
        desc: "Try to click the moving stars as fast as you can!",
        content: (
          <div className="h-48 bg-slate-900 rounded-2xl relative overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.button
                key={i}
                animate={{ 
                  x: [Math.random() * 200, Math.random() * 200], 
                  y: [Math.random() * 100, Math.random() * 100] 
                }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                onClick={() => recordMetric("interactive", 1)}
                className="absolute text-2xl"
                style={{ left: `${20 + i * 15}%`, top: `${20 + (i % 3) * 20}%` }}
              >
                ⭐
              </motion.button>
            ))}
          </div>
        ),
        btn: "Done playing",
        icon: Brain
      },
      {
        id: "reading",
        title: "Reading Sample",
        desc: "Read this short fact and highlight the key word.",
        content: (
          <div className="p-6 bg-white border-2 border-[#e2e8f0] rounded-2xl">
            <p className="text-lg leading-relaxed text-[#334155]">
              The <span className="bg-[#FFD166] px-1 rounded cursor-pointer font-bold" onClick={() => recordMetric("reading", 1)}>Oceans</span> cover more than 70% of the Earth's surface and contain 97% of the Earth's water.
            </p>
            <p className="text-xs text-[#64748B] mt-4 italic">Tip: Click the yellow word to interact.</p>
          </div>
        ),
        btn: "I read it",
        icon: BookOpen
      },
      {
        id: "quiz",
        title: "Discovery Quiz",
        desc: "One last thing! What did the plants use to make food?",
        content: (
          <div className="grid gap-3">
            {["Moonlight", "Sunlight", "Starlight", "Flashlight"].map((opt) => (
              <button 
                key={opt}
                onClick={() => {
                  recordMetric("quiz", 1);
                  handleNext();
                }}
                className="w-full p-4 rounded-xl border-2 border-[#e2e8f0] hover:border-[#118AB2] text-left font-bold text-[#334155]"
              >
                {opt}
              </button>
            ))}
          </div>
        ),
        btn: null,
        icon: Target
      }
    ];

    const current = samples[discoverySubStep];

    return (
      <motion.div 
        key={discoverySubStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <div className={`w-12 h-12 rounded-xl bg-[#118AB2]/10 flex items-center justify-center mx-auto mb-4`}>
            <current.icon className="w-6 h-6 text-[#118AB2]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{current.title}</h2>
          <p className="text-[#64748B]">{current.desc}</p>
        </div>

        <div className="py-4">
          {current.content}
        </div>

        {current.btn && (
          <button onClick={handleNext} className="neura-btn bg-[#118AB2] text-white w-full h-14">
            {current.btn} <ArrowRight className="ml-2" />
          </button>
        )}
      </motion.div>
    );
  };

  const renderPromise = () => (
    <div className="text-center space-y-8 py-4">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-[#118AB2]/20 blur-3xl rounded-full" />
        <Trophy className="w-20 h-20 text-[#FFD166] relative mx-auto" />
      </div>
      
      <div className="space-y-4">
        <h2 className="text-3xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Our Promise to You
        </h2>
        <div className="space-y-4 text-lg text-[#334155] max-w-md mx-auto">
          <p>
            NeuraLearn adapts to <span className="font-bold text-[#EF476F]">YOU</span>. You do not need to learn like everyone else.
          </p>
          <p className="bg-white p-4 rounded-xl border-2 border-dashed border-[#118AB2]">
            "As you study, I will continuously adapt lessons, quizzes, pacing, and tools to help you become an <span className="font-bold">independent learner</span>."
          </p>
        </div>
      </div>

      <button onClick={handleNext} className="neura-btn bg-[#06D6A0] text-[#0F172A] w-full h-16 text-xl">
        I'm Ready to Excel <Check className="ml-2" />
      </button>
    </div>
  );

  const renderProfileSummary = () => {
    const dna = generateDNA();
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Your Learning DNA</h2>
          <p className="text-[#64748B]">I've analyzed your discovery session and created your initial twin.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#118AB2]/10 rounded-xl border-2 border-[#118AB2]/20">
            <p className="text-[10px] font-black uppercase text-[#118AB2] mb-1">Learning Style</p>
            <p className="font-bold text-[#1A1A2E] capitalize">{dna.learningStyle}</p>
          </div>
          <div className="p-4 bg-[#EF476F]/10 rounded-xl border-2 border-[#EF476F]/20">
            <p className="text-[10px] font-black uppercase text-[#EF476F] mb-1">Explanation Style</p>
            <p className="font-bold text-[#1A1A2E] capitalize">{dna.explanationStyle}</p>
          </div>
          <div className="p-4 bg-[#06D6A0]/10 rounded-xl border-2 border-[#06D6A0]/20">
            <p className="text-[10px] font-black uppercase text-[#06D6A0] mb-1">Attention Span</p>
            <p className="font-bold text-[#1A1A2E]">{Math.round(dna.attentionSpanScore * 100)}% (Adaptive)</p>
          </div>
          <div className="p-4 bg-[#FFD166]/10 rounded-xl border-2 border-[#FFD166]/20">
            <p className="text-[10px] font-black uppercase text-[#b8860b] mb-1">Confidence Level</p>
            <p className="font-bold text-[#1A1A2E] capitalize">{dna.confidenceLevel}</p>
          </div>
        </div>

        <div className="p-5 bg-slate-900 rounded-2xl text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Brain className="w-5 h-5 text-[#C8B6FF]" />
            </div>
            <p className="font-bold">Neural Twin Recommendation</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed italic">
            "Based on your {dna.learningStyle} strengths, I will prioritize {dna.explanationStyle} lessons with {dna.attentionSpanScore > 0.5 ? 'standard' : 'compact'} pacing to maximize your retention."
          </p>
        </div>

        <button onClick={finishOnboarding} className="neura-btn bg-[#118AB2] text-white w-full h-16 text-xl shadow-lg">
          Activate My Learning Twin <ArrowRight className="ml-2" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] py-12 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Progress Tracker */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#e2e8f0] -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#118AB2] -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(step / (ONBOARDING_STEPS.length - 1)) * 100}%` }}
          />
          {ONBOARDING_STEPS.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-colors ${
                i <= step ? 'bg-[#118AB2] border-[#118AB2] text-white' : 'bg-white border-[#e2e8f0] text-[#64748B]'
              }`}>
                {i < step ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${i <= step ? 'text-[#118AB2]' : 'text-[#64748B]'}`}>
                {s}
              </span>
            </div>
          ))}
        </div>

        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="neura-card p-10 bg-white shadow-2xl relative overflow-hidden"
        >
          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Brain className="w-64 h-64" />
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && renderWelcome()}
            {step === 1 && renderAdaptiveSetup()}
            {step === 2 && renderDiscoverySession()}
            {step === 3 && renderPromise()}
            {step === 4 && renderProfileSummary()}
          </AnimatePresence>
        </motion.div>
        
        <p className="text-center mt-8 text-[#118AB2] text-xl font-black uppercase tracking-[0.2em]">
          "An app that learns how you learn."
        </p>
      </div>
    </div>
  );
}
