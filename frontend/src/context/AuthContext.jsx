import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import apiClient from '../api/client';
import { normalizeApiError } from '../api/resources';
import { demoCredentials } from '../data/demoData';

const AuthContext = createContext(null);
const DEMO_TOKEN = 'demo-access-token';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
    const [sessionSource, setSessionSource] = useState(localStorage.getItem('auth_source') || null);
    const navigate = useNavigate();

    const login = async (email, password) => {
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);

            const response = await apiClient.post('/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const newToken = response.data.access_token;
            setToken(newToken);
            setSessionSource('api');
            localStorage.setItem('access_token', newToken);
            localStorage.setItem('auth_source', 'api');
            navigate('/');
            return { success: true };
        } catch (error) {
            const apiError = normalizeApiError(error);
            const canUseDemoCredentials =
                apiError.isNetworkError &&
                email === demoCredentials.email &&
                password === demoCredentials.password;

            if (canUseDemoCredentials) {
                setToken(DEMO_TOKEN);
                setSessionSource('demo');
                localStorage.setItem('access_token', DEMO_TOKEN);
                localStorage.setItem('auth_source', 'demo');
                navigate('/');
                return { success: true, mode: 'demo' };
            }

            return {
                success: false,
                error: apiError.message,
            };
        }
    };

    const logout = () => {
        setToken(null);
        setSessionSource(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_source');
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                isAuthenticated: !!token,
                isDemoSession: sessionSource === 'demo',
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
