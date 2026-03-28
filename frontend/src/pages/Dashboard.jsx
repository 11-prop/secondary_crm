import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, NotebookTabs, ShieldCheck, Users } from "lucide-react";

import Card from "../components/Card";
import { listAgents, listCustomers, listNotesByCustomer, listProperties, listUsers } from "../api/resources";
import { formatCustomerName, formatDateLabel } from "../lib/formatters";

const quickLinks = [
    { label: "Open customer directory", href: "/customers" },
    { label: "Review property inventory", href: "/properties" },
    { label: "Manage agent roster", href: "/agents" },
    { label: "Run imports and asset uploads", href: "/settings" },
];

export default function Dashboard() {
    const [state, setState] = useState({
        customers: [],
        properties: [],
        agents: [],
        users: [],
        recentNotes: [],
        isLoading: true,
        error: "",
    });

    useEffect(() => {
        let isActive = true;

        async function loadDashboard() {
            try {
                const [customersResponse, propertiesResponse, agentsResponse, usersResponse] = await Promise.all([
                    listCustomers({ limit: 20 }),
                    listProperties({ limit: 50 }),
                    listAgents(),
                    listUsers(),
                ]);

                const customers = customersResponse.items;
                const recentNotes = (
                    await Promise.all(
                        customers.slice(0, 5).map(async (customer) => {
                            const notesResponse = await listNotesByCustomer(customer.customer_id);
                            return notesResponse.items;
                        }),
                    )
                )
                    .flat()
                    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at))
                    .slice(0, 5);

                if (!isActive) {
                    return;
                }

                setState({
                    customers,
                    properties: propertiesResponse.items,
                    agents: agentsResponse.items,
                    users: usersResponse.items,
                    recentNotes,
                    isLoading: false,
                    error: "",
                });
            } catch (error) {
                if (!isActive) {
                    return;
                }

                setState({
                    customers: [],
                    properties: [],
                    agents: [],
                    users: [],
                    recentNotes: [],
                    isLoading: false,
                    error: error.message,
                });
            }
        }

        loadDashboard();

        return () => {
            isActive = false;
        };
    }, []);

    const protectedLeads = state.customers.filter(
        (customer) => customer.assigned_buyer_agent_id || customer.assigned_seller_agent_id,
    ).length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">Operations overview</p>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Frontend control center</h1>
                    <p className="mt-2 max-w-3xl text-sm font-medium text-gray-500">
                        Track roster health, customer coverage, and the screens that still need attention.
                    </p>
                </div>
                {state.error && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                        Unable to load dashboard data. {state.error}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DashboardStat icon={Users} label="Customers" value={state.customers.length} tone="sky" />
                <DashboardStat icon={ShieldCheck} label="Protected Leads" value={protectedLeads} tone="emerald" />
                <DashboardStat icon={Building2} label="Properties" value={state.properties.length} tone="amber" />
                <DashboardStat icon={NotebookTabs} label="Analyst Accounts" value={state.users.length} tone="slate" />
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.95fr]">
                <Card
                    title="Latest customer activity"
                    subtitle="Recent timeline entries give us the fastest signal on where the workflows are alive."
                >
                    {state.isLoading ? (
                        <p className="text-sm font-medium text-gray-500">Loading recent activity...</p>
                    ) : state.recentNotes.length === 0 ? (
                        <p className="text-sm font-medium text-gray-500">No notes have been recorded yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {state.recentNotes.map((note) => {
                                const customer = state.customers.find((item) => item.customer_id === note.customer_id);
                                return (
                                    <div key={note.note_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{formatCustomerName(customer)}</p>
                                                <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">{note.note_text}</p>
                                            </div>
                                            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
                                                {formatDateLabel(note.created_at, true)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>

                <Card
                    title="Step-by-step screen path"
                    subtitle="These are the flows the frontend now supports or is positioned to support next."
                >
                    <div className="space-y-4">
                        {quickLinks.map((item) => (
                            <Link
                                key={item.href}
                                to={item.href}
                                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                            >
                                <span className="text-sm font-bold text-gray-800">{item.label}</span>
                                <ArrowRight className="h-4 w-4 text-brand-600 transition-transform group-hover:translate-x-1" />
                            </Link>
                        ))}
                    </div>

                    <div className="mt-6 rounded-2xl bg-gray-950 p-5 text-white">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-sky-300">Current baseline</p>
                        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-white/60">Active agents</p>
                                <p className="mt-1 text-2xl font-black">{state.agents.filter((agent) => agent.is_active).length}</p>
                            </div>
                            <div>
                                <p className="text-white/60">Notes loaded</p>
                                <p className="mt-1 text-2xl font-black">{state.recentNotes.length}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function DashboardStat({ icon: Icon, label, value, tone }) {
    const tones = {
        sky: "bg-sky-50 text-sky-900 ring-sky-100",
        emerald: "bg-emerald-50 text-emerald-900 ring-emerald-100",
        amber: "bg-amber-50 text-amber-900 ring-amber-100",
        slate: "bg-slate-100 text-slate-900 ring-slate-200",
    };

    return (
        <div className={`rounded-3xl p-5 ring-1 ${tones[tone]}`}>
            <div className="flex items-center justify-between">
                <p className="text-xs font-black uppercase tracking-[0.3em] opacity-70">{label}</p>
                <Icon className="h-5 w-5" />
            </div>
            <p className="mt-5 text-3xl font-black">{value}</p>
        </div>
    );
}
