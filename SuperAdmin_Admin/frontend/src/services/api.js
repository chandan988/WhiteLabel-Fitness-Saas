import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:6060";

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("super_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const adminLogin = (payload) => api.post("/auth/superadmin/login", payload);
export const coachLogin = (payload) => api.post("/auth/coach/login", payload);
export const coachSetup = (payload) => api.post("/auth/coach/setup", payload);

export const createCoach = (payload) => api.post("/admin/coaches", payload);
export const listCoaches = () => api.get("/admin/coaches");
export const updateCoach = (id, payload) => api.patch(`/admin/coaches/${id}`, payload);
export const resetCoachPassword = (id) =>
  api.post(`/admin/coaches/${id}/reset-password`);
export const deleteCoach = (id) => api.delete(`/admin/coaches/${id}`);

export const getCoachProfile = () => api.get("/coach/profile");
export const getCoachBranding = () => api.get("/coach/branding");
export const getCoachStats = () => api.get("/coach/stats");

export const getClients = () => api.get("/clients");
export const postClient = (payload) => api.post("/clients", payload);
export const patchClient = (id, payload) => api.patch(`/clients/${id}`, payload);

export const getDailyContent = (params) => api.get("/content/daily", { params });
export const getAdminDailyContent = (params) =>
  api.get("/admin/daily-content", { params });
export const listDailyOverrides = () =>
  api.get("/admin/daily-content/overrides");
export const createDailyOverride = (payload) =>
  api.post("/admin/daily-content/override", payload);
export const updateDailyOverride = (id, payload) =>
  api.patch(`/admin/daily-content/${id}`, payload);
export const deleteDailyOverride = (id) =>
  api.delete(`/admin/daily-content/${id}`);

export default api;
