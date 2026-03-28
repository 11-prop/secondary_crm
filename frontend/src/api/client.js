// frontend/src/api/client.js
import axios from 'axios';

function resolveBaseURL() {
    const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;

    if (typeof window !== 'undefined') {
        const isDirectLocalPreview =
            window.location.hostname === 'localhost' &&
            window.location.port === '4173' &&
            (!configuredBaseURL || configuredBaseURL === '/api');

        if (isDirectLocalPreview) {
            return `${window.location.protocol}//${window.location.hostname}:9000/api`;
        }
    }

    return configuredBaseURL || 'http://localhost:9000/api';
}

const baseURL = resolveBaseURL();

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
