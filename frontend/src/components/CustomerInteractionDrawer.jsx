import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, MessageSquare, Plus, X } from 'lucide-react';

import { createNote, listNotesByCustomer } from '../api/resources';
import { formatDateLabel } from '../lib/formatters';

export default function CustomerInteractionDrawer({ isOpen, onClose, customer = null, agents = [], onNoteAdded }) {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [noteAgentId, setNoteAgentId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isOpen || !customer?.customer_id) {
            setNotes([]);
            setNoteText('');
            setNoteAgentId('');
            setError('');
            setIsLoading(false);
            setIsSaving(false);
            return;
        }

        let active = true;
        setIsLoading(true);
        setError('');
        setNoteText('');
        setNoteAgentId('');

        listNotesByCustomer(customer.customer_id)
            .then((response) => {
                if (!active) {
                    return;
                }
                setNotes(response.items);
            })
            .catch((loadError) => {
                if (!active) {
                    return;
                }
                setNotes([]);
                setError(loadError.message);
            })
            .finally(() => {
                if (active) {
                    setIsLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [customer, isOpen]);

    if (!isOpen || !customer) {
        return null;
    }

    const activeAgents = agents.filter((agent) => agent.is_active);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!noteText.trim()) {
            return;
        }

        setIsSaving(true);
        setError('');
        try {
            const note = await createNote({
                customer_id: customer.customer_id,
                agent_id: noteAgentId ? Number(noteAgentId) : null,
                note_text: noteText.trim(),
            });
            setNotes((current) => [note, ...current]);
            setNoteText('');
            setNoteAgentId('');
            onNoteAdded?.(customer.customer_id, note);
        } catch (saveError) {
            setError(saveError.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl flex-col bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 bg-brand-900 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <MessageSquare className="h-5 w-5" />
                        <div>
                            <h2 className="text-lg font-bold uppercase tracking-tight">Customer Interactions</h2>
                            <p className="mt-1 text-sm font-medium text-white/70">{customer.first_name} {customer.last_name || ''}</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="grid flex-1 grid-cols-1 overflow-hidden xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="border-b border-gray-100 bg-gray-50/60 p-6 xl:border-b-0 xl:border-r xl:border-gray-100">
                        <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-brand-600" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Add interaction</p>
                        </div>

                        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                            <select
                                value={noteAgentId}
                                onChange={(event) => setNoteAgentId(event.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none"
                            >
                                <option value="">Select related agent</option>
                                {activeAgents.map((agent) => (
                                    <option key={agent.agent_id} value={agent.agent_id}>
                                        {agent.name}
                                    </option>
                                ))}
                            </select>

                            <textarea
                                rows={7}
                                value={noteText}
                                onChange={(event) => setNoteText(event.target.value)}
                                placeholder="Capture the latest call outcome, field feedback, follow-up, or handover note."
                                className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-sm outline-none"
                            />

                            {error && (
                                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSaving || !noteText.trim()}
                                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                                {isSaving ? 'Saving note...' : 'Add interaction'}
                            </button>
                        </form>
                    </div>

                    <div className="flex min-h-0 flex-col p-6">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Previous interactions</p>
                            <p className="mt-2 text-sm font-medium text-gray-500">Newest notes stay at the top so you can quickly cross-check the last contact.</p>
                        </div>

                        <div className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
                            {isLoading ? (
                                <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading previous interactions...
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm font-medium text-gray-500">
                                    No interactions have been recorded for this customer yet.
                                </div>
                            ) : (
                                notes.map((note) => {
                                    const agent = agents.find((item) => item.agent_id === note.agent_id);
                                    return (
                                        <div key={note.note_id} className="relative border-l-2 border-brand-100 pl-6">
                                            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-brand-500 bg-white" />
                                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                                <p className="text-sm font-medium leading-relaxed text-gray-700">{note.note_text}</p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                                    <span>{agent?.name || 'System entry'}</span>
                                                    <span>-</span>
                                                    <span>{formatDateLabel(note.created_at, true)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
