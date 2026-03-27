<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Real Estate CRM</title>
    
    <!-- React & ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    
    <!-- Babel for in-browser JSX compilation -->
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-50 font-sans text-gray-800">
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect } = React;

        function App() {
            const [searchQuery, setSearchQuery] = useState('');
            const [customers, setCustomers] = useState([]);
            const [selectedCustomer, setSelectedCustomer] = useState(null);
            const [loading, setLoading] = useState(false);
            const [saveMessage, setSaveMessage] = useState('');

            // API Base URL (adjust if running locally without docker)
            const API_BASE = 'http://localhost:8000/api';

            const searchCustomers = async (query) => {
                setLoading(true);
                try {
                    const response = await fetch(`${API_BASE}/customers/search?q=${query}`);
                    const data = await response.json();
                    setCustomers(data);
                    if (data.length === 1 && !selectedCustomer) {
                        setSelectedCustomer(data[0]);
                    }
                } catch (error) {
                    console.error("Error fetching customers:", error);
                }
                setLoading(false);
            };

            // Trigger search on mount and when query changes
            useEffect(() => {
                const delayDebounceFn = setTimeout(() => {
                    searchCustomers(searchQuery);
                }, 300);
                return () => clearTimeout(delayDebounceFn);
            }, [searchQuery]);

            const updateCustomer = async (id, field, value) => {
                try {
                    await fetch(`${API_BASE}/customers/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ [field]: value })
                    });
                    
                    // Update local state
                    const updated = { ...selectedCustomer, [field]: value };
                    setSelectedCustomer(updated);
                    setSaveMessage('Saved!');
                    setTimeout(() => setSaveMessage(''), 2000);
                    
                    // Update list state
                    setCustomers(customers.map(c => c.customer_id === id ? updated : c));
                } catch (error) {
                    console.error("Error updating customer:", error);
                }
            };

            return (
                <div class="flex h-screen overflow-hidden">
                    {/* LEFT SIDEBAR: Search & List */}
                    <div class="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                        <div class="p-6 border-b border-gray-200 bg-gray-50">
                            <h1 class="text-2xl font-bold text-slate-800 mb-4">Clients</h1>
                            <div class="relative">
                                <input 
                                    type="text" 
                                    placeholder="Search name, phone, email..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <i data-lucide="search" class="absolute left-3 top-2.5 text-gray-400 w-5 h-5"></i>
                            </div>
                        </div>
                        
                        <div class="flex-1 overflow-y-auto p-4 space-y-2">
                            {loading ? (
                                <p class="text-gray-500 text-center py-4">Searching...</p>
                            ) : customers.length === 0 ? (
                                <p class="text-gray-500 text-center py-4">No clients found.</p>
                            ) : (
                                customers.map(c => (
                                    <div 
                                        key={c.customer_id}
                                        onClick={() => setSelectedCustomer(c)}
                                        class={`p-4 rounded-xl cursor-pointer border transition-colors ${selectedCustomer?.customer_id === c.customer_id ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                    >
                                        <h3 class="font-semibold text-gray-800">{c.first_name} {c.last_name}</h3>
                                        <p class="text-sm text-gray-500">{c.phone_number}</p>
                                        <span class="inline-block mt-2 px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                            {c.client_type}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* RIGHT MAIN PANEL: Customer 360 View */}
                    <div class="flex-1 overflow-y-auto bg-gray-50 p-8">
                        {selectedCustomer ? (
                            <div class="max-w-4xl mx-auto space-y-6">
                                
                                {/* Header Card */}
                                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                    <div class="flex justify-between items-start">
                                        <div>
                                            <h2 class="text-3xl font-bold text-gray-800">{selectedCustomer.first_name} {selectedCustomer.last_name}</h2>
                                            <div class="flex gap-4 mt-2 text-gray-600">
                                                <span class="flex items-center gap-1"><i data-lucide="phone" class="w-4 h-4"></i> {selectedCustomer.phone_number}</span>
                                                <span class="flex items-center gap-1"><i data-lucide="mail" class="w-4 h-4"></i> {selectedCustomer.email}</span>
                                            </div>
                                        </div>
                                        <div class="flex flex-col items-end gap-2">
                                            <select 
                                                value={selectedCustomer.client_type || 'Prospect'}
                                                onChange={(e) => updateCustomer(selectedCustomer.customer_id, 'client_type', e.target.value)}
                                                class="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="Prospect">Prospect</option>
                                                <option value="Buyer">Buyer</option>
                                                <option value="Seller">Seller</option>
                                                <option value="Both">Both</option>
                                            </select>
                                            {saveMessage && <span class="text-green-600 text-sm">{saveMessage}</span>}
                                        </div>
                                    </div>
                                    
                                    <div class="mt-6">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Agent Notes</label>
                                        <textarea 
                                            class="w-full w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                            value={selectedCustomer.comments_notes || ''}
                                            onChange={(e) => updateCustomer(selectedCustomer.customer_id, 'comments_notes', e.target.value)}
                                            placeholder="Add interaction notes here..."
                                        />
                                    </div>
                                </div>

                                {/* Properties Section */}
                                <h3 class="text-xl font-bold text-gray-800 mt-8 mb-4">Property Portfolio ({selectedCustomer.properties.length})</h3>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {selectedCustomer.properties.map(prop => (
                                        <div key={prop.property_id} class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                            <div class="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 class="text-lg font-bold text-gray-800">{prop.villa_number}</h4>
                                                    <p class="text-sm text-gray-500">{prop.project?.project_name} • {prop.project?.neighborhood_name}</p>
                                                </div>
                                                <div class="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                    <i data-lucide="home" class="w-5 h-5"></i>
                                                </div>
                                            </div>
                                            
                                            <div class="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between text-sm">
                                                <div class="text-center">
                                                    <span class="block text-gray-500 text-xs">Plan</span>
                                                    <span class="font-semibold">{prop.plan?.plan_name}</span>
                                                </div>
                                                <div class="text-center">
                                                    <span class="block text-gray-500 text-xs">Rooms</span>
                                                    <span class="font-semibold">{prop.plan?.number_of_rooms}</span>
                                                </div>
                                                <div class="text-center">
                                                    <span class="block text-gray-500 text-xs">Sq Ft</span>
                                                    <span class="font-semibold">{prop.plan?.square_footage}</span>
                                                </div>
                                            </div>

                                            <div class="mt-auto flex flex-wrap gap-2">
                                                {prop.is_corner && <span class="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md">Corner Unit</span>}
                                                {prop.is_lake_front && <span class="px-2 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 text-xs rounded-md">Lake Front</span>}
                                                {prop.is_park_front && <span class="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs rounded-md">Park Front</span>}
                                                {prop.is_beach && <span class="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs rounded-md">Beachfront</span>}
                                                {prop.is_market && <span class="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs rounded-md">Near Market</span>}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {selectedCustomer.properties.length === 0 && (
                                        <div class="col-span-full p-8 border-2 border-dashed border-gray-200 rounded-2xl text-center text-gray-500">
                                            This client doesn't have any associated properties yet.
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : (
                            <div class="h-full flex items-center justify-center text-gray-400">
                                <div class="text-center">
                                    <i data-lucide="users" class="w-16 h-16 mx-auto mb-4 opacity-50"></i>
                                    <p class="text-lg">Select a client to view their 360° portfolio</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<App />);
        
        // Initialize icons after render
        setTimeout(() => lucide.createIcons(), 100);
    </script>
</body>
</html>