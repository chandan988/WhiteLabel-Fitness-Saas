import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = rawBaseUrl.endsWith("/api")
  ? rawBaseUrl
  : `${rawBaseUrl.replace(/\/$/, "")}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem("coach_tokens");
  if (stored) {
    const { accessToken } = JSON.parse(stored);
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error", error?.response || error);
    return Promise.reject(error);
  }
);

export const getTenantBySlug = (slug) => api.get(`/tenants/slug/${slug}`);
export const signupCoach = (payload) => api.post("/auth/signup", payload);
export const verifyEmail = (payload) => api.post("/auth/verify-email", payload);
export const login = (payload) => api.post("/auth/login", payload);
export const setPassword = (payload) => api.post("/auth/set-password", payload);
export const updateProfile = (payload) => api.patch("/auth/profile", payload);
export const changePassword = (payload) =>
  api.post("/auth/change-password", payload);
export const getDashboardSummary = () => api.get("/dashboard/summary");
export const getStepsTrend = () => api.get("/dashboard/steps");
export const getCaloriesTrend = () => api.get("/dashboard/calories");
export const getWeightTrend = () => api.get("/dashboard/weight");
export const getNutritionTrend = () => api.get("/dashboard/nutrition");
export const getClients = (tenantId) =>
  api.get("/clients", { params: { tenantId } });
export const getClient = (id) => api.get(`/clients/${id}`);
export const getClientHealth = (id, params) =>
  api.get(`/clients/${id}/health`, { params });
export const createClient = (payload) => api.post("/clients", payload);
export const updateClient = (id, payload) => api.patch(`/clients/${id}`, payload);
export const assignClientWorkout = (id, payload) =>
  api.post(`/clients/${id}/assign-workout`, payload);
export const assignClientMeal = (id, payload) =>
  api.post(`/clients/${id}/assign-meal`, payload);
export const updateClientWorkoutStatus = (id, payload) =>
  api.post(`/clients/${id}/workout-status`, payload);
export const updateClientMealStatus = (id, payload) =>
  api.post(`/clients/${id}/meal-status`, payload);
export const updateTenant = (id, payload) => api.patch(`/tenants/${id}`, payload);
export const getLeads = (params = {}) => api.get("/leads", { params });
export const getLeadById = (id) => api.get(`/leads/${id}`);
export const createLead = (payload) => api.post("/leads", payload);
export const updateLead = (id, payload) => api.patch(`/leads/${id}`, payload);
export const convertLead = (id) => api.post(`/leads/${id}/convert`);
export const revertClientToLead = (clientId) =>
  api.post(`/leads/clients/${clientId}/revert`);
export const searchWorkoutLibrary = (params) =>
  api.get("/library/workouts", { params });
export const searchFoodLibrary = (params) =>
  api.get("/library/foods", { params });
export const addLeadFollowUp = (id, payload) =>
  api.post(`/leads/${id}/followups`, payload);
export const getDueFollowUps = (params = {}) =>
  api.get("/followups/due", { params });
