/**
 * NeuraLearn Offline DB - IndexedDB via Dexie
 * Stores pending quiz submissions and cached lessons for offline use
 */
import Dexie from "dexie";

const db = new Dexie("NeuraLearnOffline");

db.version(1).stores({
  pendingQuizzes: "++id, lesson_id, timestamp, synced",
  cachedLessons: "id, grade, subject, cached_at",
  offlineSettings: "key",
});

// ── Save a quiz submission for later sync ──────────────────────────────────
export async function savePendingQuiz(quizData) {
  await db.pendingQuizzes.add({
    ...quizData,
    timestamp: Date.now(),
    synced: false,
  });
}

// ── Get all unsynced quiz submissions ──────────────────────────────────────
export async function getPendingQuizzes() {
  return db.pendingQuizzes.where("synced").equals(0).toArray();
}

// ── Mark a quiz as synced ──────────────────────────────────────────────────
export async function markQuizSynced(id) {
  await db.pendingQuizzes.update(id, { synced: true });
}

// ── Cache lessons for offline use ─────────────────────────────────────────
export async function cacheLessons(lessons) {
  await db.cachedLessons.bulkPut(
    lessons.map((l) => ({ ...l, cached_at: Date.now() }))
  );
}

// ── Get cached lessons ─────────────────────────────────────────────────────
export async function getCachedLessons(grade) {
  if (grade) return db.cachedLessons.where("grade").equals(grade).toArray();
  return db.cachedLessons.toArray();
}

// ── Sync pending quizzes to backend ───────────────────────────────────────
export async function syncPendingQuizzes(apiInstance) {
  const pending = await getPendingQuizzes();
  let synced = 0;
  for (const quiz of pending) {
    try {
      await apiInstance.post("/lessons/submit-quiz", {
        lesson_id: quiz.lesson_id,
        answers: quiz.answers,
        time_spent_seconds: quiz.time_spent_seconds,
      });
      await markQuizSynced(quiz.id);
      synced++;
    } catch {}
  }
  return synced;
}

export default db;
