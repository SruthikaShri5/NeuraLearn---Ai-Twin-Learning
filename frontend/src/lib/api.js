import axios from "axios";

// Use local backend in development, production URL in production
const API_URL = process.env.NODE_ENV === "development" 
  ? (process.env.REACT_APP_BACKEND_URL || "http://localhost:8000")
  : (process.env.REACT_APP_BACKEND_URL || "https://neuralearn-backend.onrender.com");

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Add token from localStorage as fallback
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401 — interceptor handles non-auth routes only
// NOTE: /auth/me is handled manually in checkAuth, not here
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const url = original.url || "";

    // Skip retry for all auth endpoints AND /auth/me (handled in checkAuth)
    const skipRetry = url.includes("/auth/");

    if (error.response?.status === 401 && !original._retry && !skipRetry) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return api(original);
      } catch {
        localStorage.removeItem("access_token");
        // Only redirect if not already on a public page
        const path = window.location.pathname;
        if (path !== "/" && path !== "/login" && path !== "/signup") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e?.msg ? e.msg : JSON.stringify(e))).join(" ");
  if (detail?.msg) return detail.msg;
  return String(detail);
}

export default api;
