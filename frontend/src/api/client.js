// frontend/src/api/client.js
import axios from 'axios';

function normalizeConfiguredBaseURL(rawBaseURL) {
    if (!rawBaseURL) {
        return '';
    }

    const configuredBaseURL = rawBaseURL.trim();
    if (!configuredBaseURL || typeof window === 'undefined') {
        return configuredBaseURL.replace(/\/$/, '');
    }

    try {
        const resolvedURL = new URL(configuredBaseURL, window.location.origin);
        const isSameHostname = resolvedURL.hostname === window.location.hostname;

        if (isSameHostname) {
            const normalizedPath = `${resolvedURL.pathname}${resolvedURL.search}${resolvedURL.hash}`.replace(/\/$/, '');
            return normalizedPath || '/';
        }

        return resolvedURL.toString().replace(/\/$/, '');
    } catch {
        return configuredBaseURL.replace(/\/$/, '');
    }
}

function resolveBaseURL() {
    const configuredBaseURL = normalizeConfiguredBaseURL(import.meta.env.VITE_API_BASE_URL);

    if (typeof window !== 'undefined') {
        const isDirectLocalPreview =
            window.location.hostname === 'localhost' &&
            window.location.port === '4173' &&
            (!configuredBaseURL || configuredBaseURL === '/api');

        if (isDirectLocalPreview) {
            return `${window.location.protocol}//${window.location.hostname}:9000/api`;
        }

        if (!configuredBaseURL) {
            return `${window.location.origin}/api`;
        }
    }

    return configuredBaseURL || '/api';
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
