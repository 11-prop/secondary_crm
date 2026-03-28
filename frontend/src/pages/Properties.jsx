import { useState } from 'react';
import { Home, Filter, MapPin, Search, ExternalLink, Waves, Navigation } from 'lucide-react';
import Card from '../components/Card';

const mockProperties = [
    { id: 101, villa: "Villa 12", project: "Palm Jumeirah", owner: "John Doe", status: "Active", type: "Beachfront", price: "12M AED" },
    { id: 102, villa: "Townhouse 84", project: "The Springs", owner: "John Doe", status: "Rented", type: "Lake-front", price: "210k AED" },
    { id: 103, villa: "Apartment 402", project: "Marina Gate", owner: "Sarah Smith", status: "Available", type: "Corner", price: "4.5M AED" },
];

export default function Properties() {
    const [filter, setFilter] = useState('All');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Property Inventory</h1>
                    <p className="text-gray-500 font-medium mt-1">Global view of all real estate assets and their current occupancy.</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm">
                        <Filter className="w-4 h-4" /> Filters
                    </button>
                    <button className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20">
                        Add Unit
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Unit Info</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Owner</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Attributes</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Valuation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {mockProperties.map((p) => (
                                <tr key={p.id} className="hover:bg-brand-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-brand-50 rounded-lg text-brand-600"><Home className="w-5 h-5" /></div>
                                            <div>
                                                <p className="font-bold text-gray-900">{p.villa}</p>
                                                <p className="text-[10px] font-black text-brand-600 uppercase">{p.status}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-600">
                                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {p.project}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900 hover:text-brand-600 cursor-pointer flex items-center gap-1">
                                            {p.owner} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.type === 'Beachfront' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-black uppercase ring-1 ring-blue-100">
                                                <Waves className="w-3 h-3" /> {p.type}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-black uppercase">
                                                <Navigation className="w-3 h-3" /> {p.type}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-black text-gray-900">{p.price}</p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}