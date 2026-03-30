import { useEffect, useState } from 'react';
import { AlertCircle, Shield, UserPlus, X } from 'lucide-react';

const initialFormState = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    client_type: 'Prospect',
    assigned_buyer_agent_id: '',
    assigned_seller_agent_id: '',
};

function parseNullableId(value) {
    return value ? Number(value) : null;
}

function toFormState(customer) {
    if (!customer) {
        return initialFormState;
    }

    return {
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        email: customer.email || '',
        phone_number: customer.phone_number || '',
        client_type: customer.client_type || 'Prospect',
        assigned_buyer_agent_id: customer.assigned_buyer_agent_id ? String(customer.assigned_buyer_agent_id) : '',
        assigned_seller_agent_id: customer.assigned_seller_agent_id ? String(customer.assigned_seller_agent_id) : '',
    };
}

export default function AddCustomerDrawer({ isOpen, onClose, agents = [], onSubmit, isSubmitting, initialData = null, title = 'New Customer Profile', submitLabel = 'Create Customer Profile' }) {
    const [form, setForm] = useState(initialFormState);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setForm(toFormState(initialData));
            setSubmitError('');
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const buyerAgents = agents.filter((agent) => agent.agent_type === 'Buyer' && agent.is_active);
    const sellerAgents = agents.filter((agent) => agent.agent_type === 'Seller' && agent.is_active);

    const handleChange = (field, value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitError('');

        const result = await onSubmit({
            ...form,
            assigned_buyer_agent_id: parseNullableId(form.assigned_buyer_agent_id),
            assigned_seller_agent_id: parseNullableId(form.assigned_seller_agent_id),
        });

        if (!result?.success) {
            setSubmitError(result?.error || 'Unable to create customer profile.');
            return;
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 bg-brand-900 p-6 text-white">
                    <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        <h2 className="text-lg font-bold uppercase tracking-tight">{title}</h2>
                    </div>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-white/10">
                        <X />
                    </button>
                </div>

                <form className="flex flex-1 flex-col overflow-hidden" onSubmit={handleSubmit}>
                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        <section className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Basic Information</p>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    value={form.first_name}
                                    onChange={(event) => handleChange('first_name', event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    value={form.last_name}
                                    onChange={(event) => handleChange('last_name', event.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={form.email}
                                onChange={(event) => handleChange('email', event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                value={form.phone_number}
                                onChange={(event) => handleChange('phone_number', event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                            />
                        </section>

                        <section className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Client Classification</p>
                            <div className="flex gap-2">
                                {['Prospect', 'Buyer', 'Seller', 'Both'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleChange('client_type', type)}
                                        className={`flex-1 rounded-lg border py-2 text-xs font-bold uppercase transition-all ${
                                            form.client_type === type
                                                ? 'border-brand-200 bg-brand-50 text-brand-700'
                                                : 'border-gray-200 hover:bg-brand-50 hover:text-brand-600'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-brand-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lead Protection Assignment</p>
                            </div>
                            <select
                                value={form.assigned_buyer_agent_id}
                                onChange={(event) => handleChange('assigned_buyer_agent_id', event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"
                            >
                                <option value="">Select Buyer Agent...</option>
                                {buyerAgents.map((agent) => (
                                    <option key={agent.agent_id} value={agent.agent_id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={form.assigned_seller_agent_id}
                                onChange={(event) => handleChange('assigned_seller_agent_id', event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"
                            >
                                <option value="">Select Seller Agent...</option>
                                {sellerAgents.map((agent) => (
                                    <option key={agent.agent_id} value={agent.agent_id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs font-medium text-gray-500">
                                The UI keeps one buyer and one seller assignment per customer to respect lead protection rules.
                            </p>
                        </section>

                        {submitError && (
                            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>{submitError}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 bg-gray-50 p-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-brand-600 py-4 text-sm font-bold text-white shadow-xl shadow-brand-500/20 transition-all hover:bg-brand-700 disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving Profile...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
