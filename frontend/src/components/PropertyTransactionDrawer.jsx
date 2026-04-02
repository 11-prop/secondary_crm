import { Building2, Loader2, ReceiptText, X } from 'lucide-react';

import { formatCurrency, formatDateLabel } from '../lib/formatters';

export default function PropertyTransactionDrawer({
    isOpen,
    onClose,
    property = null,
    transactions = [],
    isLoading = false,
    isSaving = false,
    form,
    onFormChange,
    onSubmit,
}) {
    if (!isOpen || !property) {
        return null;
    }

    const attributeTags = buildPropertySummaryTags(property);

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 bg-brand-900 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <ReceiptText className="h-5 w-5" />
                        <div>
                            <h2 className="text-lg font-bold uppercase tracking-tight">Manage Market Transactions</h2>
                            <p className="mt-1 text-sm font-medium text-white/70">{property.villa_number}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="border-b border-gray-100 bg-gray-50/60 p-6 xl:border-b-0 xl:border-r xl:border-gray-100">
                        <div className="rounded-2xl border border-gray-200 bg-white p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-xl bg-brand-50 p-2 text-brand-600">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-base font-bold text-gray-900">{property.villa_number}</p>
                                    <p className="mt-1 text-sm font-medium text-gray-500">{property.project_name || 'Unassigned project'}{property.community_name ? ` - ${property.community_name}` : ''}</p>
                                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                                        {property.community_name ? 'New entries default to this community ledger.' : 'No community is linked, so you can attach the record directly to this property.'}
                                    </p>
                                </div>
                            </div>

                            {attributeTags.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {attributeTags.map((tag) => (
                                        <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-1">
                                <input
                                    type="date"
                                    value={form.transaction_date}
                                    onChange={(event) => onFormChange('transaction_date', event.target.value)}
                                    className="rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none"
                                />
                                <select
                                    value={form.transaction_type}
                                    onChange={(event) => onFormChange('transaction_type', event.target.value)}
                                    className="rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none"
                                >
                                    <option>Sale</option>
                                    <option>Rent</option>
                                </select>
                                <input
                                    type="number"
                                    value={form.price}
                                    onChange={(event) => onFormChange('price', event.target.value)}
                                    placeholder="Price"
                                    className="rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none"
                                />
                            </div>

                            <textarea
                                rows={6}
                                value={form.notes}
                                onChange={(event) => onFormChange('notes', event.target.value)}
                                placeholder="Capture the deal structure, rental terms, broker note, or follow-up context."
                                className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm outline-none"
                            />

                            <label className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={Boolean(form.bind_to_property)}
                                    onChange={(event) => onFormChange('bind_to_property', event.target.checked)}
                                />
                                <span>Attach this transaction specifically to {property.villa_number}</span>
                            </label>

                            <div className="flex items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                                >
                                    {isSaving ? 'Saving transaction...' : 'Save transaction'}
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-gray-600"
                                >
                                    Close panel
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="flex min-h-0 flex-col p-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Community Ledger</p>
                            <p className="mt-2 text-sm font-medium text-gray-500">This view combines community comps with any unit-specific transaction history linked to the selected property.</p>
                        </div>

                        <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
                            {isLoading ? (
                                <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading transactions...
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm font-medium text-gray-500">
                                    No market transactions are recorded for this context yet.
                                </div>
                            ) : (
                                transactions.map((transaction) => (
                                    <div key={transaction.transaction_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-900">{getTransactionTitle(transaction)}</p>
                                                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ring-1 ring-gray-200">
                                                        {getTransactionScopeLabel(transaction)}
                                                    </span>
                                                    {transaction.transaction_group && (
                                                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-brand-700 ring-1 ring-brand-100">
                                                            {transaction.transaction_group}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-1 text-xs font-medium text-gray-400">{formatTransactionDate(transaction)}</p>
                                            </div>
                                            <p className="text-sm font-black text-gray-900">{formatCurrency(transaction.price)}</p>
                                        </div>
                                        {getTransactionAreaLabel(transaction) && (
                                            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">{getTransactionAreaLabel(transaction)}</p>
                                        )}
                                        {transaction.notes && (
                                            <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600">{transaction.notes}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function buildPropertySummaryTags(property) {
    const tags = [property.property_status].filter(Boolean);
    if (property.owner_name) {
        tags.push(`Owner: ${property.owner_name}`);
    }
    if (Array.isArray(property.attribute_tags) && property.attribute_tags.length > 0) {
        tags.push(...property.attribute_tags.slice(0, 4));
    }
    return tags;
}

function getTransactionTitle(transaction) {
    return transaction?.transaction_procedure || transaction?.transaction_type || transaction?.transaction_group || 'Transaction';
}

function getTransactionScopeLabel(transaction) {
    if (transaction?.property_id) {
        return 'Property-specific';
    }
    if (transaction?.plan_id) {
        return 'Plan comp';
    }
    if (transaction?.community_id) {
        return 'Community comp';
    }
    if (transaction?.project_id) {
        return 'Project comp';
    }
    return 'General market';
}

function getTransactionAreaLabel(transaction) {
    const actualArea = formatAreaValue(transaction?.actual_area);
    if (actualArea) {
        return `Actual area ${actualArea}`;
    }
    const procedureArea = formatAreaValue(transaction?.procedure_area);
    if (procedureArea) {
        return `Procedure area ${procedureArea}`;
    }
    return '';
}

function formatAreaValue(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const number = Number(value);
    if (Number.isNaN(number)) {
        return '';
    }

    return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number)} sqft`;
}

function formatTransactionDate(transaction) {
    if (transaction?.transaction_recorded_at) {
        return formatDateLabel(transaction.transaction_recorded_at, true);
    }

    return formatDateLabel(transaction?.transaction_date);
}
