import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Customers from './pages/Customers';
import Customer360 from './pages/Customer360';
import Properties from './pages/Properties';
import Settings from './pages/Settings';
import Agents from './pages/Agents';

// Placeholder components for the other routes
const Dashboard = () => <div><h1 className="text-2xl font-bold text-gray-900">Dashboard</h1><p className="text-gray-500 mt-2">KPIs and quick stats will go here.</p></div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<Customer360 />} />
          <Route path="properties" element={<Properties />} />
          <Route path="agents" element={<Agents />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}