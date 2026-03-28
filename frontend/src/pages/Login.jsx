import { useState } from 'react';
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsLoading(true);

        const result = await login(email, password);

        if (!result.success) {
            setError(result.error);
        }
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_35%),linear-gradient(180deg,#f8fafc_0%,#eef6ff_100%)] px-4 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-xl shadow-brand-500/20">
                    <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-gray-900">
                    Secondary Offplan Properties CRM Access
                </h2>
                <p className="mt-2 text-center text-sm font-medium text-gray-500">
                    Restricted to authorized data analysts
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="border border-gray-100 bg-white px-4 py-8 shadow sm:rounded-2xl sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 text-red-800">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">Email address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-bold text-gray-700">Password</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-500/20"
                                    placeholder="********"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center rounded-xl border border-transparent bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-70"
                        >
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
