import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Pencil, Plus, Search, ShieldCheck, X } from 'lucide-react';

import Card from '../components/Card';
import { createAgent, listAgents, listCustomers, updateAgent } from '../api/resources';
import { formatCustomerName, formatDateLabel, getAgentTypeClasses } from '../lib/formatters';

export default function Agents() {
    const [agents, setAgents] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [editingAgentId, setEditingAgentId] = useState(null);
    const [form, setForm] = useState({ name: '', agent_type: 'Buyer', is_active: true });

    useEffect(() => {
        loadRoster();
    }, []);

    async function loadRoster() {
        try {
            const [agentsRes, customersRes] = await Promise.all([listAgents(), listCustomers()]);
            setAgents(agentsRes.items);
            setCustomers(customersRes.items);
            setError('');
        } catch (error) {
            setAgents([]);
            setCustomers([]);
            setError(error.message);
        }
    }

    async function handleCreateAgent(event) {
        event.preventDefault();
        setIsCreating(true);
        try {
            if (editingAgentId) {
                const agent = await updateAgent(editingAgentId, form);
                setAgents((current) => current.map((item) => (item.agent_id === agent.agent_id ? agent : item)));
            } else {
                const agent = await createAgent(form);
                setAgents((current) => [agent, ...current]);
            }
            setForm({ name: '', agent_type: 'Buyer', is_active: true });
            setEditingAgentId(null);
            setError('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCreating(false);
        }
    }

    const filteredAgents = agents.filter((agent) => agent.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const protectedLeads = customers.filter((customer) => customer.assigned_buyer_agent_id || customer.assigned_seller_agent_id).length;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">Agent Roster</h1>
                <p className="mt-1 text-gray-500">Onboard specialists and monitor how lead protection is distributed across the team.</p>
            </div>

            {error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Unable to load or update agents. {error}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label="Buyer Specialists" value={agents.filter((agent) => agent.agent_type === 'Buyer').length} />
                <StatCard label="Seller Specialists" value={agents.filter((agent) => agent.agent_type === 'Seller').length} />
                <StatCard label="Protected Leads" value={protectedLeads} />
            </div>

            <Card title={editingAgentId ? 'Edit Agent' : 'Onboard New Agent'} subtitle={editingAgentId ? 'Update the specialist record and correct incomplete onboarding details.' : 'New specialists become immediately available in customer assignment dropdowns.'}>
                <form className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto_auto]" onSubmit={handleCreateAgent}>
                    <input type="text" required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Agent name" className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                    <select value={form.agent_type} onChange={(event) => setForm((current) => ({ ...current, agent_type: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option>Buyer</option><option>Seller</option></select>
                    <select value={form.is_active ? 'true' : 'false'} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value === 'true' }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="true">Active</option><option value="false">Inactive</option></select>
                    <button type="submit" disabled={isCreating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-60"><Plus className="h-4 w-4" />{isCreating ? 'Saving...' : editingAgentId ? 'Save Agent' : 'Add Agent'}</button>
                    {editingAgentId && <button type="button" onClick={() => { setEditingAgentId(null); setForm({ name: '', agent_type: 'Buyer', is_active: true }); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600"><X className="h-4 w-4" />Cancel</button>}
                </form>
            </Card>

            <Card title="Active Agent Directory" subtitle="Review specialist types and protected lead coverage." actions={<div className="relative w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search agents..." className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none" /></div>}>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Agent</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Role</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Protected Leads</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Assigned Customers</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Created</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredAgents.map((agent) => {
                                const assignments = customers.filter((customer) => customer.assigned_buyer_agent_id === agent.agent_id || customer.assigned_seller_agent_id === agent.agent_id);
                                return (
                                    <tr key={agent.agent_id} className="hover:bg-brand-50/20">
                                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-100 p-2 text-brand-700"><ShieldCheck className="h-5 w-5" /></div><div><p className="font-bold text-gray-900">{agent.name}</p><p className="text-xs font-medium text-gray-400">{agent.is_active ? 'Active' : 'Inactive'}</p></div></div></td>
                                        <td className="px-6 py-4"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide ${getAgentTypeClasses(agent.agent_type)}`}>{agent.agent_type}</span></td>
                                        <td className="px-6 py-4"><div className="inline-flex items-center gap-2 text-sm font-bold text-gray-800"><BriefcaseBusiness className="h-4 w-4 text-gray-300" /> {assignments.length}</div></td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{assignments.slice(0, 2).map((customer) => formatCustomerName(customer)).join(', ') || 'No protected leads yet'}{assignments.length > 2 ? ` +${assignments.length - 2} more` : ''}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-gray-500">{formatDateLabel(agent.created_at)}</td>
                                        <td className="px-6 py-4 text-right"><button type="button" onClick={() => { setEditingAgentId(agent.agent_id); setForm({ name: agent.name, agent_type: agent.agent_type, is_active: agent.is_active }); }} className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800"><Pencil className="h-4 w-4" />Edit</button></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function StatCard({ label, value }) {
    return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><p className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">{label}</p><p className="mt-4 text-3xl font-black text-gray-900">{value}</p></div>;
}
