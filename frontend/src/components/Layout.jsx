import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Home, Settings, LogOut, Menu, X } from 'lucide-react';

export default function Layout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        { name: 'Customers', to: '/customers', icon: Users },
        { name: 'Properties', to: '/properties', icon: Home },
        { name: 'Agents', to: '/agents', icon: Users },
        { name: 'Settings', to: '/settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Navigation */}
            <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-16 flex items-center px-6 border-b border-gray-200">
                    <span className="text-xl font-bold text-brand-900 tracking-tight">SecondaryCRM</span>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.to}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                                    ? 'bg-brand-50 text-brand-600'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-gray-50 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    {/* Increased max-width to 100% or a larger scale for modern screens */}
                    <div className="max-w-[1600px] mx-auto space-y-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}