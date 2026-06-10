/**
 * Dynamic Favicon - changes based on emotion state
 * Draws emoji onto a canvas and sets as favicon
 */

const EMOTION_FAVICONS = {
  neutral:   "🧠",
  happy:     "😊",
  focused:   "🎯",
  tired:     "😴",
  confused:  "🤔",
  celebration: "🎉",
};

let currentEmotion = null;

export function updateFavicon(emotion) {
  if (emotion === currentEmotion) return;
  currentEmotion = emotion;

  try {
    const emoji = EMOTION_FAVICONS[emotion] || EMOTION_FAVICONS.neutral;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");
    ctx.font = "28px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, 16, 18);

    const link = document.querySelector("link[rel~='icon']") || document.createElement("link");
    link.type = "image/x-icon";
    link.rel = "shortcut icon";
    link.href = canvas.toDataURL();
    document.head.appendChild(link);
  } catch (e) {
    // Silently fail - favicon is non-critical
  }
}

export function resetFavicon() {
  currentEmotion = null;
  const link = document.querySelector("link[rel~='icon']");
  if (link) link.href = "/favicon.ico";
}
