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

// Auto-refresh on 401 — but NOT on auth endpoints themselves
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthEndpoint = original.url?.includes("/auth/");

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthEndpoint
    ) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");
        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          original.headers.Authorization = `Bearer ${data.access_token}`;
        }
        return api(original);
      } catch {
        // Refresh failed — clear token and redirect to login
        localStorage.removeItem("access_token");
        window.location.href = "/";
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
