import { useState } from 'react';
import { UserCheck, ShieldAlert, Plus, Search, ExternalLink, Briefcase, TrendingUp } from 'lucide-react';
import Card from '../components/Card';

const mockAgents = [
    { id: 1, name: "Alice Buyer", type: "Buyer", activeLeads: 42, performance: "+12%" },
    { id: 2, name: "Charlie Seller", type: "Seller", activeLeads: 28, performance: "+5%" },
    { id: 3, name: "Sarah Specialist", type: "Both", activeLeads: 55, performance: "+18%" },
];

export default function Agents() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-brand-900 uppercase">Sales Force & Protection</h1>
                    <p className="text-gray-500 font-medium mt-1 uppercase text-[10px] tracking-widest">Manage lead protection assignments and specialist roles.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl hover:bg-gray-800 transition-all active:scale-95">
                    <Plus className="w-4 h-4" /> Onboard New Agent
                </button>
            </div>

            {/* Specialty Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Buyer Specialists</p>
                    <p className="text-3xl font-black text-blue-900">12 Agents</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Seller Specialists</p>
                    <p className="text-3xl font-black text-purple-900">08 Agents</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Lead Protection Active</p>
                    <p className="text-3xl font-black text-emerald-900">184 Clients</p>
                </div>
            </div>

            {/* Main Agent Table */}
            <Card
                title="Active Agent Directory"
                subtitle="Review specialist types and current lead distribution."
                actions={
                    <div className="relative w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-brand-500" />
                        <input
                            type="text"
                            placeholder="Search agents..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500/10 transition-all"
                        />
                    </div>
                }
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Agent Identity</th>
                                <th className="px-6 py-4">Role [Specialty]</th>
                                <th className="px-6 py-4 text-center">Protected Leads</th>
                                <th className="px-6 py-4 text-center">Performance</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockAgents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-brand-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-700 font-black">
                                                {agent.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{agent.name}</p>
                                                <p className="text-[10px] text-gray-400">Joined Mar 2024</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ring-1 
                      ${agent.type === 'Buyer' ? 'bg-blue-50 text-blue-700 ring-blue-100' :
                                                agent.type === 'Seller' ? 'bg-purple-50 text-purple-700 ring-purple-100' :
                                                    'bg-emerald-50 text-emerald-700 ring-emerald-100'}`}
                                        >
                                            {agent.type} Agent
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-gray-300" />
                                            <span className="text-sm font-bold text-gray-700">{agent.activeLeads}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-emerald-600 font-bold text-xs">
                                            <TrendingUp className="w-3 h-3" /> {agent.performance}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-brand-600 font-bold text-xs hover:underline flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform">
                                            Audit Assignments <ExternalLink className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Lead Protection Warning Zone */}
            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
                <ShieldAlert className="w-6 h-6 text-amber-500 mt-0.5" />
                <div>
                    <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Lead Protection Integrity Check</h4>
                    <p className="text-xs text-amber-800 font-medium mt-1 leading-relaxed">
                        The system currently prevents assigning a Buyer Agent to a Seller-only lead profile.
                        Analysts must manually override specialty constraints if an agent has switched roles.
                    </p>
                </div>
            </div>
        </div>
    );
}