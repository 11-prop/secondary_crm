import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, Home, Mail, MessageSquare, Phone, Plus, User } from 'lucide-react';

import Card from '../components/Card';
import {
    createNote,
    createProperty,
    getCustomer,
    listAgents,
    listFloorPlans,
    listNotesByCustomer,
    listProjects,
    listProperties,
    listTransactionsByProperty,
    resolveAssetUrl,
    updateCustomer,
} from '../api/resources';
import {
    demoAgents,
    demoCustomers,
    demoFloorPlans,
    demoInteractionNotes,
    demoProjects,
    demoProperties,
    demoTransactions,
} from '../data/demoData';
import { formatCurrency, formatCustomerName, formatDateLabel, getPropertyAttributeTags, getPropertyStatusClasses } from '../lib/formatters';

const emptyPropertyForm = { villa_number: '', project_id: '', plan_id: '', property_status: 'Off-Market', is_corner: false, is_lake_front: false, is_park_front: false, is_beach: false, is_market: false };

export default function Customer360() {
    const { id } = useParams();
    const customerId = Number(id);
    const [data, setData] = useState({ customer: null, agents: [], notes: [], properties: [], projects: [], plans: [], tx: {}, isLoading: true, isDemo: false, warning: '', error: '' });
    const [assignments, setAssignments] = useState({ buyer: '', seller: '' });
    const [noteText, setNoteText] = useState('');
    const [noteAgentId, setNoteAgentId] = useState('');
    const [propertyForm, setPropertyForm] = useState(emptyPropertyForm);
    const [showPropertyForm, setShowPropertyForm] = useState(false);
    const [savingAssignments, setSavingAssignments] = useState(false);
    const [savingNote, setSavingNote] = useState(false);
    const [savingProperty, setSavingProperty] = useState(false);

    useEffect(() => {
        if (!Number.isNaN(customerId)) loadProfile();
    }, [customerId]);

    async function loadProfile() {
        setData((current) => ({ ...current, isLoading: true, error: '' }));
        try {
            const [customer, agentsRes, notesRes, propertiesRes, projectsRes, plansRes] = await Promise.all([
                getCustomer(customerId),
                listAgents(),
                listNotesByCustomer(customerId),
                listProperties(),
                listProjects(),
                listFloorPlans(),
            ]);
            const owned = propertiesRes.items.filter((property) => property.owner_customer_id === customerId);
            const txEntries = await Promise.all(owned.map(async (property) => [property.property_id, (await listTransactionsByProperty(property.property_id)).items]));
            setData({ customer, agents: agentsRes.items, notes: notesRes.items, properties: propertiesRes.items, projects: projectsRes.items, plans: plansRes.items, tx: Object.fromEntries(txEntries), isLoading: false, isDemo: false, warning: '', error: '' });
            setAssignments({ buyer: customer.assigned_buyer_agent_id || '', seller: customer.assigned_seller_agent_id || '' });
        } catch (error) {
            const customer = demoCustomers.find((item) => item.customer_id === customerId);
            if (!customer) {
                setData({ customer: null, agents: [], notes: [], properties: [], projects: [], plans: [], tx: {}, isLoading: false, isDemo: true, warning: error.message, error: 'Customer not found.' });
                return;
            }
            const owned = demoProperties.filter((property) => property.owner_customer_id === customerId);
            setData({
                customer,
                agents: demoAgents,
                notes: demoInteractionNotes.filter((note) => note.customer_id === customerId),
                properties: demoProperties,
                projects: demoProjects,
                plans: demoFloorPlans,
                tx: Object.fromEntries(owned.map((property) => [property.property_id, demoTransactions.filter((tx) => tx.property_id === property.property_id)])),
                isLoading: false,
                isDemo: true,
                warning: error.message,
                error: '',
            });
            setAssignments({ buyer: customer.assigned_buyer_agent_id || '', seller: customer.assigned_seller_agent_id || '' });
        }
    }

    async function saveAssignments() {
        if (!data.customer) return;
        setSavingAssignments(true);
        const payload = { assigned_buyer_agent_id: assignments.buyer ? Number(assignments.buyer) : null, assigned_seller_agent_id: assignments.seller ? Number(assignments.seller) : null };
        try {
            if (data.isDemo) {
                setData((current) => ({ ...current, customer: { ...current.customer, ...payload } }));
            } else {
                const customer = await updateCustomer(customerId, payload);
                setData((current) => ({ ...current, customer }));
            }
        } finally {
            setSavingAssignments(false);
        }
    }

    async function addNote(event) {
        event.preventDefault();
        if (!noteText.trim()) return;
        setSavingNote(true);
        const payload = { customer_id: customerId, agent_id: noteAgentId ? Number(noteAgentId) : null, note_text: noteText.trim() };
        try {
            const note = data.isDemo ? { ...payload, note_id: Date.now(), created_at: new Date().toISOString() } : await createNote(payload);
            setData((current) => ({ ...current, notes: [note, ...current.notes] }));
            setNoteText('');
            setNoteAgentId('');
        } finally {
            setSavingNote(false);
        }
    }

    async function addProperty(event) {
        event.preventDefault();
        setSavingProperty(true);
        const payload = {
            villa_number: propertyForm.villa_number,
            owner_customer_id: customerId,
            project_id: propertyForm.project_id ? Number(propertyForm.project_id) : null,
            plan_id: propertyForm.plan_id ? Number(propertyForm.plan_id) : null,
            property_status: propertyForm.property_status,
            is_corner: propertyForm.is_corner,
            is_lake_front: propertyForm.is_lake_front,
            is_park_front: propertyForm.is_park_front,
            is_beach: propertyForm.is_beach,
            is_market: propertyForm.is_market,
        };
        try {
            const property = data.isDemo ? { ...payload, property_id: Date.now(), created_at: new Date().toISOString() } : await createProperty(payload);
            setData((current) => ({ ...current, properties: [property, ...current.properties], tx: { ...current.tx, [property.property_id]: [] } }));
            setPropertyForm(emptyPropertyForm);
            setShowPropertyForm(false);
        } finally {
            setSavingProperty(false);
        }
    }

    if (data.isLoading) return <div className="py-16 text-center text-sm font-medium text-gray-500">Loading customer profile...</div>;
    if (data.error || !data.customer) return <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-red-800">{data.error || 'Unable to load this customer.'}</div>;

    const buyerAgents = data.agents.filter((agent) => agent.agent_type === 'Buyer' && agent.is_active);
    const sellerAgents = data.agents.filter((agent) => agent.agent_type === 'Seller' && agent.is_active);
    const plans = data.plans.filter((plan) => !propertyForm.project_id || plan.project_id === Number(propertyForm.project_id));
    const properties = data.properties.filter((property) => property.owner_customer_id === customerId).map((property) => ({
        ...property,
        project: data.projects.find((project) => project.project_id === property.project_id),
        plan: data.plans.find((plan) => plan.plan_id === property.plan_id),
        transactions: data.tx[property.property_id] || [],
    }));

    return (
        <div className="space-y-6">
            <Link to="/customers" className="inline-flex items-center gap-2 text-sm font-bold text-brand-600"><ChevronLeft className="h-4 w-4" /> Back to customers</Link>
            {data.isDemo && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Demo mode is active for this screen. {data.warning}</div>}

            <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white"><User className="h-7 w-7" /></div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">{formatCustomerName(data.customer)}</h1>
                        <div className="mt-2 flex flex-col gap-2 text-sm font-medium text-gray-500 sm:flex-row sm:gap-6">
                            <span className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-brand-500" /> {data.customer.email || 'No email recorded'}</span>
                            <span className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-brand-500" /> {data.customer.phone_number || 'No phone recorded'}</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Stat label="Client Type" value={data.customer.client_type} />
                    <Stat label="Properties" value={properties.length} />
                    <Stat label="Notes" value={data.notes.length} />
                </div>
            </div>

            <Card title="Lead protection" subtitle="Keep one buyer and one seller specialist attached to this customer." actions={<button type="button" onClick={saveAssignments} disabled={savingAssignments} className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">{savingAssignments ? 'Saving...' : 'Save assignments'}</button>}>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <select value={assignments.buyer} onChange={(event) => setAssignments((current) => ({ ...current, buyer: event.target.value }))} className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm font-semibold text-gray-800 outline-none">
                        <option value="">Unassigned buyer agent</option>
                        {buyerAgents.map((agent) => <option key={agent.agent_id} value={agent.agent_id}>{agent.name}</option>)}
                    </select>
                    <select value={assignments.seller} onChange={(event) => setAssignments((current) => ({ ...current, seller: event.target.value }))} className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 p-3 text-sm font-semibold text-gray-800 outline-none">
                        <option value="">Unassigned seller agent</option>
                        {sellerAgents.map((agent) => <option key={agent.agent_id} value={agent.agent_id}>{agent.name}</option>)}
                    </select>
                </div>
            </Card>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-900"><Home className="h-5 w-5 text-brand-600" /> Linked Properties</h2>
                        <button type="button" onClick={() => setShowPropertyForm((current) => !current)} className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700">{showPropertyForm ? 'Close form' : 'Link property'}</button>
                    </div>

                    {showPropertyForm && (
                        <Card title="Link a property" subtitle="Attach a new unit directly from the customer profile.">
                            <form className="space-y-4" onSubmit={addProperty}>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <input type="text" required placeholder="Villa or unit number" value={propertyForm.villa_number} onChange={(event) => setPropertyForm((current) => ({ ...current, villa_number: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                    <select value={propertyForm.property_status} onChange={(event) => setPropertyForm((current) => ({ ...current, property_status: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option>Off-Market</option><option>Primary Residence</option><option>Active Listing</option><option>Rented</option></select>
                                    <select value={propertyForm.project_id} onChange={(event) => setPropertyForm((current) => ({ ...current, project_id: event.target.value, plan_id: '' }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select project</option>{data.projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>
                                    <select value={propertyForm.plan_id} onChange={(event) => setPropertyForm((current) => ({ ...current, plan_id: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select floor plan</option>{plans.map((plan) => <option key={plan.plan_id} value={plan.plan_id}>{plan.plan_name}</option>)}</select>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-gray-700 md:grid-cols-5">
                                    {[['is_corner', 'Corner'], ['is_lake_front', 'Lake-front'], ['is_park_front', 'Park-front'], ['is_beach', 'Beachfront'], ['is_market', 'Market-facing']].map(([key, label]) => (
                                        <label key={key} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3"><input type="checkbox" checked={propertyForm[key]} onChange={(event) => setPropertyForm((current) => ({ ...current, [key]: event.target.checked }))} /><span>{label}</span></label>
                                    ))}
                                </div>
                                <button type="submit" disabled={savingProperty} className="rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{savingProperty ? 'Linking property...' : 'Link property'}</button>
                            </form>
                        </Card>
                    )}

                    {properties.length === 0 && <Card><p className="text-sm font-medium text-gray-500">No properties are linked to this customer yet.</p></Card>}
                    {properties.map((property) => (
                        <Card key={property.property_id} title={`${property.villa_number} • ${property.project?.project_name || 'Unassigned project'}`} subtitle={property.plan?.plan_name || 'No floor plan linked'}>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold tracking-wide ${getPropertyStatusClasses(property.property_status)}`}>{property.property_status}</span>
                                    {getPropertyAttributeTags(property).map((tag) => <span key={tag} className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-700">{tag}</span>)}
                                </div>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <ImageBlock title="Neighborhood" image={resolveAssetUrl(property.project?.layout_plan_path)} />
                                    <ImageBlock title="Floor Plan" image={resolveAssetUrl(property.plan?.floor_plan_image_path)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 md:grid-cols-4">
                                    <Stat label="Project" value={property.project?.project_name || 'Not linked'} />
                                    <Stat label="Rooms" value={property.plan?.number_of_rooms ?? 'N/A'} />
                                    <Stat label="Sqft" value={property.plan?.square_footage ?? 'N/A'} />
                                    <Stat label="Added" value={formatDateLabel(property.created_at)} />
                                </div>
                                <div className="overflow-hidden rounded-2xl border border-gray-100">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Transaction</th><th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Date</th><th className="px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Price</th></tr></thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {property.transactions.length === 0 ? <tr><td className="px-4 py-4 text-sm font-medium text-gray-500" colSpan={3}>No historical transactions recorded yet.</td></tr> : property.transactions.map((transaction) => <tr key={transaction.transaction_id}><td className="px-4 py-4 font-semibold text-gray-900">{transaction.transaction_type || 'Transaction'}</td><td className="px-4 py-4 text-gray-500">{formatDateLabel(transaction.transaction_date)}</td><td className="px-4 py-4 font-bold text-gray-900">{formatCurrency(transaction.price)}</td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-2 text-lg font-black uppercase tracking-tight text-gray-900"><MessageSquare className="h-5 w-5 text-brand-600" /> Interaction Ledger</div>
                    <Card title="Add interaction note" subtitle="Append a time-stamped entry to the customer timeline.">
                        <form className="space-y-4" onSubmit={addNote}>
                            <select value={noteAgentId} onChange={(event) => setNoteAgentId(event.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select related agent</option>{data.agents.map((agent) => <option key={agent.agent_id} value={agent.agent_id}>{agent.name}</option>)}</select>
                            <textarea rows={4} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Capture the latest client update, call outcome, or field feedback." className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                            <button type="submit" disabled={savingNote} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><Plus className="h-4 w-4" />{savingNote ? 'Saving note...' : 'Add note'}</button>
                        </form>
                    </Card>
                    <Card title="Timeline" subtitle="Newest notes appear first.">
                        <div className="space-y-6">
                            {data.notes.length === 0 ? <p className="text-sm font-medium text-gray-500">No interaction notes recorded yet.</p> : data.notes.map((note) => {
                                const agent = data.agents.find((item) => item.agent_id === note.agent_id);
                                return <div key={note.note_id} className="relative border-l-2 border-brand-100 pl-6"><div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-brand-500 bg-white" /><div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="text-sm font-medium leading-relaxed text-gray-700">{note.note_text}</p><div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"><span>{agent?.name || 'System entry'}</span><span>•</span><span>{formatDateLabel(note.created_at, true)}</span></div></div></div>;
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value }) {
    return <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{label}</p><p className="mt-2 text-sm font-bold text-gray-900">{value}</p></div>;
}

function ImageBlock({ title, image }) {
    return (
        <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{title}</p>
            {image ? <img src={image} alt={title} className="aspect-video w-full rounded-2xl border border-gray-200 object-cover" /> : <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-400">No image uploaded</div>}
        </div>
    );
}
