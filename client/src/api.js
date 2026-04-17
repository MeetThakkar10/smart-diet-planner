import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ---- Auth ----
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// ---- Diseases ----
export const getDiseases = () => API.get("/diseases");
export const createDisease = (data) => API.post("/diseases", data);
export const updateDisease = (id, data) => API.put(`/diseases/${id}`, data);
export const deleteDisease = (id) => API.delete(`/diseases/${id}`);

// ---- Foods ----
export const getFoods = (params) => API.get("/foods", { params });
export const createFood = (data) => API.post("/foods", data);
export const updateFood = (id, data) => API.put(`/foods/${id}`, data);
export const deleteFood = (id) => API.delete(`/foods/${id}`);

// ---- AI ----
export const generateDietPlan = (data) => API.post("/ai/generate", data);

// ---- Diet Logs ----
export const addDietLog = (data) => API.post("/dietlog", data);
export const getMyDietLogs = () => API.get("/dietlog");
export const getDietLog = (id) => API.get(`/dietlog/${id}`);
export const getAllDietLogs = () => API.get("/dietlog/admin/all");

export default API;
