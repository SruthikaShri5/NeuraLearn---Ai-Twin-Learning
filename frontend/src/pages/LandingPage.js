import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Star, BookOpen, Brain, Heart, Shield, Sparkles, ArrowRight, Users, Zap } from "lucide-react";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";
const LANDSCAPE_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/d768e2d57c1ea4e6adc5a1a1cc5d863791881aaa60a6b554902f31f95485ca90.png";
const KIDS_URL = "https://images.pexels.com/photos/8617938/pexels-photo-8617938.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

function FloatingDecoration({ className, children }) {
  return (
    <div className={`absolute pointer-events-none float-animation ${className}`} aria-hidden="true">
      {children}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color }) {
  return (
    <div className="neura-card p-6 hover:shadow-[6px_6px_0px_#0F172A] transition-all" data-testid={`feature-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-4 border-2 border-[#0F172A]`}>
        <Icon className="w-7 h-7 text-[#0F172A]" strokeWidth={2.5} />
      </div>
      <h3 className="text-xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>{title}</h3>
      <p className="text-[#334155] leading-relaxed">{description}</p>
    </div>
  );
}

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAFAFA] overflow-hidden" data-testid="landing-page">
      <main id="main-content">
        {/* Nav */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b-2 border-[#0F172A]" data-testid="landing-nav">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <Brain className="w-8 h-8 text-[#118AB2]" strokeWidth={2.5} />
              <span className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
            </Link>
            <div className="flex items-center gap-3">
              {user ? (
                <Link to="/dashboard">
                  <Button className="neura-btn bg-[#118AB2] text-white hover:bg-[#0e7a9e]" data-testid="go-to-dashboard-btn">
                    Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="neura-btn bg-white text-[#0F172A] hover:bg-[#f1f5f9]" data-testid="login-nav-btn">
                      Log In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="neura-btn bg-[#118AB2] text-white hover:bg-[#0e7a9e]" data-testid="signup-nav-btn">
                      Sign Up Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative pt-16 pb-24 px-6" data-testid="hero-section">
          <div className="absolute inset-0 opacity-10">
            <img src={LANDSCAPE_URL} alt="" className="w-full h-full object-cover" aria-hidden="true" />
          </div>
          <FloatingDecoration className="top-20 left-[10%] opacity-60">
            <Star className="w-8 h-8 text-[#FFD166]" fill="#FFD166" />
          </FloatingDecoration>
          <FloatingDecoration className="top-40 right-[15%] opacity-60" style={{ animationDelay: '1s' }}>
            <Sparkles className="w-10 h-10 text-[#C8B6FF]" />
          </FloatingDecoration>
          <FloatingDecoration className="bottom-20 left-[20%] opacity-60" style={{ animationDelay: '2s' }}>
            <Heart className="w-6 h-6 text-[#EF476F]" fill="#EF476F" />
          </FloatingDecoration>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFD166]/30 border-2 border-[#0F172A]">
                  <Sparkles className="w-4 h-4 text-[#0F172A]" />
                  <span className="text-sm font-bold text-[#0F172A]">Adaptive Learning for Every Student</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#0F172A] leading-tight" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                  Learning That <span className="text-[#118AB2]">Adapts</span> to <span className="text-[#EF476F]">You</span>
                </h1>
                <p className="text-lg text-[#334155] leading-relaxed max-w-lg">
                  NeuraLearn uses intelligent technology to create a personalized, accessible learning experience for every student. Class 1 through College.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <button className="neura-btn bg-[#118AB2] text-white text-lg px-8 py-4" data-testid="hero-signup-btn">
                      <Zap className="w-5 h-5" /> Start Learning Free
                    </button>
                  </Link>
                  <Link to="/login">
                    <button className="neura-btn bg-white text-[#0F172A] text-lg px-8 py-4" data-testid="hero-guest-btn">
                      <BookOpen className="w-5 h-5" /> Continue as Guest
                    </button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-80 h-80 rounded-3xl overflow-hidden bg-[#FFD6BA]/30 border-2 border-[#0F172A] shadow-[6px_6px_0px_#0F172A] float-animation">
                  <img
                    src={MASCOT_URL}
                    alt="NeuraLearn AI Companion - A friendly robotic owl"
                    className="w-full h-full object-contain mix-blend-multiply"
                    data-testid="hero-mascot"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-white" data-testid="features-section">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                Built for Every Learner
              </h2>
              <p className="text-base sm:text-lg text-[#334155] max-w-2xl mx-auto">
                Designed with accessibility at its core, NeuraLearn adapts to your unique needs and learning style.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard icon={Brain} title="Adaptive Learning" description="Content and difficulty automatically adjust based on your cognitive state and progress." color="bg-[#C8B6FF]" />
              <FeatureCard icon={Shield} title="Accessible by Design" description="WCAG AAA compliant with support for screen readers, voice control, and customizable display." color="bg-[#06D6A0]/30" />
              <FeatureCard icon={BookOpen} title="Rich Curriculum" description="Structured lessons from Class 1 to College across Mathematics, Science, and more." color="bg-[#FFD166]/40" />
              <FeatureCard icon={Zap} title="Knowledge Graph" description="Track concept mastery with an interactive visual map of your learning journey." color="bg-[#118AB2]/20" />
              <FeatureCard icon={Heart} title="Emotional Support" description="Breathing exercises, haptic feedback, and an AI companion to keep you calm and focused." color="bg-[#EF476F]/20" />
              <FeatureCard icon={Users} title="Works Offline" description="Full PWA support means you can keep learning even without internet connectivity." color="bg-[#FFD6BA]" />
            </div>
          </div>
        </section>

        {/* Community */}
        <section className="py-20 px-6" data-testid="community-section">
          <div className="max-w-7xl mx-auto">
            <div className="neura-card overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
                    Every Student Deserves to Shine
                  </h2>
                  <p className="text-[#334155] leading-relaxed mb-6">
                    NeuraLearn was created to ensure no student is left behind. Whether you learn through seeing, hearing, touching, or speaking, our platform adapts to you.
                  </p>
                  <Link to="/signup">
                    <button className="neura-btn bg-[#FFD166] text-[#0F172A] text-lg px-8" data-testid="community-signup-btn">
                      Join NeuraLearn Today <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>
                </div>
                <div className="h-64 lg:h-auto">
                  <img src={KIDS_URL} alt="Diverse students learning together in a classroom" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#0F172A] text-white py-12 px-6" data-testid="landing-footer">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-[#118AB2]" />
              <span className="text-xl font-bold" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[#94a3b8]">
              <Link to="/login?role=teacher" className="hover:text-[#06D6A0] transition-colors font-semibold">Teacher Login</Link>
              <Link to="/login?role=parent" className="hover:text-[#FFD166] transition-colors font-semibold">Parent Login</Link>
              <Link to="/signup?role=teacher" className="hover:text-[#06D6A0] transition-colors font-semibold">Teacher Signup</Link>
            </div>
            <p className="text-[#94a3b8] text-sm">Adaptive learning for every student. Built with care and accessibility.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
