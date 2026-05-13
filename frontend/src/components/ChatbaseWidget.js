import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

/**
 * ChatbaseWidget - identifies the logged-in user with Chatbase
 * The widget script is loaded in public/index.html
 * This component handles user identification via signed JWT
 */
export default function ChatbaseWidget() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const identifyUser = async () => {
      try {
        // Get signed identity token from backend
        const { data } = await api.get("/chatbase/token");
        if (data.token && window.chatbase) {
          window.chatbase("identify", { token: data.token });
        }
      } catch {
        // Silently fail - widget still works anonymously
      }
    };

    // Wait for chatbase to be ready
    const tryIdentify = () => {
      if (window.chatbase && typeof window.chatbase === "function") {
        identifyUser();
      } else {
        setTimeout(tryIdentify, 500);
      }
    };

    tryIdentify();
  }, [user]);

  // No UI - widget is injected by the script in index.html
  return null;
}
