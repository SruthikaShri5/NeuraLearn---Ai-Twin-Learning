const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Background rounded square
  const r = size * 0.22;
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();

  // Gradient fill
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, "#118AB2");
  grad.addColorStop(1, "#06D6A0");
  ctx.fillStyle = grad;
  ctx.fill();

  // Brain emoji-style icon (draw a simple brain shape)
  const cx = size / 2;
  const cy = size / 2;
  const fs2 = size * 0.55;
  ctx.font = `${fs2}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.fillText("??", cx, cy);

  return canvas.toBuffer("image/png");
}

for (const size of sizes) {
  try {
    const buf = drawIcon(size);
    fs.writeFileSync(path.join(outDir, `icon-${size}x${size}.png`), buf);
    console.log(`Generated icon-${size}x${size}.png`);
  } catch(e) {
    console.log(`Skipped ${size}: ${e.message}`);
  }
}
