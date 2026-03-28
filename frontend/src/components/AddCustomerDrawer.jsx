import { X, UserPlus, Shield } from 'lucide-react';

export default function AddCustomerDrawer({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-brand-900 text-white">
                    <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        <h2 className="text-lg font-bold uppercase tracking-tight">New Customer Profile</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                </div>

                <form className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Identity Section */}
                    <section className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Basic Information</p>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" placeholder="First Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                            <input type="text" placeholder="Last Name" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                        </div>
                        <input type="email" placeholder="Email Address" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                        <input type="tel" placeholder="Phone Number" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                    </section>

                    {/* Classification */}
                    <section className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Client Classification</p>
                        <div className="flex gap-2">
                            {['Buyer', 'Seller', 'Both'].map(type => (
                                <button key={type} type="button" className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-bold hover:bg-brand-50 hover:text-brand-600 transition-all uppercase">
                                    {type}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Initial Lead Protection */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-brand-600" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lead Protection Assignment</p>
                        </div>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                            <option>Select Buyer Agent...</option>
                        </select>
                        <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                            <option>Select Seller Agent...</option>
                        </select>
                    </section>
                </form>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <button className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-brand-500/20 hover:bg-brand-700 transition-all">
                        Create Customer Profile
                    </button>
                </div>
            </div>
        </div>
    );
}