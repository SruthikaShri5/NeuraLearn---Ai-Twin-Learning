import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { formatApiError } from "./api";
import { useAppStore } from "./store";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = checking, false = not auth
  const [loading, setLoading] = useState(true);

  const applyUserSettings = useCallback((userData) => {
    if (!userData?.settings) return;
    const s = userData.settings;
    const store = useAppStore.getState();
    store.updateSettings({
      highContrast: s.high_contrast || false,
      fontSize: s.font_size || "medium",
      reduceMotion: s.reduce_motion || false,
      hapticIntensity: s.haptic_intensity || "medium",
      soundscapeVolume: s.soundscape_volume ?? 50,
      federatedSharing: s.federated_sharing ?? true,
    });
    // Apply grade group
    if (userData.grade_level) {
      store.setGradeGroup(userData.grade_level);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      applyUserSettings(data.user);
    } catch {
      setUser(false);
    } finally {
      setLoading(false);
    }
  }, [applyUserSettings]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (data.access_token) localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    applyUserSettings(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    if (data.access_token) localStorage.setItem("access_token", data.access_token);
    setUser(data.user);
    applyUserSettings(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    localStorage.removeItem("access_token");
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
