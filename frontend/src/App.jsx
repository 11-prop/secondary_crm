import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Agents from './pages/Agents';
import Customer360 from './pages/Customer360';
import Customers from './pages/Customers';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Properties from './pages/Properties';
import Settings from './pages/Settings';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Dashboard />} />
                            <Route path="customers" element={<Customers />} />
                            <Route path="customers/:id" element={<Customer360 />} />
                            <Route path="properties" element={<Properties />} />
                            <Route path="agents" element={<Agents />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
