import { useEffect, useState } from 'react';
import { ArrowRight, Plus, RefreshCw, Search, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

import { createCustomer, listAgents, listCustomers } from '../api/resources';
import AddCustomerDrawer from '../components/AddCustomerDrawer';
import Card from '../components/Card';
import { formatCustomerInitials, formatCustomerName, getClientTypeClasses } from '../lib/formatters';

export default function Customers() {
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadCustomers();
    }, []);

    async function loadCustomers() {
        setIsLoading(true);

        try {
            const [customersResponse, agentsResponse] = await Promise.all([listCustomers(), listAgents()]);
            setCustomers(customersResponse.items);
            setAgents(agentsResponse.items);
            setError('');
        } catch (error) {
            setCustomers([]);
            setAgents([]);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateCustomer(payload) {
        setIsCreating(true);

        try {
            const newCustomer = await createCustomer(payload);
            setCustomers((current) => [newCustomer, ...current]);
            setError('');
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        } finally {
            setIsCreating(false);
        }
    }

    const filteredCustomers = customers.filter((customer) => {
        const searchValue = searchTerm.toLowerCase();
        return (
            formatCustomerName(customer).toLowerCase().includes(searchValue) ||
            (customer.email || '').toLowerCase().includes(searchValue) ||
            (customer.phone_number || '').toLowerCase().includes(searchValue)
        );
    });

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Customer Directory</h1>
                    <p className="mt-2 text-lg text-gray-500">Manage lead protection and client profiles.</p>
                </div>
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all active:scale-95 hover:bg-brand-700"
                >
                    <Plus className="h-5 w-5" />
                    Add Customer
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Directory size"
                    value={customers.length}
                    caption="Profiles currently loaded in this workspace."
                />
                <SummaryCard
                    label="Protected leads"
                    value={customers.filter((customer) => customer.assigned_buyer_agent_id || customer.assigned_seller_agent_id).length}
                    caption="Customers already assigned to a specialist."
                />
                <SummaryCard
                    label="Connection"
                    value={error ? 'API issue' : 'Live API'}
                    caption={error || 'Customer search and create actions are wired to the backend.'}
                />
            </div>

            {error && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    Unable to load customers. {error}
                </div>
            )}

            <Card
                title="Active Clients"
                subtitle="All leads currently assigned to the sales team."
                actions={
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={loadCustomers}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </button>
                        <div className="relative group w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-brand-500" />
                            <input
                                type="text"
                                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
                                placeholder="Search leads..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>
                    </div>
                }
            >
                {isLoading ? (
                    <div className="py-16 text-center text-sm font-medium text-gray-500">Loading customers...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Contact Info</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-gray-400">Assignments</th>
                                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-gray-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredCustomers.map((customer) => {
                                const buyerAgent = agents.find((agent) => agent.agent_id === customer.assigned_buyer_agent_id);
                                const sellerAgent = agents.find((agent) => agent.agent_id === customer.assigned_seller_agent_id);

                                return (
                                    <tr key={customer.customer_id} className="group transition-colors hover:bg-brand-50/30">
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 ring-2 ring-white">
                                                    <span className="text-sm font-bold text-brand-600">
                                                        {formatCustomerInitials(customer)}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-semibold text-gray-900">{formatCustomerName(customer)}</div>
                                                    <div className="text-xs font-medium text-gray-400">
                                                        Added {new Date(customer.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <div className="font-medium text-gray-900">{customer.email || 'No email recorded'}</div>
                                            <div className="mt-0.5 text-gray-400">{customer.phone_number || 'No phone recorded'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide ${getClientTypeClasses(customer.client_type)}`}>
                                                {customer.client_type}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                                            <div className="font-semibold text-gray-900">{buyerAgent?.name || 'No buyer agent'}</div>
                                            <div className="mt-0.5 text-gray-400">{sellerAgent?.name || 'No seller agent'}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold">
                                            <Link
                                                to={`/customers/${customer.customer_id}`}
                                                className="flex items-center justify-end gap-1 text-brand-600 transition-transform group-hover:translate-x-1 hover:text-brand-900"
                                            >
                                                View 360 <ArrowRight className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}

                {!isLoading && filteredCustomers.length === 0 && (
                    <div className="bg-gray-50/30 py-20 text-center">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No customers found</h3>
                        <p className="mt-2 text-gray-500">Try adjusting your search query.</p>
                    </div>
                )}
            </Card>

            <AddCustomerDrawer
                isOpen={isDrawerOpen}
                onClose={() => setDrawerOpen(false)}
                agents={agents}
                onSubmit={handleCreateCustomer}
                isSubmitting={isCreating}
            />
        </div>
    );
}

function SummaryCard({ label, value, caption }) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">{label}</p>
            <p className="mt-4 text-3xl font-black text-gray-900">{value}</p>
            <p className="mt-1 text-sm font-medium text-gray-500">{caption}</p>
        </div>
    );
}
