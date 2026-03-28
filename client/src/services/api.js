import axios from 'axios';

// const API_URL = 'http://localhost:5000/api';
const rawAPI = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';
const API_URL = rawAPI.endsWith('/api')
  ? rawAPI
  : rawAPI.endsWith('/')
    ? `${rawAPI}api`
    : `${rawAPI}/api`;

const api = axios.create({
    baseURL: API_URL,
});

// Add Token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
        localStorage.setItem('token', res.data.token);
    }
    return res.data;
};

export const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    if (res.data.token) {
        localStorage.setItem('token', res.data.token);
    }
    return res.data;
};

export const getUserData = async () => {
    const res = await api.get('/user');
    return res.data;
};

export const updateSettings = async (settings) => {
    const res = await api.put('/user/settings', settings);
    return res.data;
};

export const updateProfile = async (profileData) => {
    const res = await api.put('/user/profile', profileData);
    return res.data;
};

export const addToHistory = async (historyItem) => {
    const res = await api.post('/user/history', historyItem);
    return res.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('weatherData');
    localStorage.removeItem('appSettings');
};
export const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/user/password', { currentPassword, newPassword });
    return res.data;
};

export const toggle2FA = async (enabled) => {
    const res = await api.put('/user/2fa', { enabled });
    return res.data;
};

export const forgotPassword = async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
};

export const resetPassword = async (token, password) => {
    const res = await api.post('/auth/reset-password', { token, password });
    return res.data;
};

export default api;
