import { useParams, Link } from 'react-router-dom';
import {
    ChevronLeft, Mail, Phone, Home, MessageSquare,
    ShieldCheck, Plus, Map, History, Maximize2,
    FileText, Waves, Navigation, User, LayoutGrid
} from 'lucide-react';
import Card from '../components/Card';

export default function Customer360() {
    const { id } = useParams();

    // Mock data representing a joined response from all CRM entities
    const customer = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "555-0100",
        type: "Both",
        buyerAgent: "Alice Buyer",
        sellerAgent: "Charlie Seller",
        properties: [
            {
                id: 101,
                villa: "Villa 12",
                project: "Palm Jumeirah",
                planName: "Signature Villa",
                sqft: "7,000",
                rooms: 6,
                status: "Active Listing",
                attributes: { is_beach: true, is_corner: true },
                layoutImage: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&q=80&w=800",
                floorPlanImage: "https://images.unsplash.com/photo-1503387762-592dea58ef21?auto=format&fit=crop&q=80&w=800",
                history: [
                    { id: 1, type: "Sale", date: "May 10, 2020", price: "12,000,000 AED" }
                ]
            }
        ],
        notes: [
            { id: 1, text: "John called to discuss listing his current villa.", agent: "Charlie Seller", date: "2026-03-20" },
            { id: 2, text: "Sent beachfront properties for consideration.", agent: "Alice Buyer", date: "2026-03-18" }
        ]
    };

    return (
        <div className="space-y-6">
            {/* 1. PII INFORMATION BAR */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
                            <span className="text-[10px] font-black px-2 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter">ID: {id}</span>
                        </div>
                        <div className="flex gap-4 mt-1">
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><Mail className="w-3.5 h-3.5 text-brand-500" /> {customer.email}</span>
                            <span className="flex items-center gap-1 text-xs font-medium text-gray-500"><Phone className="w-3.5 h-3.5 text-brand-500" /> {customer.phone}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Holdings</p>
                        <p className="text-sm font-bold text-gray-900">{customer.properties.length} Properties</p>
                    </div>
                    <div className="h-10 w-px bg-gray-200" />
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Customer Type</p>
                        <span className="text-xs font-black text-brand-700 uppercase tracking-widest">{customer.type}</span>
                    </div>
                </div>
            </div>

            {/* 2. LEAD PROTECTION & AGENT ASSIGNMENT BAR */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm grid grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Buyer Agent</p>
                            <p className="text-sm font-bold text-blue-900">{customer.buyerAgent}</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline">Change</button>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-purple-500" />
                        <div>
                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Seller Agent</p>
                            <p className="text-sm font-bold text-purple-900">{customer.sellerAgent}</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-bold text-purple-600 hover:underline">Change</button>
                </div>
            </div>

            {/* 3. SPLIT CONTENT VIEW */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                {/* LEFT: PROPERTY LISTINGS */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                            <Home className="w-5 h-5 text-brand-600" /> Property Listings
                        </h2>
                        <button className="text-[10px] font-bold bg-gray-900 text-white px-3 py-1 rounded-md hover:bg-gray-800 transition-colors">Link Property</button>
                    </div>

                    {customer.properties.map((p) => (
                        <Card key={p.id} title={`${p.villa} • ${p.project}`} subtitle={p.planName}>
                            <div className="space-y-6">
                                <div className="flex gap-2">
                                    {p.attributes.is_beach && <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold ring-1 ring-blue-100 flex items-center gap-1"><Waves className="w-3 h-3" /> Beachfront</span>}
                                    {p.attributes.is_corner && <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold flex items-center gap-1"><Navigation className="w-3 h-3" /> Corner</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><Map className="w-3 h-3" /> Neighborhood</p>
                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group cursor-pointer">
                                            <img src={p.layoutImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Community" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="text-white w-5 h-5" /></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1"><FileText className="w-3 h-3" /> Floor Plan</p>
                                        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative group cursor-pointer">
                                            <img src={p.floorPlanImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Plan" />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="text-white w-5 h-5" /></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 grid grid-cols-3 gap-4 text-center">
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Area</p><p className="text-xs font-bold text-gray-900">{p.sqft} sqft</p></div>
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Rooms</p><p className="text-xs font-bold text-gray-900">{p.rooms}</p></div>
                                    <div><p className="text-[10px] font-bold text-gray-400 uppercase">Status</p><p className="text-xs font-bold text-brand-600">{p.status}</p></div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* RIGHT: INTERACTION LEDGER */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-1">
                        <h2 className="font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-brand-600" /> Interaction Ledger
                        </h2>
                        <button className="text-[10px] font-bold bg-brand-600 text-white px-3 py-1 rounded-md hover:bg-brand-700 transition-colors flex items-center gap-1"><Plus className="w-3 h-3" /> New Note</button>
                    </div>

                    <Card>
                        <div className="space-y-6">
                            {customer.notes.map((note) => (
                                <div key={note.id} className="relative pl-6 border-l-2 border-brand-100 pb-2">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-brand-500" />
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <p className="text-sm text-gray-700 font-medium leading-relaxed">{note.text}</p>
                                        <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <span>{note.agent}</span>
                                            <span>•</span>
                                            <span>{note.date}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}