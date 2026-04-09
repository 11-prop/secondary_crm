import { useEffect, useState } from 'react';
import { ArrowRight, MessageSquare, Pencil, Plus, RefreshCw, Search, Users } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

import { createCustomer, listAgents, listCustomers, updateCustomer } from '../api/resources';
import AddCustomerDrawer from '../components/AddCustomerDrawer';
import Card from '../components/Card';
import CustomerInteractionDrawer from '../components/CustomerInteractionDrawer';
import PaginationControls from '../components/PaginationControls';
import { formatCustomerInitials, formatCustomerName, getClientTypeClasses } from '../lib/formatters';

const DEFAULT_PAGE_SIZE = 25;

export default function Customers() {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialSearchTerm = searchParams.get('q') ?? '';
    const initialProtectedOnly = searchParams.get('protected') === 'true';
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialSearchTerm.trim());
    const [customers, setCustomers] = useState([]);
    const [agents, setAgents] = useState([]);
    const [meta, setMeta] = useState({ total_records: 0, total_pages: 1, current_page: 1, limit: DEFAULT_PAGE_SIZE });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [interactionCustomer, setInteractionCustomer] = useState(null);
    const [error, setError] = useState('');
    const [protectedOnly, setProtectedOnly] = useState(initialProtectedOnly);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        loadAgents();
    }, []);

    useEffect(() => {
        const nextSearchTerm = searchParams.get('q') ?? '';
        const nextProtectedOnly = searchParams.get('protected') === 'true';

        setSearchTerm((current) => (current === nextSearchTerm ? current : nextSearchTerm));
        setDebouncedSearchTerm((current) => (current === nextSearchTerm.trim() ? current : nextSearchTerm.trim()));
        setProtectedOnly((current) => (current === nextProtectedOnly ? current : nextProtectedOnly));
        setCurrentPage(1);
    }, [searchParams]);

    useEffect(() => {
        const nextParams = new URLSearchParams();
        if (debouncedSearchTerm) {
            nextParams.set('q', debouncedSearchTerm);
        }
        if (protectedOnly) {
            nextParams.set('protected', 'true');
        }
        if (nextParams.toString() !== searchParams.toString()) {
            setSearchParams(nextParams, { replace: true });
        }
    }, [debouncedSearchTerm, protectedOnly, searchParams, setSearchParams]);

    useEffect(() => {
        loadCustomers({ page: currentPage, limit: pageSize, search: debouncedSearchTerm });
    }, [currentPage, pageSize, debouncedSearchTerm, protectedOnly]);

    async function loadAgents() {
        try {
            const agentsResponse = await listAgents({ limit: 500 });
            setAgents(agentsResponse.items);
        } catch (agentError) {
            setAgents([]);
            setError(agentError.message);
        }
    }

    async function loadCustomers({ page = currentPage, limit = pageSize, search = debouncedSearchTerm } = {}) {
        setIsLoading(true);

        try {
            const customersResponse = await listCustomers({
                skip: (page - 1) * limit,
                limit,
                q: search || undefined,
                protected_only: protectedOnly || undefined,
            });
            setCustomers(customersResponse.items);
            setMeta(customersResponse.meta || { total_records: customersResponse.items.length, total_pages: 1, current_page: page, limit });
            setError('');
        } catch (loadError) {
            setCustomers([]);
            setMeta({ total_records: 0, total_pages: 1, current_page: page, limit });
            setError(loadError.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateCustomer(payload) {
        setIsCreating(true);

        try {
            await createCustomer(payload);
            setSearchTerm('');
            setDebouncedSearchTerm('');
            setCurrentPage(1);
            await loadCustomers({ page: 1, limit: pageSize, search: '' });
            setError('');
            return { success: true };
        } catch (createError) {
            return { success: false, error: createError.message };
        } finally {
            setIsCreating(false);
        }
    }

    async function handleSaveCustomer(payload) {
        if (!editingCustomer) {
            return handleCreateCustomer(payload);
        }

        setIsCreating(true);
        try {
            await updateCustomer(editingCustomer.customer_id, payload);
            await loadCustomers({ page: currentPage, limit: pageSize, search: debouncedSearchTerm });
            setError('');
            return { success: true };
        } catch (saveError) {
            return { success: false, error: saveError.message };
        } finally {
            setIsCreating(false);
        }
    }

    function handleNoteAdded(customerId) {
        setCustomers((current) => current.map((customer) => (
            customer.customer_id === customerId
                ? { ...customer, interaction_note_count: (customer.interaction_note_count || 0) + 1 }
                : customer
        )));
    }

    const protectedLeadCount = customers.filter((customer) => customer.assigned_buyer_agent_id || customer.assigned_seller_agent_id).length;

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Customer Directory</h1>
                    <p className="mt-2 text-lg text-gray-500">Manage lead protection and client profiles.</p>
                </div>
                <button
                    onClick={() => { setEditingCustomer(null); setDrawerOpen(true); }}
                    className="flex items-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-md transition-all active:scale-95 hover:bg-brand-700"
                >
                    <Plus className="h-5 w-5" />
                    Add Customer
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <SummaryCard
                    label="Directory size"
                    value={meta.total_records}
                    caption="Total customer records matching the current search."
                />
                <SummaryCard
                    label="Visible protected leads"
                    value={protectedLeadCount}
                    caption="Assigned customers on the current page."
                />
                <SummaryCard
                    label="Connection"
                    value={error ? 'API issue' : 'Live API'}
                    caption={error || 'Search and pagination now query the backend directly.'}
                />
            </div>

            {error && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                    Unable to load customers. {error}
                </div>
            )}

            <Card
                title="Active Clients"
                subtitle="Search reaches across the full dataset, not just the customers shown on this page."
                actions={(
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setProtectedOnly((current) => !current);
                                setCurrentPage(1);
                            }}
                            className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-bold transition-colors ${
                                protectedOnly
                                    ? 'border-brand-200 bg-brand-50 text-brand-700'
                                    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            Protected only
                        </button>
                        <button
                            type="button"
                            onClick={() => { loadAgents(); loadCustomers({ page: currentPage, limit: pageSize, search: debouncedSearchTerm }); }}
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
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>
                )}
            >
                {isLoading ? (
                    <div className="py-16 text-center text-sm font-medium text-gray-500">Loading customers...</div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
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
                                    {customers.map((customer) => {
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
                                                    <div className="flex items-center justify-end gap-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => setInteractionCustomer(customer)}
                                                            className="inline-flex items-center gap-1 text-gray-500 transition-colors hover:text-brand-700"
                                                        >
                                                            <MessageSquare className="h-4 w-4" />
                                                            Add interaction
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEditingCustomer(customer); setDrawerOpen(true); }}
                                                            className="inline-flex items-center gap-1 text-gray-500 transition-colors hover:text-brand-700"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            Edit
                                                        </button>
                                                        <Link
                                                            to={`/customers/${customer.customer_id}`}
                                                            className="flex items-center justify-end gap-1 text-brand-600 transition-transform group-hover:translate-x-1 hover:text-brand-900"
                                                        >
                                                            View 360 <ArrowRight className="h-4 w-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {customers.length === 0 && (
                            <div className="bg-gray-50/30 py-20 text-center">
                                <Users className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No customers found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your search query.</p>
                            </div>
                        )}

                        <PaginationControls
                            currentPage={meta.current_page}
                            totalPages={meta.total_pages}
                            totalRecords={meta.total_records}
                            limit={meta.limit}
                            onPageChange={setCurrentPage}
                            onLimitChange={(nextLimit) => {
                                setPageSize(nextLimit);
                                setCurrentPage(1);
                            }}
                        />
                    </>
                )}
            </Card>

            <AddCustomerDrawer
                isOpen={isDrawerOpen}
                onClose={() => { setDrawerOpen(false); setEditingCustomer(null); }}
                agents={agents}
                onSubmit={handleSaveCustomer}
                isSubmitting={isCreating}
                initialData={editingCustomer}
                title={editingCustomer ? 'Edit Customer Profile' : 'New Customer Profile'}
                submitLabel={editingCustomer ? 'Save Customer Changes' : 'Create Customer Profile'}
            />

            <CustomerInteractionDrawer
                isOpen={!!interactionCustomer}
                onClose={() => setInteractionCustomer(null)}
                customer={interactionCustomer}
                agents={agents}
                onNoteAdded={handleNoteAdded}
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
