import { Link } from "react-router-dom";
import { Brain, Home } from "lucide-react";

const MASCOT_URL = "https://static.prod-images.emergentagent.com/jobs/3e9d1e6d-1ec4-4242-b98e-375a3fb3e12c/images/0d5a58ad11917c107d19197bb800270b2ab4affe5ac9d9ef444167284e0b11be.png";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center px-6" data-testid="not-found-page">
      <main id="main-content" className="text-center max-w-md">
        <img src={MASCOT_URL} alt="NeuraLearn mascot looking confused" className="w-32 h-32 mx-auto mb-6 opacity-50" style={{ filter: 'grayscale(0.5)' }} />
        <h1 className="text-6xl font-bold text-[#0F172A] mb-2" style={{ fontFamily: 'Fredoka, sans-serif' }}>404</h1>
        <h2 className="text-2xl font-bold text-[#334155] mb-4" style={{ fontFamily: 'Fredoka, sans-serif' }}>
          Oops! Page Not Found
        </h2>
        <p className="text-[#64748B] mb-8 text-lg">
          It seems like you've wandered off the learning path. Let's get you back!
        </p>
        <Link to="/">
          <button className="neura-btn bg-[#118AB2] text-white text-lg px-8 h-14" data-testid="go-home-btn">
            <Home className="w-5 h-5" /> Go Home
          </button>
        </Link>
      </main>
    </div>
  );
}
