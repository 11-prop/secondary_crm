// frontend/src/api/client.js
import axios from 'axios';

// Fallback to localhost just in case the env var is missing during local dev
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
    baseURL: baseURL,
});

// Automatically attach JWT token to every request
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;