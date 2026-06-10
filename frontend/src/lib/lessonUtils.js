/** Get disability-specific adaptation text from lesson */
export function getAdaptationText(lesson, disability) {
  if (!lesson || !disability) return null;
  const map = {
    dyslexia: lesson.dyslexia_adaptation,
    visual: lesson.visual_adaptation,
    hearing: lesson.hearing_adaptation,
    cognitive: lesson.cognitive_adaptation,
    motor: lesson.motor_adaptation,
  };
  const val = map[disability] || null;
  
  // If the adaptation is an object (e.g. for visual mode), return a relevant string
  if (val && typeof val === 'object') {
    return val.visual || val.audio || val.reading || val.interactive || null;
  }
  
  return val;
}

export function highlightKeywords(text, keywords = []) {
  if (!text || !keywords?.length) return text;
  let result = text;
  keywords.forEach((kw) => {
    if (!kw) return;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`(${escaped})`, "gi"), '<span class="keyword-highlight">$1</span>');
  });
  return result;
}
