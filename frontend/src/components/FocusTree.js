import { useEffect, useRef } from "react";
import { useGradeTheme } from "@/lib/useGradeTheme";

/**
 * FocusTree - grows a tree/crystal based on focus time
 * Junior: cartoon tree with branches + fruits sprouting dramatically
 * Senior: geometric crystal growing facets
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

    const progress = Math.min(minutes / 25, 1);

    if (isJunior) {
      drawCartoonTree(ctx, size, progress);
    } else {
      drawCrystal(ctx, size, progress);
    }
  }, [minutes, size, isJunior]);

  function drawBranch(ctx, x, y, angle, length, depth, color) {
    if (depth === 0 || length < 3) return;
    const endX = x + Math.cos(angle) * length;
    const endY = y - Math.sin(angle) * length;
    ctx.strokeStyle = depth > 2 ? "#8B5E3C" : color;
    ctx.lineWidth = Math.max(1, depth * 1.2);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    // Draw leaves at tips
    if (depth === 1) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(endX, endY, 4 + Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    const spread = Math.PI / 5 + Math.random() * 0.2;
    drawBranch(ctx, endX, endY, angle + spread, length * 0.68, depth - 1, color);
    drawBranch(ctx, endX, endY, angle - spread, length * 0.68, depth - 1, color);
  }

  function drawCartoonTree(ctx, s, p) {
    const cx = s / 2;
    const baseY = s - 8;

    // Ground patch
    ctx.fillStyle = "#a3e635";
    ctx.beginPath();
    ctx.ellipse(cx, baseY, 28 * Math.min(p + 0.2, 1), 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (p <= 0.02) {
      // Seed
      ctx.fillStyle = "#8B5E3C";
      ctx.beginPath();
      ctx.arc(cx, baseY - 6, 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // Trunk
    const trunkH = 10 + p * 30;
    const trunkW = 5 + p * 4;
    ctx.fillStyle = "#8B5E3C";
    ctx.beginPath();
    ctx.roundRect(cx - trunkW / 2, baseY - trunkH, trunkW, trunkH, 3);
    ctx.fill();
    ctx.strokeStyle = "#5a3a1a";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (p < 0.1) return;

    // Branch system — more dramatic branching as progress grows
    const branchDepth = p < 0.3 ? 2 : p < 0.6 ? 3 : 4;
    const leafColors = ["#06D6A0", "#10B981", "#059669", "#34d399"];
    const branchStartY = baseY - trunkH;
    const branchLen = 10 + p * 22;

    ctx.save();
    leafColors.forEach((color, i) => {
      const angleOffset = (i / leafColors.length) * Math.PI * 2;
      const startAngle = Math.PI / 2 + angleOffset * 0.2;
      drawBranch(ctx, cx, branchStartY, startAngle + 0.3 + i * 0.15, branchLen, branchDepth, color);
    });
    ctx.restore();

    // Canopy glow overlay
    if (p > 0.25) {
      const canopyR = 12 + p * 24;
      const canopyY = branchStartY - canopyR * 0.4;
      const grad = ctx.createRadialGradient(cx, canopyY, 0, cx, canopyY, canopyR);
      grad.addColorStop(0, `rgba(6,214,160,${0.25 * p})`);
      grad.addColorStop(1, "rgba(6,214,160,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, canopyY, canopyR, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fruits / flowers appear at p > 0.5
    if (p > 0.5) {
      const fruitCount = Math.floor((p - 0.5) * 16);
      for (let i = 0; i < fruitCount; i++) {
        const angle = (i / Math.max(fruitCount, 1)) * Math.PI * 2;
        const r = 10 + p * 20;
        const fx = cx + Math.cos(angle) * r;
        const fy = baseY - trunkH - 8 + Math.sin(angle) * r * 0.6;
        ctx.fillStyle = i % 3 === 0 ? "#FFD166" : i % 3 === 1 ? "#EF476F" : "#C8B6FF";
        ctx.beginPath();
        ctx.arc(fx, fy, 4 + p * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#1A1A2E";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Crown star + sparkles at 100%
    if (p >= 1) {
      ctx.fillStyle = "#FFD166";
      ctx.font = `bold ${s * 0.18}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("⭐", cx, 16);
      // Sparkle dots
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillStyle = "#FFD166";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 20, 18 + Math.sin(a) * 12, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
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

    // Background glow
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, s * 0.48 * p);
    grd.addColorStop(0, `rgba(99,102,241,${0.35 * p})`);
    grd.addColorStop(1, "rgba(99,102,241,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, s, s);

    // Outer crystal
    const facets = Math.max(3, Math.floor(3 + p * 5));
    const outerR = 12 + p * (s * 0.38);
    const innerR = outerR * 0.38;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(p * Math.PI * 0.3);

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
    crystalGrd.addColorStop(0, `rgba(139,92,246,${0.55 + p * 0.45})`);
    crystalGrd.addColorStop(0.5, `rgba(99,102,241,0.85)`);
    crystalGrd.addColorStop(1, `rgba(6,182,212,${0.55 + p * 0.45})`);
    ctx.fillStyle = crystalGrd;
    ctx.fill();
    ctx.strokeStyle = `rgba(200,182,255,${0.5 + p * 0.5})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner shine facets as p grows
    if (p > 0.4) {
      const innerFacets = Math.floor(p * 4);
      for (let i = 0; i < innerFacets; i++) {
        const a = (i / innerFacets) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(Math.cos(a) * outerR * 0.35, Math.sin(a) * outerR * 0.35, outerR * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p * 0.35})`;
        ctx.fill();
      }
    }

    // Primary shine
    if (p > 0.2) {
      ctx.beginPath();
      ctx.arc(outerR * -0.22, outerR * -0.22, outerR * 0.14, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p * 0.45})`;
      ctx.fill();
    }

    ctx.restore();

    if (p >= 1) {
      ctx.fillStyle = "rgba(99,102,241,0.9)";
      ctx.font = `bold ${s * 0.16}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("MAX", cx, s - 3);
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
