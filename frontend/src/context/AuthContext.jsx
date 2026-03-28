import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import apiClient from '../api/client';
import { normalizeApiError } from '../api/resources';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('access_token') || null);
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
            localStorage.setItem('access_token', newToken);
            navigate('/');
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: normalizeApiError(error).message,
            };
        }
    };

    const logout = () => {
        setToken(null);
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                login,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
