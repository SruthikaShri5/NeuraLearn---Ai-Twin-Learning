import { Link } from "react-router-dom";
import { Brain, Home, AlertTriangle } from "lucide-react";
import { useGradeTheme } from "@/lib/useGradeTheme";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

export default function NotFoundPage() {
  const { isJunior, isSenior, headingFont } = useGradeTheme();

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${isSenior ? "bg-[#FAFAFA]" : "bg-[#FAFAFA]"}`} data-testid="not-found-page">
      <main id="main-content" className="text-center max-w-md">
        {isJunior ? (
          <img src={MASCOT_URL} alt="NeuraLearn mascot looking confused" className="w-32 h-32 mx-auto mb-6 opacity-60 float-animation" />
        ) : (
          <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-[#4F46E5]" />
          </div>
        )}
        <h1 className={`text-6xl font-bold mb-2 ${isSenior ? "text-[#1A1A2E] sr-gradient-text" : "text-[#1A1A2E]"}`} style={headingFont}>404</h1>
        <h2 className={`text-2xl font-bold mb-4 ${isSenior ? "text-[#374151]" : "text-[#374151]"}`} style={headingFont}>
          {isJunior ? "Oops! Page Not Found 😕" : "Page Not Found"}
        </h2>
        <p className={`mb-8 text-lg ${isSenior ? "text-[#6B7280]" : "text-[#6B7280]"}`}>
          {isJunior
            ? "It seems like you've wandered off the learning path. Let's get you back!"
            : "The requested route does not exist. Navigate back to continue."}
        </p>
        <Link to="/">
          <button className={`neura-btn text-lg px-8 h-14 ${isSenior ? "bg-indigo-600 text-white border-indigo-500" : "bg-[#118AB2] text-white"}`} data-testid="go-home-btn">
            <Home className="w-5 h-5" /> {isJunior ? "Go Home 🧠" : "Go Home"}
          </button>
        </Link>
      </main>
    </div>
  );
}
