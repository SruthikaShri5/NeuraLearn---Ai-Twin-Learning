export const DISABILITY_LABELS = {
  dyslexia: "Dyslexia",
  visual: "Visual Impairment",
  hearing: "Hearing Impairment",
  motor: "Motor / Mobility",
  cognitive: "Cognitive / Learning",
  speech: "Speech / Communication",
  multiple: "Multiple Needs",
  prefer_not_to_say: "Standard Mode",
};

export const DISABILITY_PROFILES = {
  dyslexia: { bodyClass: "disability-dyslexia", autoRead: true, tip: "Short sentences, highlighted keywords, and read-aloud support." },
  visual: { bodyClass: "disability-visual", autoRead: true, tip: "Content is read aloud. Press R to hear the page." },
  hearing: { bodyClass: "disability-hearing", autoRead: false, tip: "Visual cards and text — no audio needed." },
  motor: { bodyClass: "disability-motor", autoRead: false, tip: "Large buttons and keyboard 1–4 in quizzes." },
  cognitive: { bodyClass: "disability-cognitive", autoRead: false, tip: "One step at a time with hints." },
  speech: { bodyClass: "disability-speech", autoRead: false, tip: "Text-only — no speaking required." },
  multiple: { bodyClass: "disability-multiple", autoRead: true, tip: "Combined visual, text, and optional read-aloud." },
  prefer_not_to_say: { bodyClass: "disability-standard", autoRead: false, tip: "Change your learning needs anytime in Settings." },
};

export function getDisabilityProfile(type) {
  return DISABILITY_PROFILES[type] || DISABILITY_PROFILES.prefer_not_to_say;
}

export function applyDisabilityBodyClass(disabilityType) {
  Object.values(DISABILITY_PROFILES).forEach((p) => {
    if (p.bodyClass) document.body.classList.remove(p.bodyClass);
  });
  const profile = getDisabilityProfile(disabilityType);
  if (profile?.bodyClass) document.body.classList.add(profile.bodyClass);
}
