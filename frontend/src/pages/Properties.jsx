import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import Card from '../components/Card';
import PaginationControls from '../components/PaginationControls';
import PropertyTransactionDrawer from '../components/PropertyTransactionDrawer';
import {
    createProperty,
    createTransaction,
    listCustomers,
    listFloorPlans,
    listProjects,
    listProperties,
    listPropertyAttributeDefinitions,
    listTransactionsByProperty,
    updateProperty,
} from '../api/resources';
import { formatCustomerName, formatDateLabel } from '../lib/formatters';

const emptyTransactionForm = { transaction_date: '', transaction_type: 'Sale', price: '', notes: '' };
const DEFAULT_PAGE_SIZE = 25;

export default function Properties() {
    const [data, setData] = useState({
        properties: [],
        customers: [],
        projects: [],
        plans: [],
        attributeDefinitions: [],
        tx: {},
        meta: { total_records: 0, total_pages: 1, current_page: 1, limit: DEFAULT_PAGE_SIZE },
        isLoading: true,
        error: '',
        referencesLoaded: false,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [propertyForm, setPropertyForm] = useState(createEmptyPropertyForm([]));
    const [editingPropertyId, setEditingPropertyId] = useState(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
    const [savingProperty, setSavingProperty] = useState(false);
    const [savingTransaction, setSavingTransaction] = useState(false);
    const [loadingTransactionsForPropertyId, setLoadingTransactionsForPropertyId] = useState(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setDebouncedSearchTerm(searchTerm.trim());
        }, 250);

        return () => window.clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        loadInventory({
            page: currentPage,
            limit: pageSize,
            search: debouncedSearchTerm,
            status: statusFilter,
            refreshReferences: !data.referencesLoaded,
        });
    }, [currentPage, pageSize, debouncedSearchTerm, statusFilter]);

    async function loadInventory({
        page = currentPage,
        limit = pageSize,
        search = debouncedSearchTerm,
        status = statusFilter,
        refreshReferences = false,
    } = {}) {
        setData((current) => ({ ...current, isLoading: true, error: '' }));
        try {
            const requests = [
                listProperties({
                    skip: (page - 1) * limit,
                    limit,
                    q: search || undefined,
                    property_status: status !== 'All' ? status : undefined,
                }),
            ];

            if (refreshReferences) {
                requests.push(
                    listCustomers({ limit: 500 }),
                    listProjects({ limit: 500 }),
                    listFloorPlans({ limit: 500 }),
                    listPropertyAttributeDefinitions({ limit: 500, active_only: true }),
                );
            }

            const [propertiesRes, customersRes, projectsRes, plansRes, attributeDefinitionsRes] = await Promise.all(requests);
            setData((current) => ({
                ...current,
                properties: propertiesRes.items,
                customers: refreshReferences ? customersRes.items : current.customers,
                projects: refreshReferences ? projectsRes.items : current.projects,
                plans: refreshReferences ? plansRes.items : current.plans,
                attributeDefinitions: refreshReferences ? attributeDefinitionsRes.items : current.attributeDefinitions,
                meta: propertiesRes.meta || { total_records: propertiesRes.items.length, total_pages: 1, current_page: page, limit },
                isLoading: false,
                error: '',
                referencesLoaded: current.referencesLoaded || refreshReferences,
            }));

            if (refreshReferences) {
                setPropertyForm((current) => (editingPropertyId ? current : createEmptyPropertyForm(attributeDefinitionsRes.items)));
            }
        } catch (loadError) {
            setData((current) => ({
                ...current,
                properties: [],
                meta: { total_records: 0, total_pages: 1, current_page: page, limit },
                isLoading: false,
                error: loadError.message,
            }));
        }
    }

    async function openTransactionEditor(propertyId) {
        setSelectedPropertyId(propertyId);
        setTransactionForm(emptyTransactionForm);
        if (Object.prototype.hasOwnProperty.call(data.tx, propertyId)) {
            return;
        }

        setLoadingTransactionsForPropertyId(propertyId);
        try {
            const transactions = await listTransactionsByProperty(propertyId);
            setData((current) => ({
                ...current,
                tx: { ...current.tx, [propertyId]: transactions.items },
                error: '',
            }));
        } catch (loadError) {
            setData((current) => ({ ...current, error: loadError.message }));
        } finally {
            setLoadingTransactionsForPropertyId(null);
        }
    }

    function closeTransactionEditor() {
        setSelectedPropertyId(null);
        setTransactionForm(emptyTransactionForm);
    }

    async function handleSaveProperty(event) {
        event.preventDefault();
        setSavingProperty(true);
        const payload = {
            villa_number: propertyForm.villa_number,
            owner_customer_id: propertyForm.owner_customer_id ? Number(propertyForm.owner_customer_id) : null,
            project_id: propertyForm.project_id ? Number(propertyForm.project_id) : null,
            community_id: propertyForm.community_id ? Number(propertyForm.community_id) : null,
            plan_id: propertyForm.plan_id ? Number(propertyForm.plan_id) : null,
            property_status: propertyForm.property_status,
            custom_attributes: serializePropertyAttributes(data.attributeDefinitions, propertyForm.custom_attributes),
        };
        try {
            if (editingPropertyId) {
                await updateProperty(editingPropertyId, payload);
                await loadInventory({ page: currentPage, limit: pageSize, search: debouncedSearchTerm, status: statusFilter });
            } else {
                await createProperty(payload);
                setSearchTerm('');
                setDebouncedSearchTerm('');
                setStatusFilter('All');
                setCurrentPage(1);
                await loadInventory({ page: 1, limit: pageSize, search: '', status: 'All' });
            }
            setPropertyForm(createEmptyPropertyForm(data.attributeDefinitions));
            setShowPropertyForm(false);
            setEditingPropertyId(null);
        } catch (saveError) {
            setData((current) => ({ ...current, error: saveError.message }));
        } finally {
            setSavingProperty(false);
        }
    }

    function startEditingProperty(property) {
        setEditingPropertyId(property.property_id);
        setPropertyForm({
            villa_number: property.villa_number || '',
            owner_customer_id: property.owner_customer_id ? String(property.owner_customer_id) : '',
            project_id: property.project_id ? String(property.project_id) : '',
            community_id: property.community_id ? String(property.community_id) : '',
            plan_id: property.plan_id ? String(property.plan_id) : '',
            property_status: property.property_status || 'Off-Market',
            custom_attributes: buildPropertyAttributeState(data.attributeDefinitions, property),
        });
        setShowPropertyForm(true);
    }

    function openCreatePropertyForm() {
        setEditingPropertyId(null);
        setPropertyForm(createEmptyPropertyForm(data.attributeDefinitions));
        setShowPropertyForm(true);
    }

    function closePropertyForm() {
        setEditingPropertyId(null);
        setPropertyForm(createEmptyPropertyForm(data.attributeDefinitions));
        setShowPropertyForm(false);
    }

    async function handleStatusChange(propertyId, propertyStatus) {
        try {
            await updateProperty(propertyId, { property_status });
            await loadInventory({ page: currentPage, limit: pageSize, search: debouncedSearchTerm, status: statusFilter });
        } catch (updateError) {
            setData((current) => ({ ...current, error: updateError.message }));
        }
    }

    async function handleCreateTransaction(event) {
        event.preventDefault();
        if (!selectedPropertyId) return;
        setSavingTransaction(true);
        const payload = {
            property_id: selectedPropertyId,
            transaction_date: transactionForm.transaction_date || null,
            transaction_type: transactionForm.transaction_type,
            price: transactionForm.price ? Number(transactionForm.price) : null,
            notes: transactionForm.notes || null,
        };
        try {
            const transaction = await createTransaction(payload);
            setData((current) => ({
                ...current,
                tx: { ...current.tx, [selectedPropertyId]: [transaction, ...(current.tx[selectedPropertyId] || [])] },
                error: '',
            }));
            closeTransactionEditor();
        } catch (saveError) {
            setData((current) => ({ ...current, error: saveError.message }));
        } finally {
            setSavingTransaction(false);
        }
    }

    const selectableCommunities = getProjectCommunities(data.projects, propertyForm.project_id);
    const selectablePlans = data.plans.filter((plan) => {
        if (propertyForm.project_id && plan.project_id !== Number(propertyForm.project_id)) {
            return false;
        }
        if (propertyForm.community_id) {
            return plan.community_id === null || plan.community_id === Number(propertyForm.community_id);
        }
        return true;
    });
    const selectedPropertyRecord = data.properties.find((property) => property.property_id === selectedPropertyId);
    const selectedPropertyProject = data.projects.find((item) => item.project_id === selectedPropertyRecord?.project_id);
    const selectedPropertyCommunity = getProjectCommunities(data.projects, selectedPropertyRecord?.project_id).find((item) => item.community_id === selectedPropertyRecord?.community_id);
    const selectedPropertyCustomer = data.customers.find((item) => item.customer_id === selectedPropertyRecord?.owner_customer_id);
    const selectedProperty = selectedPropertyRecord
        ? {
            ...selectedPropertyRecord,
            project_name: selectedPropertyProject?.project_name || '',
            community_name: selectedPropertyCommunity?.community_name || '',
            owner_name: selectedPropertyCustomer ? formatCustomerName(selectedPropertyCustomer) : '',
            attribute_tags: getPropertyAttributeTags(selectedPropertyRecord, data.attributeDefinitions),
        }
        : null;
    const selectedPropertyTransactions = selectedPropertyId ? (data.tx[selectedPropertyId] || []) : [];
    const isLoadingSelectedPropertyTransactions = selectedPropertyId === loadingTransactionsForPropertyId;
    const activeListingsOnPage = data.properties.filter((property) => property.property_status === 'Active Listing').length;
    const rentedUnitsOnPage = data.properties.filter((property) => property.property_status === 'Rented').length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Property Inventory</h1>
                    <p className="mt-1 text-gray-500">Manage unit status, ownership links, and historical transactions.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={() => loadInventory({ page: currentPage, limit: pageSize, search: debouncedSearchTerm, status: statusFilter, refreshReferences: true })} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { if (showPropertyForm) { closePropertyForm(); } else { openCreatePropertyForm(); } }} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"><Plus className="h-4 w-4" />{showPropertyForm ? 'Close form' : 'Add unit'}</button>
                </div>
            </div>

            {data.error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Unable to fully load or update inventory. {data.error}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label="Inventory" value={data.meta.total_records} caption="Total properties matching current filters." />
                <StatCard label="Active Listings" value={activeListingsOnPage} caption="Visible active listings on this page." />
                <StatCard label="Rented Units" value={rentedUnitsOnPage} caption="Visible rented units on this page." />
            </div>

            {showPropertyForm && (
                <Card title={editingPropertyId ? 'Edit property' : 'Create property'} subtitle={editingPropertyId ? 'Correct the unit record, links, status, and configurable flags from the same form.' : 'Add a unit and link it to an owner, project, and floor plan.'}>
                    <form className="space-y-4" onSubmit={handleSaveProperty}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input type="text" required placeholder="Villa or unit number" value={propertyForm.villa_number} onChange={(event) => setPropertyForm((current) => ({ ...current, villa_number: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            <select value={propertyForm.owner_customer_id} onChange={(event) => setPropertyForm((current) => ({ ...current, owner_customer_id: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select owner</option>{data.customers.map((customer) => <option key={customer.customer_id} value={customer.customer_id}>{formatCustomerName(customer)}</option>)}</select>
                            <select value={propertyForm.project_id} onChange={(event) => setPropertyForm((current) => ({ ...current, project_id: event.target.value, community_id: '', plan_id: '' }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select project</option>{data.projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>
                            <select value={propertyForm.community_id} onChange={(event) => setPropertyForm((current) => ({ ...current, community_id: event.target.value, plan_id: '' }))} disabled={!propertyForm.project_id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none disabled:opacity-50"><option value="">All communities in project</option>{selectableCommunities.map((community) => <option key={community.community_id} value={community.community_id}>{community.community_name}</option>)}</select>
                            <select value={propertyForm.plan_id} onChange={(event) => setPropertyForm((current) => ({ ...current, plan_id: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select floor plan</option>{selectablePlans.map((plan) => <option key={plan.plan_id} value={plan.plan_id}>{plan.plan_name}</option>)}</select>
                            <select value={propertyForm.property_status} onChange={(event) => setPropertyForm((current) => ({ ...current, property_status: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option>Off-Market</option><option>Primary Residence</option><option>Active Listing</option><option>Rented</option></select>
                        </div>

                        <PropertyAttributeFields
                            definitions={data.attributeDefinitions}
                            values={propertyForm.custom_attributes}
                            onChange={(key, value) => setPropertyForm((current) => ({
                                ...current,
                                custom_attributes: { ...current.custom_attributes, [key]: value },
                            }))}
                        />

                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={savingProperty} className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{savingProperty ? 'Saving property...' : editingPropertyId ? 'Save property' : 'Create property'}</button>
                            {editingPropertyId && <button type="button" onClick={closePropertyForm} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600"><X className="h-4 w-4" />Cancel</button>}
                        </div>
                    </form>
                </Card>
            )}

            <Card title="Inventory table" subtitle="Search and pagination query the backend directly, so matches can come from outside the current page." actions={<div className="flex gap-3"><div className="relative w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} placeholder="Search units, owners, projects, or attributes..." className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none" /></div><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }} className="rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none"><option>All</option><option>Off-Market</option><option>Primary Residence</option><option>Active Listing</option><option>Rented</option></select></div>}>
                {data.isLoading ? <div className="py-16 text-center text-sm font-medium text-gray-500">Loading properties...</div> : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Unit</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Owner</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Project</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Attributes</th><th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {data.properties.map((property) => {
                                        const customer = data.customers.find((item) => item.customer_id === property.owner_customer_id);
                                        const project = data.projects.find((item) => item.project_id === property.project_id);
                                        const community = getProjectCommunities(data.projects, property.project_id).find((item) => item.community_id === property.community_id);
                                        const attributeTags = getPropertyAttributeTags(property, data.attributeDefinitions);
                                        return <tr key={property.property_id} className="hover:bg-brand-50/20"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-2 text-brand-600"><Building2 className="h-5 w-5" /></div><div><p className="font-bold text-gray-900">{property.villa_number}</p><p className="text-xs font-medium text-gray-400">Added {formatDateLabel(property.created_at)}</p></div></div></td><td className="px-6 py-4"><Link to={customer ? `/customers/${customer.customer_id}` : '#'} className="text-sm font-bold text-gray-900 hover:text-brand-600">{customer ? formatCustomerName(customer) : 'Unassigned owner'}</Link></td><td className="px-6 py-4 text-sm font-semibold text-gray-600">{project?.project_name || 'Unassigned project'}<p className="mt-1 text-xs font-medium text-gray-400">{community?.community_name || 'All communities'}</p></td><td className="px-6 py-4"><select value={property.property_status} onChange={(event) => handleStatusChange(property.property_id, event.target.value)} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold outline-none"><option>Off-Market</option><option>Primary Residence</option><option>Active Listing</option><option>Rented</option></select></td><td className="px-6 py-4 text-sm text-gray-500">{attributeTags.join(', ') || 'No special attributes'}</td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-4"><button type="button" onClick={() => startEditingProperty(property)} className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-700"><Pencil className="h-4 w-4" />Edit</button><button type="button" onClick={() => openTransactionEditor(property.property_id)} className="text-sm font-bold text-brand-600 hover:text-brand-800">{selectedPropertyId === property.property_id && isLoadingSelectedPropertyTransactions ? 'Loading transactions...' : 'Manage transactions'}</button></div></td></tr>;
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {data.properties.length === 0 && (
                            <div className="bg-gray-50/30 py-20 text-center">
                                <Building2 className="mx-auto h-12 w-12 text-gray-300" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">No properties found</h3>
                                <p className="mt-2 text-gray-500">Try adjusting your search or status filter.</p>
                            </div>
                        )}

                        <PaginationControls
                            currentPage={data.meta.current_page}
                            totalPages={data.meta.total_pages}
                            totalRecords={data.meta.total_records}
                            limit={data.meta.limit}
                            onPageChange={setCurrentPage}
                            onLimitChange={(nextLimit) => {
                                setPageSize(nextLimit);
                                setCurrentPage(1);
                            }}
                        />
                    </>
                )}
            </Card>

            <PropertyTransactionDrawer
                isOpen={Boolean(selectedProperty)}
                onClose={closeTransactionEditor}
                property={selectedProperty}
                transactions={selectedPropertyTransactions}
                isLoading={isLoadingSelectedPropertyTransactions}
                isSaving={savingTransaction}
                form={transactionForm}
                onFormChange={(field, value) => setTransactionForm((current) => ({ ...current, [field]: value }))}
                onSubmit={handleCreateTransaction}
            />
        </div>
    );
}

function PropertyAttributeFields({ definitions, values, onChange }) {
    if (definitions.length === 0) {
        return <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500">No configurable property attributes are active yet.</div>;
    }

    const booleanDefinitions = definitions.filter((definition) => definition.value_type === 'boolean');
    const valueDefinitions = definitions.filter((definition) => definition.value_type !== 'boolean');

    return (
        <div className="space-y-4">
            {booleanDefinitions.length > 0 && (
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-gray-700 md:grid-cols-3 xl:grid-cols-4">
                    {booleanDefinitions.map((definition) => (
                        <label key={definition.attribute_definition_id} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3">
                            <input type="checkbox" checked={Boolean(values[definition.key])} onChange={(event) => onChange(definition.key, event.target.checked)} />
                            <span>{definition.label}</span>
                        </label>
                    ))}
                </div>
            )}

            {valueDefinitions.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {valueDefinitions.map((definition) => (
                        <div key={definition.attribute_definition_id} className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{definition.label}</label>
                            {definition.value_type === 'select' ? (
                                <select value={values[definition.key] ?? ''} onChange={(event) => onChange(definition.key, event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none">
                                    <option value="">Select {definition.label}</option>
                                    {(definition.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                            ) : definition.value_type === 'number' ? (
                                <input type="number" value={values[definition.key] ?? ''} onChange={(event) => onChange(definition.key, event.target.value)} placeholder={definition.label} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            ) : (
                                <input type="text" value={values[definition.key] ?? ''} onChange={(event) => onChange(definition.key, event.target.value)} placeholder={definition.label} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function createEmptyPropertyForm(definitions) {
    return {
        villa_number: '',
        owner_customer_id: '',
        project_id: '',
        community_id: '',
        plan_id: '',
        property_status: 'Off-Market',
        custom_attributes: buildPropertyAttributeState(definitions),
    };
}

function buildPropertyAttributeState(definitions, property = null) {
    return definitions.reduce((state, definition) => {
        const value = getDefinitionValue(definition, property);
        if (definition.value_type === 'boolean') {
            state[definition.key] = Boolean(value);
        } else if (definition.value_type === 'number') {
            state[definition.key] = value === null || value === undefined ? '' : String(value);
        } else {
            state[definition.key] = value ?? '';
        }
        return state;
    }, {});
}

function getDefinitionValue(definition, property) {
    const customAttributes = property?.custom_attributes || {};
    if (Object.prototype.hasOwnProperty.call(customAttributes, definition.key)) {
        return customAttributes[definition.key];
    }
    if (Object.prototype.hasOwnProperty.call(property || {}, definition.key)) {
        return property[definition.key];
    }
    return null;
}

function serializePropertyAttributes(definitions, values = {}) {
    return definitions.reduce((payload, definition) => {
        const rawValue = values[definition.key];
        if (definition.value_type === 'boolean') {
            payload[definition.key] = Boolean(rawValue);
            return payload;
        }
        if (definition.value_type === 'number') {
            payload[definition.key] = rawValue === '' || rawValue === null || rawValue === undefined ? null : Number(rawValue);
            return payload;
        }
        const normalized = String(rawValue ?? '').trim();
        payload[definition.key] = normalized || null;
        return payload;
    }, {});
}

function getPropertyAttributeTags(property, definitions) {
    const tags = [];
    definitions.forEach((definition) => {
        const value = getDefinitionValue(definition, property);
        if (definition.value_type === 'boolean') {
            if (value) {
                tags.push(definition.label);
            }
            return;
        }
        if (value !== null && value !== undefined && value !== '') {
            tags.push(`${definition.label}: ${value}`);
        }
    });
    return tags;
}

function StatCard({ label, value, caption }) {
    return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><p className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">{label}</p><p className="mt-4 text-3xl font-black text-gray-900">{value}</p><p className="mt-1 text-sm font-medium text-gray-500">{caption}</p></div>;
}

function getProjectCommunities(projects, projectId) {
    const normalizedProjectId = Number(projectId);
    if (!normalizedProjectId) {
        return [];
    }

    return projects.find((project) => project.project_id === normalizedProjectId)?.communities || [];
}
