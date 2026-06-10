import { useEffect, useRef } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";

/**
 * FocusTree - grows a tree/geometric shape based on focus time
 * Junior: cartoon tree with leaves
 * Senior: geometric crystal/fractal
 */
export default function FocusTree({ minutes = 0, size = 120 }) {
  const canvasRef = useRef(null);
  const { isJunior } = useGradeTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    const progress = Math.min(minutes / 25, 1); // max at 25 min

    if (isJunior) {
      drawCartoonTree(ctx, size, progress);
    } else {
      drawCrystal(ctx, size, progress);
    }
  }, [minutes, size, isJunior]);

  function drawCartoonTree(ctx, s, p) {
    const cx = s / 2;
    // Trunk
    const trunkH = 20 + p * 15;
    ctx.fillStyle = "#8B5E3C";
    ctx.beginPath();
    ctx.roundRect(cx - 6, s - trunkH, 12, trunkH, 4);
    ctx.fill();

    if (p < 0.05) {
      // Seedling
      ctx.fillStyle = "#06D6A0";
      ctx.beginPath();
      ctx.arc(cx, s - trunkH - 8, 8, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Canopy layers
    const layers = Math.ceil(p * 3);
    const colors = ["#06D6A0", "#10B981", "#059669"];
    for (let i = 0; i < layers; i++) {
      const r = 15 + i * 8 + p * 10;
      const y = s - trunkH - 10 - i * 12;
      ctx.fillStyle = colors[i] || colors[2];
      ctx.beginPath();
      ctx.arc(cx, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Dark border
      ctx.strokeStyle = "#1A1A2E";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Flowers/fruits when mature
    if (p > 0.6) {
      const flowerCount = Math.floor(p * 6);
      for (let i = 0; i < flowerCount; i++) {
        const angle = (i / flowerCount) * Math.PI * 2;
        const r = 18 + p * 8;
        const fx = cx + Math.cos(angle) * r;
        const fy = s - trunkH - 20 + Math.sin(angle) * r * 0.5;
        ctx.fillStyle = i % 2 === 0 ? "#FFD166" : "#EF476F";
        ctx.beginPath();
        ctx.arc(fx, fy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1A1A2E";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    // Stars when fully grown
    if (p >= 1) {
      ctx.fillStyle = "#FFD166";
      ctx.font = `${s * 0.2}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("⭐", cx, 20);
    }
  }

  function drawCrystal(ctx, s, p) {
    const cx = s / 2, cy = s / 2;
    if (p <= 0) {
      ctx.strokeStyle = "rgba(99,102,241,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    // Glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.4 * p);
    grd.addColorStop(0, `rgba(99,102,241,${0.3 * p})`);
    grd.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, s, s);

    // Crystal facets
    const facets = Math.max(3, Math.floor(3 + p * 5));
    const outerR = 15 + p * (s * 0.35);
    const innerR = outerR * 0.4;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p * Math.PI * 0.25);

    // Outer crystal
    ctx.beginPath();
    for (let i = 0; i < facets * 2; i++) {
      const angle = (i / (facets * 2)) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? outerR : innerR;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();

    const crystalGrd = ctx.createLinearGradient(-outerR, -outerR, outerR, outerR);
    crystalGrd.addColorStop(0, `rgba(139,92,246,${0.6 + p * 0.4})`);
    crystalGrd.addColorStop(0.5, `rgba(99,102,241,${0.8})`);
    crystalGrd.addColorStop(1, `rgba(6,182,212,${0.6 + p * 0.4})`);
    ctx.fillStyle = crystalGrd;
    ctx.fill();
    ctx.strokeStyle = `rgba(200,182,255,${0.5 + p * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner shine
    if (p > 0.3) {
      ctx.beginPath();
      ctx.arc(outerR * -0.2, outerR * -0.2, outerR * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p * 0.4})`;
      ctx.fill();
    }

    ctx.restore();

    // Level indicator
    if (p >= 1) {
      ctx.fillStyle = "rgba(99,102,241,0.9)";
      ctx.font = `bold ${s * 0.18}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("MAX", cx, s - 4);
    }
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      aria-label={`Focus tree: ${minutes} minutes of focus time`}
      title={`${minutes} min focused - ${Math.round(Math.min(minutes / 25, 1) * 100)}% grown`}
      style={{ display: "block" }}
    />
  );
}
