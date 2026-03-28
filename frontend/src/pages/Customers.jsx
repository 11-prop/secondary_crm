import { useState } from 'react';
import { Search, Plus, ArrowRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const mockCustomers = [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-0100', type: 'Both' },
    { id: 2, firstName: 'Sarah', lastName: 'Smith', email: 'sarah@example.com', phone: '555-0200', type: 'Buyer' },
    { id: 3, firstName: 'Michael', lastName: 'Chen', email: 'm.chen@example.com', phone: '555-0345', type: 'Seller' },
];

export default function Customers() {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = mockCustomers.filter(c =>
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Directory</h1>
                    <p className="mt-2 text-lg text-gray-500">
                        Manage lead protection and client profiles.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all font-semibold shadow-md active:scale-95">
                    <Plus className="w-5 h-5" />
                    Add Customer
                </button>
            </div>

            {/* Main Content Card */}
            <Card
                title="Active Clients"
                subtitle="All leads currently assigned to the sales team."
                actions={
                    <div className="relative group w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm"
                            placeholder="Search leads..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                }
            >
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Info</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-brand-50/30 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-brand-100 flex items-center justify-center ring-2 ring-white">
                                            <span className="text-brand-600 font-bold text-sm">
                                                {customer.firstName[0]}{customer.lastName?.[0]}
                                            </span>
                                        </div>
                                        <div className="ml-4 font-semibold text-gray-900">
                                            {customer.firstName} {customer.lastName}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="text-gray-900 font-medium">{customer.email}</div>
                                    <div className="text-gray-400 mt-0.5">{customer.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold tracking-wide
                                        ${customer.type === 'Buyer' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' :
                                            customer.type === 'Seller' ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100' :
                                                'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'}
                                    `}>
                                        {customer.type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold">
                                    <Link
                                        to={`/customers/${customer.id}`}
                                        className="text-brand-600 hover:text-brand-900 flex items-center justify-end gap-1 group-hover:translate-x-1 transition-transform"
                                    >
                                        View 360 <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-20 bg-gray-50/30">
                        <Users className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">No customers found</h3>
                        <p className="mt-2 text-gray-500">Try adjusting your search query.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}