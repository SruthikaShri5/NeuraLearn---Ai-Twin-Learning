/**
 * FSRS (Free Spaced Repetition Scheduler) - v4 simplified
 * Based on: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * Replaces SM-2 for more accurate scheduling.
 * Works entirely on the frontend - no backend changes needed.
 */

const FSRS_WEIGHTS = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61];
const DECAY = -0.5;
const FACTOR = 0.9 ** (1 / DECAY) - 1;
const REQUEST_RETENTION = 0.9;

function forgettingCurve(elapsedDays, stability) {
  return (1 + FACTOR * (elapsedDays / stability)) ** DECAY;
}

function initStability(grade) {
  // grade: 1=again, 2=hard, 3=good, 4=easy
  return Math.max(0.1, FSRS_WEIGHTS[grade - 1]);
}

function initDifficulty(grade) {
  return Math.min(10, Math.max(1, FSRS_WEIGHTS[4] - FSRS_WEIGHTS[5] * (grade - 3)));
}

function nextInterval(stability) {
  return Math.max(1, Math.round((stability / FACTOR) * (REQUEST_RETENTION ** (1 / DECAY) - 1)));
}

function updateStability(difficulty, stability, retrievability, grade) {
  if (grade === 1) {
    // Forgot - reset
    return FSRS_WEIGHTS[11] * (11 - difficulty) * stability ** (-FSRS_WEIGHTS[12]) * (Math.exp(FSRS_WEIGHTS[13] * (1 - retrievability)) - 1);
  }
  // Remembered
  const hardPenalty = grade === 2 ? FSRS_WEIGHTS[15] : 1;
  const easyBonus = grade === 4 ? FSRS_WEIGHTS[16] : 1;
  return stability * (
    Math.exp(FSRS_WEIGHTS[8]) *
    (11 - difficulty) *
    stability ** (-FSRS_WEIGHTS[9]) *
    (Math.exp(FSRS_WEIGHTS[10] * (1 - retrievability)) - 1) *
    hardPenalty * easyBonus + 1
  );
}

function updateDifficulty(difficulty, grade) {
  const delta = -FSRS_WEIGHTS[6] * (grade - 3);
  return Math.min(10, Math.max(1, difficulty + delta));
}

/**
 * Convert quiz score (0-100) to FSRS grade (1-4)
 */
export function scoreToGrade(score) {
  if (score >= 90) return 4; // Easy
  if (score >= 70) return 3; // Good
  if (score >= 50) return 2; // Hard
  return 1;                  // Again
}

/**
 * Calculate next review using FSRS
 * @param {object} card - existing FSRS card data (null for new card)
 * @param {number} score - quiz score 0-100
 * @returns {object} updated card with next_review_date
 */
export function fsrsNextReview(card, score) {
  const grade = scoreToGrade(score);
  const now = new Date();

  if (!card || !card.stability) {
    // New card
    const stability = initStability(grade);
    const difficulty = initDifficulty(grade);
    const interval = grade === 1 ? 1 : nextInterval(stability);
    const nextReview = new Date(now.getTime() + interval * 86400000);
    return {
      stability: Math.round(stability * 100) / 100,
      difficulty: Math.round(difficulty * 100) / 100,
      interval,
      repetitions: grade === 1 ? 0 : 1,
      last_review: now.toISOString(),
      next_review_date: nextReview.toISOString(),
      grade,
    };
  }

  // Existing card
  const elapsedDays = Math.max(0, (now - new Date(card.last_review)) / 86400000);
  const retrievability = forgettingCurve(elapsedDays, card.stability);
  const newStability = updateStability(card.difficulty, card.stability, retrievability, grade);
  const newDifficulty = updateDifficulty(card.difficulty, grade);
  const interval = grade === 1 ? 1 : nextInterval(newStability);
  const nextReview = new Date(now.getTime() + interval * 86400000);

  return {
    stability: Math.round(newStability * 100) / 100,
    difficulty: Math.round(newDifficulty * 100) / 100,
    interval,
    repetitions: grade === 1 ? 0 : (card.repetitions || 0) + 1,
    last_review: now.toISOString(),
    next_review_date: nextReview.toISOString(),
    grade,
  };
}

/**
 * Migrate SM-2 data to FSRS format
 */
export function migrateSM2ToFSRS(sm2Record) {
  const stability = Math.max(0.5, (sm2Record.interval || 1) * 0.8);
  const difficulty = Math.max(1, Math.min(10, 10 - (sm2Record.ease_factor || 2.5) * 2));
  return {
    stability,
    difficulty,
    interval: sm2Record.interval || 1,
    repetitions: sm2Record.repetitions || 0,
    last_review: sm2Record.next_review_date
      ? new Date(new Date(sm2Record.next_review_date) - (sm2Record.interval || 1) * 86400000).toISOString()
      : new Date().toISOString(),
    next_review_date: sm2Record.next_review_date || new Date().toISOString(),
  };
}
