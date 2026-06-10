import { useEffect, useRef } from "react";

/**
 * Animated streak flame using Canvas particle system
 */
export default function StreakFlame({ streak = 0, size = 48 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;

    const intensity = Math.min(streak / 10, 1); // 0-1 based on streak
    const particleCount = Math.max(5, Math.floor(streak * 1.5));

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = size / 2 + (Math.random() - 0.5) * size * 0.3;
        this.y = size * 0.85;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = -(1.5 + Math.random() * 2.5);
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.03;
        this.size = 3 + Math.random() * 5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.05; // accelerate upward
        this.vx *= 0.98;
        this.life -= this.decay;
        this.size *= 0.97;
        if (this.life <= 0) this.reset();
      }
      draw() {
        const alpha = this.life;
        // Color: blue → orange → yellow based on life
        let r, g, b;
        if (this.life > 0.7) {
          // Core: bright yellow-white
          r = 255; g = 240; b = 100;
        } else if (this.life > 0.4) {
          // Mid: orange
          r = 255; g = 120 + Math.floor(this.life * 200); b = 20;
        } else {
          // Tip: red-orange
          r = 220; g = 60; b = 20;
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.fill();
      }
    }

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => {
      const p = new Particle();
      p.life = Math.random(); // stagger initial life
      return p;
    });

    const animate = () => {
      animRef.current = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, size, size);

      // Glow effect
      if (streak > 0) {
        const grd = ctx.createRadialGradient(size / 2, size * 0.7, 0, size / 2, size * 0.7, size * 0.4);
        grd.addColorStop(0, `rgba(255,150,0,${0.3 * intensity})`);
        grd.addColorStop(1, 'rgba(255,100,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, size, size);
      }

      particlesRef.current.forEach((p) => {
        p.update();
        p.draw();
      });

      // Draw streak number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.floor(size * 0.28)}px Fredoka, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(streak, size / 2, size * 0.72);
      ctx.shadowBlur = 0;
    };

    animate();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [streak, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label={`${streak} day streak`}
      title={`${streak} day streak`}
      style={{ display: 'block' }}
    />
  );
}
