import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/store";
import { X, Minimize2 } from "lucide-react";

/**
 * 3D AI Companion using Three.js
 * Renders an animated floating orb companion that reacts to emotion state
 */
export default function AICompanion({ onClose }) {
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const animFrameRef = useRef(null);
  const { emotionState, cognitiveLoad, attentionScore } = useAppStore();
  const [message, setMessage] = useState("Hi! I'm Neura, your learning companion!");
  const [minimized, setMinimized] = useState(false);

  // Companion messages based on state
  useEffect(() => {
    const messages = {
      neutral: [
        "Ready to learn something amazing today?",
        "You're doing great! Keep it up!",
        "Every lesson brings you closer to mastery!",
      ],
      happy: [
        "You're on fire! Amazing work!",
        "That positive energy is contagious!",
        "Keep smiling — learning is fun!",
      ],
      focused: [
        "Deep focus mode activated. You've got this!",
        "Concentration level: expert!",
        "I can feel your focus. Stay in the zone!",
      ],
      tired: [
        "Feeling tired? Try the breathing exercise!",
        "A short break can boost your learning!",
        "Remember to rest — your brain needs it!",
      ],
      confused: [
        "Confused? Let's break it down together!",
        "It's okay to not understand yet. Keep trying!",
        "Every expert was once a beginner!",
      ],
    };
    const pool = messages[emotionState] || messages.neutral;
    setMessage(pool[Math.floor(Math.random() * pool.length)]);
  }, [emotionState]);

  useEffect(() => {
    if (minimized || !canvasRef.current) return;

    let THREE;
    let mounted = true;

    const init = async () => {
      try {
        THREE = await import('three');
      } catch {
        // Three.js not available, use canvas fallback
        renderCanvasFallback();
        return;
      }

      if (!mounted || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const W = canvas.clientWidth || 200;
      const H = canvas.clientHeight || 200;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
      camera.position.z = 3;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      rendererRef.current = renderer;

      // Core orb
      const orbGeo = new THREE.SphereGeometry(0.8, 64, 64);
      const orbMat = new THREE.MeshPhongMaterial({
        color: 0x118AB2,
        emissive: 0x0a4a6e,
        shininess: 100,
        transparent: true,
        opacity: 0.9,
      });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      scene.add(orb);

      // Inner glow sphere
      const glowGeo = new THREE.SphereGeometry(0.75, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0xC8B6FF,
        transparent: true,
        opacity: 0.3,
      });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      scene.add(glow);

      // Orbiting particles
      const particles = [];
      const particleGeo = new THREE.SphereGeometry(0.05, 8, 8);
      const particleColors = [0xFFD166, 0xEF476F, 0x06D6A0, 0xC8B6FF];
      for (let i = 0; i < 8; i++) {
        const mat = new THREE.MeshBasicMaterial({ color: particleColors[i % 4] });
        const p = new THREE.Mesh(particleGeo, mat);
        const angle = (i / 8) * Math.PI * 2;
        const radius = 1.3 + Math.random() * 0.3;
        p.userData = { angle, radius, speed: 0.3 + Math.random() * 0.4, yOffset: (Math.random() - 0.5) * 0.5 };
        scene.add(p);
        particles.push(p);
      }

      // Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const pointLight = new THREE.PointLight(0x118AB2, 2, 10);
      pointLight.position.set(2, 2, 2);
      scene.add(pointLight);
      const pointLight2 = new THREE.PointLight(0xC8B6FF, 1, 10);
      pointLight2.position.set(-2, -1, 1);
      scene.add(pointLight2);

      // Emotion color map
      const emotionColors = {
        neutral: 0x118AB2,
        happy: 0x06D6A0,
        focused: 0xC8B6FF,
        tired: 0xFFD166,
        confused: 0xEF476F,
      };

      let time = 0;
      const animate = () => {
        if (!mounted) return;
        animFrameRef.current = requestAnimationFrame(animate);
        time += 0.016;

        // Float animation
        orb.position.y = Math.sin(time * 0.8) * 0.15;
        glow.position.y = orb.position.y;

        // Rotate orb
        orb.rotation.y += 0.005;
        orb.rotation.x = Math.sin(time * 0.3) * 0.1;

        // Pulse glow based on cognitive load
        const pulse = 0.25 + Math.sin(time * 2) * 0.05;
        glowMat.opacity = pulse;

        // Update orb color based on emotion
        const targetColor = emotionColors[emotionState] || emotionColors.neutral;
        orbMat.color.lerp(new THREE.Color(targetColor), 0.02);

        // Orbit particles
        particles.forEach((p) => {
          p.userData.angle += p.userData.speed * 0.016;
          p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
          p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
          p.position.y = orb.position.y + p.userData.yOffset + Math.sin(time + p.userData.angle) * 0.2;
        });

        renderer.render(scene, camera);
      };
      animate();
    };

    init();

    return () => {
      mounted = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [minimized, emotionState]);

  // Canvas fallback (no Three.js)
  const renderCanvasFallback = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = canvas.clientWidth || 200;
    const H = canvas.height = canvas.clientHeight || 200;
    let t = 0;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);
      t += 0.02;
      const cx = W / 2, cy = H / 2 + Math.sin(t) * 10;
      const r = 60;
      // Glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.5);
      grad.addColorStop(0, 'rgba(17,138,178,0.6)');
      grad.addColorStop(0.5, 'rgba(200,182,255,0.3)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // Core
      const coreGrad = ctx.createRadialGradient(cx - 15, cy - 15, 5, cx, cy, r);
      coreGrad.addColorStop(0, '#C8B6FF');
      coreGrad.addColorStop(0.5, '#118AB2');
      coreGrad.addColorStop(1, '#0a4a6e');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();
      // Particles
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + t;
        const px = cx + Math.cos(angle) * (r + 20);
        const py = cy + Math.sin(angle) * (r + 20);
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = ['#FFD166', '#EF476F', '#06D6A0', '#C8B6FF', '#FFD6BA', '#118AB2'][i];
        ctx.fill();
      }
    };
    draw();
  };

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-[#118AB2] border-2 border-[#0F172A] shadow-[3px_3px_0px_#0F172A] flex items-center justify-center text-2xl z-50 hover:scale-110 transition-transform"
        aria-label="Open AI Companion"
        data-testid="companion-minimized-btn"
      >
        🤖
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-20 right-4 w-64 neura-card p-4 z-50 bg-white"
      data-testid="ai-companion"
      role="complementary"
      aria-label="AI Learning Companion"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#06D6A0] animate-pulse" />
          <span className="text-sm font-bold text-[#0F172A]" style={{ fontFamily: 'Fredoka, sans-serif' }}>Neura</span>
        </div>
        <div className="flex gap-1">
          <button onClick={() => setMinimized(true)} className="p-1 rounded hover:bg-[#f1f5f9] text-[#64748B]" aria-label="Minimize companion">
            <Minimize2 className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-[#EF476F]/10 text-[#64748B] hover:text-[#EF476F]" aria-label="Close companion" data-testid="companion-close-btn">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="w-full h-40 rounded-xl overflow-hidden bg-gradient-to-b from-[#0F172A] to-[#1e1b4b] mb-3">
        <canvas ref={canvasRef} className="w-full h-full" aria-hidden="true" />
      </div>

      {/* Message bubble */}
      <div className="bg-[#f8fafc] rounded-xl p-3 border-2 border-[#e2e8f0]">
        <p className="text-sm text-[#334155] font-semibold leading-relaxed">{message}</p>
      </div>

      {/* Emotion indicator */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-[#64748B] font-bold">Mood:</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#118AB2]/10 text-[#118AB2] font-bold capitalize">
          {emotionState}
        </span>
      </div>
    </div>
  );
}
