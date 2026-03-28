import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, LayoutDashboard, LogOut, Menu, Settings, ShieldCheck, Users, X } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const { logout } = useAuth();

    const navigation = [
        { name: 'Dashboard', to: '/', icon: LayoutDashboard },
        { name: 'Customers', to: '/customers', icon: Users },
        { name: 'Properties', to: '/properties', icon: BriefcaseBusiness },
        { name: 'Agents', to: '/agents', icon: ShieldCheck },
        { name: 'Settings', to: '/settings', icon: Settings },
    ];

    const currentSection =
        navigation.find((item) =>
            item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to),
        ) || navigation[0];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-30 flex w-64 transform flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-16 items-center border-b border-gray-200 px-6">
                    <span className="text-xl font-bold tracking-tight text-brand-900">SecondaryCRM</span>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
              `}
                        >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {item.name}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-gray-200 p-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-gray-50">
                <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-10">
                        <div className="flex items-center gap-4">
                            <button
                                type="button"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-gray-600 lg:hidden"
                                onClick={() => setSidebarOpen((current) => !current)}
                            >
                                {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-600">Analyst workspace</p>
                                <h1 className="text-lg font-bold text-gray-900">{currentSection.name}</h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden rounded-full bg-gray-900 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-white sm:inline-flex">
                                Secured access
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    <div className="mx-auto max-w-[1600px] space-y-8">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
