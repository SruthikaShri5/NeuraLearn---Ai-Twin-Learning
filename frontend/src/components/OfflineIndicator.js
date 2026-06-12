import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { useGradeTheme } from "@/lib/useGradeTheme";
import { WifiOff, Wifi, RefreshCw, CloudOff } from "lucide-react";
import { getPendingQuizzes, syncPendingQuizzes } from "@/lib/offlineDB";
import api from "@/lib/api";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);
  const [syncedCount, setSyncedCount] = useState(0);
  const { offlineQueueCount, setOfflineQueueCount } = useAppStore();
  const { isJunior, isSenior } = useGradeTheme();

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Poll pending queue count
  useEffect(() => {
    const updateCount = async () => {
      try {
        const pending = await getPendingQuizzes();
        setOfflineQueueCount(pending.length);
      } catch {}
    };
    updateCount();
    const interval = setInterval(updateCount, 10000);
    return () => clearInterval(interval);
  }, [setOfflineQueueCount]);

  // Auto-sync when back online
  useEffect(() => {
    if (isOnline && offlineQueueCount > 0) {
      handleSync();
    }
  }, [isOnline, offlineQueueCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSync = async () => {
    setSyncing(true);
    try {
      const count = await syncPendingQuizzes(api);
      setSyncedCount(count);
      const pending = await getPendingQuizzes();
      setOfflineQueueCount(pending.length);
      if (count > 0) {
        setTimeout(() => setSyncedCount(0), 3000);
      }
    } catch {}
    setSyncing(false);
  };

  // Online with no queue - show nothing
  if (isOnline && offlineQueueCount === 0 && syncedCount === 0) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold shadow-lg transition-all ${
        !isOnline
          ? isJunior
            ? "bg-[#EF476F] text-white border-2 border-[#1A1A2E]"
            : "bg-red-900/80 text-red-200 border border-red-500/40 backdrop-blur-md"
          : syncedCount > 0
            ? isJunior
              ? "bg-[#06D6A0] text-[#1A1A2E] border-2 border-[#1A1A2E]"
              : "bg-emerald-900/80 text-emerald-200 border border-emerald-500/40 backdrop-blur-md"
            : isJunior
              ? "bg-[#FFD166] text-[#1A1A2E] border-2 border-[#1A1A2E]"
              : "bg-amber-900/80 text-amber-200 border border-amber-500/40 backdrop-blur-md"
      }`}
      role="status"
      aria-live="polite"
      data-testid="offline-indicator"
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>{isJunior ? "No internet 😢" : "Offline"}</span>
          {offlineQueueCount > 0 && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              isJunior ? "bg-white text-[#EF476F]" : "bg-red-500 text-white"
            }`}>
              {offlineQueueCount} pending
            </span>
          )}
        </>
      ) : syncedCount > 0 ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>{isJunior ? `✅ Synced ${syncedCount} answers!` : `Synced ${syncedCount} submission${syncedCount > 1 ? "s" : ""}`}</span>
        </>
      ) : (
        <>
          <CloudOff className="w-4 h-4" />
          <span>{offlineQueueCount} pending</span>
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-lg ${
              isJunior ? "bg-white/30 hover:bg-white/50" : "bg-amber-500/20 hover:bg-amber-500/30"
            }`}
            aria-label="Sync now"
          >
            <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync"}
          </button>
        </>
      )}
    </div>
  );
}
