import { useEffect, useState } from 'react';
import { Building2, Pencil, Plus, RefreshCw, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

import Card from '../components/Card';
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
import { formatCurrency, formatCustomerName, formatDateLabel, getPropertyStatusClasses } from '../lib/formatters';

const emptyTransactionForm = { transaction_date: '', transaction_type: 'Sale', price: '', notes: '' };

export default function Properties() {
    const [data, setData] = useState({ properties: [], customers: [], projects: [], plans: [], attributeDefinitions: [], tx: {}, isLoading: true, error: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [propertyForm, setPropertyForm] = useState(createEmptyPropertyForm([]));
    const [editingPropertyId, setEditingPropertyId] = useState(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const [transactionForm, setTransactionForm] = useState(emptyTransactionForm);
    const [savingProperty, setSavingProperty] = useState(false);
    const [savingTransaction, setSavingTransaction] = useState(false);

    useEffect(() => {
        loadInventory();
    }, []);

    async function loadInventory() {
        try {
            const [propertiesRes, customersRes, projectsRes, plansRes, attributeDefinitionsRes] = await Promise.all([
                listProperties(),
                listCustomers(),
                listProjects({ limit: 500 }),
                listFloorPlans({ limit: 500 }),
                listPropertyAttributeDefinitions({ limit: 500, active_only: true }),
            ]);
            const txEntries = await Promise.all(propertiesRes.items.map(async (property) => [property.property_id, (await listTransactionsByProperty(property.property_id)).items]));
            setData({
                properties: propertiesRes.items,
                customers: customersRes.items,
                projects: projectsRes.items,
                plans: plansRes.items,
                attributeDefinitions: attributeDefinitionsRes.items,
                tx: Object.fromEntries(txEntries),
                isLoading: false,
                error: '',
            });
            setPropertyForm((current) => editingPropertyId ? current : createEmptyPropertyForm(attributeDefinitionsRes.items));
        } catch (error) {
            setData({
                properties: [],
                customers: [],
                projects: [],
                plans: [],
                attributeDefinitions: [],
                tx: {},
                isLoading: false,
                error: error.message,
            });
        }
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
                const property = await updateProperty(editingPropertyId, payload);
                setData((current) => ({ ...current, properties: current.properties.map((item) => (item.property_id === property.property_id ? property : item)), error: '' }));
            } else {
                const property = await createProperty(payload);
                setData((current) => ({ ...current, properties: [property, ...current.properties], tx: { ...current.tx, [property.property_id]: [] }, error: '' }));
            }
            setPropertyForm(createEmptyPropertyForm(data.attributeDefinitions));
            setShowPropertyForm(false);
            setEditingPropertyId(null);
        } catch (error) {
            setData((current) => ({ ...current, error: error.message }));
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
            const updated = await updateProperty(propertyId, { property_status });
            setData((current) => ({ ...current, properties: current.properties.map((property) => property.property_id === propertyId ? updated : property), error: '' }));
        } catch (error) {
            setData((current) => ({ ...current, error: error.message }));
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
            setData((current) => ({ ...current, tx: { ...current.tx, [selectedPropertyId]: [transaction, ...(current.tx[selectedPropertyId] || [])] }, error: '' }));
            setTransactionForm(emptyTransactionForm);
            setSelectedPropertyId(null);
        } catch (error) {
            setData((current) => ({ ...current, error: error.message }));
        } finally {
            setSavingTransaction(false);
        }
    }

    const filtered = data.properties.filter((property) => {
        const customer = data.customers.find((item) => item.customer_id === property.owner_customer_id);
        const project = data.projects.find((item) => item.project_id === property.project_id);
        const community = getProjectCommunities(data.projects, property.project_id).find((item) => item.community_id === property.community_id);
        const target = `${property.villa_number} ${formatCustomerName(customer)} ${project?.project_name || ''} ${community?.community_name || ''} ${getPropertyAttributeSearchText(property, data.attributeDefinitions)}`.toLowerCase();
        const matchesSearch = target.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || property.property_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
    const selectedProperty = data.properties.find((property) => property.property_id === selectedPropertyId);

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900">Property Inventory</h1>
                    <p className="mt-1 text-gray-500">Manage unit status, ownership links, and historical transactions.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" onClick={loadInventory} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 hover:bg-gray-50"><RefreshCw className="h-4 w-4" /></button>
                    <button type="button" onClick={() => { if (showPropertyForm) { closePropertyForm(); } else { openCreatePropertyForm(); } }} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700"><Plus className="h-4 w-4" />{showPropertyForm ? 'Close form' : 'Add unit'}</button>
                </div>
            </div>

            {data.error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Unable to fully load or update inventory. {data.error}</div>}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <StatCard label="Inventory" value={data.properties.length} />
                <StatCard label="Active Listings" value={data.properties.filter((property) => property.property_status === 'Active Listing').length} />
                <StatCard label="Rented Units" value={data.properties.filter((property) => property.property_status === 'Rented').length} />
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

            <Card title="Inventory table" subtitle="Status changes save in place; transaction history is appended from the same screen." actions={<div className="flex gap-3"><div className="relative w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input type="text" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search units, projects, or attributes..." className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm outline-none" /></div><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm outline-none"><option>All</option><option>Off-Market</option><option>Primary Residence</option><option>Active Listing</option><option>Rented</option></select></div>}>
                {data.isLoading ? <div className="py-16 text-center text-sm font-medium text-gray-500">Loading properties...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100"><tr><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Unit</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Owner</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Project</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th><th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Attributes</th><th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filtered.map((property) => {
                                    const customer = data.customers.find((item) => item.customer_id === property.owner_customer_id);
                                    const project = data.projects.find((item) => item.project_id === property.project_id);
                                    const community = getProjectCommunities(data.projects, property.project_id).find((item) => item.community_id === property.community_id);
                                    const transactions = data.tx[property.property_id] || [];
                                    const attributeTags = getPropertyAttributeTags(property, data.attributeDefinitions);
                                    return <tr key={property.property_id} className="hover:bg-brand-50/20"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-2 text-brand-600"><Building2 className="h-5 w-5" /></div><div><p className="font-bold text-gray-900">{property.villa_number}</p><p className="text-xs font-medium text-gray-400">Added {formatDateLabel(property.created_at)}</p></div></div></td><td className="px-6 py-4"><Link to={customer ? `/customers/${customer.customer_id}` : '#'} className="text-sm font-bold text-gray-900 hover:text-brand-600">{customer ? formatCustomerName(customer) : 'Unassigned owner'}</Link></td><td className="px-6 py-4 text-sm font-semibold text-gray-600">{project?.project_name || 'Unassigned project'}<p className="mt-1 text-xs font-medium text-gray-400">{community?.community_name || 'All communities'}</p></td><td className="px-6 py-4"><select value={property.property_status} onChange={(event) => handleStatusChange(property.property_id, event.target.value)} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold outline-none"><option>Off-Market</option><option>Primary Residence</option><option>Active Listing</option><option>Rented</option></select></td><td className="px-6 py-4 text-sm text-gray-500">{attributeTags.join(', ') || 'No special attributes'}</td><td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-4"><button type="button" onClick={() => startEditingProperty(property)} className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-brand-700"><Pencil className="h-4 w-4" />Edit</button><button type="button" onClick={() => setSelectedPropertyId(property.property_id)} className="text-sm font-bold text-brand-600 hover:text-brand-800">Add transaction ({transactions.length})</button></div></td></tr>;
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {selectedProperty && (
                <Card title={`Record transaction for ${selectedProperty.villa_number}`} subtitle="Append a sale or rent event to the historical ledger.">
                    <form className="space-y-4" onSubmit={handleCreateTransaction}>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <input type="date" value={transactionForm.transaction_date} onChange={(event) => setTransactionForm((current) => ({ ...current, transaction_date: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            <select value={transactionForm.transaction_type} onChange={(event) => setTransactionForm((current) => ({ ...current, transaction_type: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option>Sale</option><option>Rent</option></select>
                            <input type="number" value={transactionForm.price} onChange={(event) => setTransactionForm((current) => ({ ...current, price: event.target.value }))} placeholder="Price" className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                        </div>
                        <textarea rows={3} value={transactionForm.notes} onChange={(event) => setTransactionForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes" className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={savingTransaction} className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{savingTransaction ? 'Saving transaction...' : 'Save transaction'}</button>
                            <button type="button" onClick={() => setSelectedPropertyId(null)} className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600">Cancel</button>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Type</th><th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Date</th><th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Price</th></tr></thead>
                                <tbody className="divide-y divide-gray-100 bg-white">{(data.tx[selectedPropertyId] || []).length === 0 ? <tr><td className="px-4 py-4 text-sm font-medium text-gray-500" colSpan={3}>No transactions recorded yet.</td></tr> : (data.tx[selectedPropertyId] || []).map((transaction) => <tr key={transaction.transaction_id}><td className="px-4 py-4 font-semibold text-gray-900">{transaction.transaction_type}</td><td className="px-4 py-4 text-gray-500">{formatDateLabel(transaction.transaction_date)}</td><td className="px-4 py-4 font-bold text-gray-900">{formatCurrency(transaction.price)}</td></tr>)}</tbody>
                            </table>
                        </div>
                    </form>
                </Card>
            )}
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

function getPropertyAttributeSearchText(property, definitions) {
    return getPropertyAttributeTags(property, definitions).join(' ');
}

function StatCard({ label, value }) {
    return <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-gray-100"><p className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">{label}</p><p className="mt-4 text-3xl font-black text-gray-900">{value}</p></div>;
}

function getProjectCommunities(projects, projectId) {
    const normalizedProjectId = Number(projectId);
    if (!normalizedProjectId) {
        return [];
    }

    return projects.find((project) => project.project_id === normalizedProjectId)?.communities || [];
}
