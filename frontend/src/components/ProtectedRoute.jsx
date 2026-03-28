// frontend/src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
    const { isAuthenticated } = useAuth();

    // If there is no token, redirect them to the login screen
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Otherwise, render the child routes
    return <Outlet />;
}