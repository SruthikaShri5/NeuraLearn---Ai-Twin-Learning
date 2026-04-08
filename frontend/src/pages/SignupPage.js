import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth, formatApiError } from "@/lib/auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Check,
  BookOpen, GraduationCap, Users, School, Layers } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AVATARS = [
  { id: "owl", emoji: "🦉", name: "Wise Owl" }, { id: "fox", emoji: "🦊", name: "Clever Fox" },
  { id: "bunny", emoji: "🐰", name: "Happy Bunny" }, { id: "bear", emoji: "🐻", name: "Brave Bear" },
  { id: "cat", emoji: "🐱", name: "Curious Cat" }, { id: "dog", emoji: "🐶", name: "Loyal Pup" },
  { id: "panda", emoji: "🐼", name: "Chill Panda" }, { id: "unicorn", emoji: "🦄", name: "Magic Unicorn" },
  { id: "dragon", emoji: "🐉", name: "Mighty Dragon" }, { id: "dolphin", emoji: "🐬", name: "Smart Dolphin" },
  { id: "star", emoji: "⭐", name: "Bright Star" }, { id: "rocket", emoji: "🚀", name: "Rocket Explorer" },
];

const DISABILITY_TYPES = [
  { value: "visual", label: "Visual" }, { value: "hearing", label: "Hearing" },
  { value: "motor", label: "Motor" }, { value: "cognitive", label: "Cognitive" },
  { value: "speech", label: "Speech" }, { value: "multiple", label: "Multiple" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const GRADES = [
  { value: "class_1", label: "Class 1" }, { value: "class_2", label: "Class 2" },
  { value: "class_3", label: "Class 3" }, { value: "class_4", label: "Class 4" },
  { value: "class_5", label: "Class 5" }, { value: "class_6", label: "Class 6" },
  { value: "class_7", label: "Class 7" }, { value: "class_8", label: "Class 8" },
  { value: "class_9", label: "Class 9" }, { value: "class_10", label: "Class 10" },
  { value: "class_11", label: "Class 11" }, { value: "class_12", label: "Class 12" },
  { value: "college_science", label: "College - Science" },
  { value: "college_commerce", label: "College - Commerce" },
  { value: "college_arts", label: "College - Arts" },
];

const LEARNING_STYLES = [
  { value: "visual", label: "Visual (seeing)" }, { value: "auditory", label: "Auditory (hearing)" },
  { value: "reading", label: "Reading/Writing" }, { value: "kinesthetic", label: "Kinesthetic (doing)" },
];

const SUBJECTS = [
  { value: "mathematics", label: "Mathematics" }, { value: "science", label: "Science" },
  { value: "english", label: "English" }, { value: "social_studies", label: "Social Studies" },
  { value: "general", label: "General / All Subjects" },
];

const ROLE_CONFIG = {
  student: {
    icon: BookOpen, color: "bg-[#118AB2]", label: "Student",
    desc: "I want to learn and grow",
    steps: ["Account", "Profile", "Avatar"],
  },
  teacher: {
    icon: GraduationCap, color: "bg-[#06D6A0]", label: "Teacher",
    desc: "I teach and guide students",
    steps: ["Account", "School Info", "Classes"],
  },
  parent: {
    icon: Users, color: "bg-[#FFD166]", label: "Parent",
    desc: "I monitor my child's learning",
    steps: ["Account", "Children Info"],
  },
};

export default function SignupPage() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") || "student");
  const [step, setStep] = useState(0); // 0 = role select, 1+ = role steps
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedChildGrades, setSelectedChildGrades] = useState([]);
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    disability_type: "prefer_not_to_say",
    grade_level: "class_1",
    learning_style: "visual",
    avatar: "owl",
    school_name: "",
    subject_specialization: "general",
  });

  useEffect(() => {
    const r = searchParams.get("role");
    if (r && ROLE_CONFIG[r]) { setRole(r); setStep(1); }
  }, [searchParams]);

  if (user) {
    const dest = user.role === "teacher" ? "/teacher-dashboard" : user.role === "parent" ? "/parent-dashboard" : "/dashboard";
    navigate(dest, { replace: true });
    return null;
  }

  const updateForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleClass = (cls) => {
    setSelectedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const toggleChildGrade = (grade) => {
    setSelectedChildGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) return setError("Please enter your name");
    if (!form.email.trim()) return setError("Please enter your email");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (!/[A-Z]/.test(form.password)) return setError("Password must contain an uppercase letter");
    if (!/\d/.test(form.password)) return setError("Password must contain a digit");
    if (role === "teacher" && selectedClasses.length === 0) return setError("Please select at least one class");
    if (role === "parent" && selectedChildGrades.length === 0) return setError("Please select your child's grade");

    setLoading(true);
    try {
      const payload = {
        ...form,
        role,
        assigned_classes: role === "teacher" ? selectedClasses : undefined,
        children_grades: role === "parent" ? selectedChildGrades : undefined,
      };
      const u = await register(payload);
      if (role === "teacher") navigate("/teacher-dashboard");
      else if (role === "parent") navigate("/parent-dashboard");
      else navigate("/onboarding");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  const cfg = ROLE_CONFIG[role];
  const totalSteps = cfg.steps.length;

  // Step 0: Role selection
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12" data-testid="signup-page">
        <main id="main-content" className="w-full max-w-lg">
          <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
            <Brain className="w-8 h-8 text-[#118AB2]" strokeWidth={2.5} />
            <span className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
          </Link>
          <div className="neura-card p-8">
            <h1 className="text-2xl font-bold text-[#0F172A] text-center mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>
              Who are you?
            </h1>
            <p className="text-[#64748B] text-center mb-8">Choose your role to get started</p>
            <div className="space-y-4">
              {Object.entries(ROLE_CONFIG).map(([id, cfg]) => (
                <button
                  key={id}
                  onClick={() => { setRole(id); setStep(1); }}
                  className={`w-full p-5 rounded-2xl border-2 flex items-center gap-4 transition-all hover:shadow-[4px_4px_0px_#0F172A] ${
                    role === id ? 'border-[#0F172A] shadow-[4px_4px_0px_#0F172A]' : 'border-[#e2e8f0]'
                  }`}
                  data-testid={`role-select-${id}`}
                >
                  <div className={`w-14 h-14 rounded-2xl ${cfg.color} flex items-center justify-center border-2 border-[#0F172A] shrink-0`}>
                    <cfg.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#0F172A] text-lg" style={{ fontFamily: 'Fredoka, sans-serif' }}>{cfg.label}</p>
                    <p className="text-sm text-[#64748B]">{cfg.desc}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#64748B] ml-auto" />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-[#334155] mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-[#118AB2] font-bold hover:underline">Sign In</Link>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6 py-12" data-testid="signup-page">
      <main id="main-content" className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <Brain className="w-8 h-8 text-[#118AB2]" strokeWidth={2.5} />
          <span className="text-2xl font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>NeuraLearn</span>
        </Link>

        <div className="neura-card p-8" data-testid="signup-card">
          {/* Role badge */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className={`px-4 py-1.5 rounded-full ${cfg.color} text-white text-sm font-bold flex items-center gap-1.5 border-2 border-[#0F172A]`}>
              <cfg.icon className="w-4 h-4" /> {cfg.label}
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {cfg.steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i + 1 < step ? 'bg-[#06D6A0] border-[#06D6A0] text-white' :
                  i + 1 === step ? 'bg-[#118AB2] border-[#118AB2] text-white' :
                  'bg-white border-[#e2e8f0] text-[#64748B]'
                }`}>
                  {i + 1 < step ? <Check className="w-3 h-3" /> : i + 1}
                </div>
                {i < cfg.steps.length - 1 && <div className={`w-8 h-0.5 ${i + 1 < step ? 'bg-[#06D6A0]' : 'bg-[#e2e8f0]'}`} />}
              </div>
            ))}
          </div>

          <h1 className="text-xl font-bold text-[#0F172A] text-center mb-1" style={{ fontFamily: 'Fredoka, sans-serif' }}>
            {cfg.steps[step - 1]}
          </h1>

          {error && (
            <div className="bg-[#EF476F]/10 border-2 border-[#EF476F] rounded-xl p-3 my-4 text-[#EF476F] text-sm font-semibold" role="alert" data-testid="signup-error">
              {error}
            </div>
          )}

          {/* ── STEP 1: Account (all roles) ── */}
          {step === 1 && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name" className="text-[#0F172A] font-bold mb-1.5 block">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <Input id="name" value={form.name} onChange={(e) => updateForm("name", e.target.value)}
                    placeholder="Your full name" className="pl-10 h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-name-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="email" className="text-[#0F172A] font-bold mb-1.5 block">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <Input id="email" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)}
                    placeholder="your@email.com" className="pl-10 h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-email-input" />
                </div>
              </div>
              <div>
                <Label htmlFor="password" className="text-[#0F172A] font-bold mb-1.5 block">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <Input id="password" type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    className="pl-10 pr-10 h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-password-input" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]" aria-label="Toggle password">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12" data-testid="signup-back-role">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setError(""); setStep(2); }} className="neura-btn bg-[#118AB2] text-white flex-1 h-12" data-testid="signup-next-step-1">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Student Profile ── */}
          {step === 2 && role === "student" && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#0F172A] font-bold mb-1.5 block">Your Class / Grade</Label>
                <Select value={form.grade_level} onValueChange={(v) => updateForm("grade_level", v)}>
                  <SelectTrigger className="h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-grade-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADES.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#0F172A] font-bold mb-1.5 block">Disability Type</Label>
                <Select value={form.disability_type} onValueChange={(v) => updateForm("disability_type", v)}>
                  <SelectTrigger className="h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-disability-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DISABILITY_TYPES.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[#0F172A] font-bold mb-1.5 block">Learning Style</Label>
                <Select value={form.learning_style} onValueChange={(v) => updateForm("learning_style", v)}>
                  <SelectTrigger className="h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-learning-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEARNING_STYLES.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setError(""); setStep(3); }} className="neura-btn bg-[#118AB2] text-white flex-1 h-12" data-testid="signup-next-step-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Student Avatar ── */}
          {step === 3 && role === "student" && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-4 gap-3">
                {AVATARS.map((a) => (
                  <button key={a.id} onClick={() => updateForm("avatar", a.id)}
                    className={`relative p-3 rounded-2xl border-2 transition-all text-center ${
                      form.avatar === a.id ? 'border-[#118AB2] bg-[#118AB2]/10 shadow-[3px_3px_0px_#118AB2]' : 'border-[#e2e8f0] hover:border-[#0F172A]'
                    }`}
                    aria-label={`Select ${a.name} avatar`} data-testid={`avatar-${a.id}`}>
                    <span className="text-3xl block">{a.emoji}</span>
                    <span className="text-xs font-bold text-[#334155] mt-1 block">{a.name}</span>
                    {form.avatar === a.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#118AB2] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="neura-btn bg-[#06D6A0] text-[#0F172A] flex-1 h-12 disabled:opacity-50" data-testid="signup-submit-btn">
                  {loading ? "Creating..." : <><Check className="w-4 h-4" /> Create Account</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Teacher School Info ── */}
          {step === 2 && role === "teacher" && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#0F172A] font-bold mb-1.5 block">School Name</Label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748B]" />
                  <Input value={form.school_name} onChange={(e) => updateForm("school_name", e.target.value)}
                    placeholder="Your school name" className="pl-10 h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-school-input" />
                </div>
              </div>
              <div>
                <Label className="text-[#0F172A] font-bold mb-1.5 block">Subject Specialization</Label>
                <Select value={form.subject_specialization} onValueChange={(v) => updateForm("subject_specialization", v)}>
                  <SelectTrigger className="h-12 border-2 border-[#0F172A] rounded-xl" data-testid="signup-subject-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={() => { setError(""); setStep(3); }} className="neura-btn bg-[#06D6A0] text-white flex-1 h-12" data-testid="signup-teacher-next">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Teacher Classes ── */}
          {step === 3 && role === "teacher" && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#0F172A] font-bold mb-2 block flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Classes You Teach (select all that apply)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {GRADES.map((g) => (
                    <button key={g.value} onClick={() => toggleClass(g.value)}
                      className={`py-2 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedClasses.includes(g.value)
                          ? 'border-[#06D6A0] bg-[#06D6A0]/10 text-[#06D6A0]'
                          : 'border-[#e2e8f0] text-[#334155] hover:border-[#0F172A]'
                      }`}
                      data-testid={`teacher-class-${g.value}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
                {selectedClasses.length > 0 && (
                  <p className="text-xs text-[#06D6A0] font-bold mt-2">{selectedClasses.length} class(es) selected</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(2)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="neura-btn bg-[#06D6A0] text-[#0F172A] flex-1 h-12 disabled:opacity-50" data-testid="signup-submit-btn">
                  {loading ? "Creating..." : <><Check className="w-4 h-4" /> Register</>}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Parent Children Info ── */}
          {step === 2 && role === "parent" && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#0F172A] font-bold mb-2 block">Your Child's Class / Grade</Label>
                <p className="text-sm text-[#64748B] mb-3">Select all grades that apply (you can have multiple children)</p>
                <div className="grid grid-cols-3 gap-2">
                  {GRADES.map((g) => (
                    <button key={g.value} onClick={() => toggleChildGrade(g.value)}
                      className={`py-2 px-3 rounded-xl border-2 text-sm font-bold transition-all ${
                        selectedChildGrades.includes(g.value)
                          ? 'border-[#FFD166] bg-[#FFD166]/20 text-[#b8860b]'
                          : 'border-[#e2e8f0] text-[#334155] hover:border-[#0F172A]'
                      }`}
                      data-testid={`parent-grade-${g.value}`}>
                      {g.label}
                    </button>
                  ))}
                </div>
                {selectedChildGrades.length > 0 && (
                  <p className="text-xs font-bold mt-2" style={{ color: '#b8860b' }}>{selectedChildGrades.length} grade(s) selected</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="neura-btn bg-white text-[#0F172A] flex-1 h-12">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={loading} className="neura-btn bg-[#FFD166] text-[#0F172A] flex-1 h-12 disabled:opacity-50" data-testid="signup-submit-btn">
                  {loading ? "Creating..." : <><Check className="w-4 h-4" /> Register</>}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-sm text-[#334155] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-[#118AB2] font-bold hover:underline" data-testid="signup-login-link">Sign In</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
