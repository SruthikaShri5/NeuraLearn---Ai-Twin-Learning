import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { formatApiError } from "./api";
import { useAppStore } from "./store";
import { applyDisabilityBodyClass } from "./disabilityProfiles";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=not-auth, object=auth
  const [loading, setLoading] = useState(true);

  const applyUserSettings = useCallback((userData) => {
    if (!userData?.settings) return;
    const s = userData.settings;
    const store = useAppStore.getState();
    store.updateSettings({
      highContrast:     s.high_contrast    || false,
      fontSize:         s.font_size        || "medium",
      reduceMotion:     s.reduce_motion    || false,
      hapticIntensity:  s.haptic_intensity || "medium",
      soundscapeVolume: s.soundscape_volume ?? 50,
      federatedSharing: s.federated_sharing ?? true,
    });
    if (userData.grade_level) {
      store.setGradeGroup(userData.grade_level);
    }
    if (userData.disability_type) {
      applyDisabilityBodyClass(userData.disability_type);
    }
    // Re-apply empowerment classes from learning profile
    const profile = userData.learning_profile || {};
    const empowerment = {
      'dyslexia-font': profile.dyslexia_font_active,
      'step-mode': profile.step_mode_active,
      'large-targets': profile.large_targets_active,
      'high-contrast': s.high_contrast,
      'captions-active': profile.captions_active,
      'visual-feedback': profile.visual_feedback_active,
    };
    Object.entries(empowerment).forEach(([cls, active]) => {
      if (active) document.body.classList.add(cls);
      else document.body.classList.remove(cls);
    });
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      // Try with existing token first
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      applyUserSettings(data.user);
    } catch {
      // Token expired or missing — try silent refresh
      try {
        const { data: refreshData } = await api.post("/auth/refresh");
        if (refreshData.access_token) {
          localStorage.setItem("access_token", refreshData.access_token);
        }
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        applyUserSettings(data.user);
      } catch {
        localStorage.removeItem("access_token");
        setUser(false);
      }
    } finally {
      setLoading(false);
    }
  }, [applyUserSettings]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    // Clear any stale token before attempting login
    localStorage.removeItem("access_token");

    const { data } = await api.post("/auth/login", { email, password });

    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    setUser(data.user);
    applyUserSettings(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    }
    setUser(data.user);
    applyUserSettings(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Even if the server call fails, clear everything locally
    }
    // Clear all local auth state
    localStorage.removeItem("access_token");
    // Reset user state — this triggers re-render and redirects to login
    setUser(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    applyUserSettings(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}

export { formatApiError };
