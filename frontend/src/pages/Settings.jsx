import { useState } from 'react';
import {
    Upload, FileSpreadsheet, Plus, Users,
    Map, FileText, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import Card from '../components/Card';

export default function Settings() {
    const [activeTab, setActiveTab] = useState('import');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null); // 'success' | 'error' | null

    const handleFileUpload = (e) => {
        setIsUploading(true);
        // Simulate API call to /api/import/excel
        setTimeout(() => {
            setIsUploading(false);
            setUploadStatus('success');
        }, 2000);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Management</h1>
                <p className="text-gray-500 mt-1 font-medium">Configure team access, import bulk data, and manage project assets.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('import')}
                    className={`pb-4 px-4 text-sm font-bold transition-all ${activeTab === 'import' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Bulk Data Import
                </button>
                <button
                    onClick={() => setActiveTab('assets')}
                    className={`pb-4 px-4 text-sm font-bold transition-all ${activeTab === 'assets' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Project Assets
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`pb-4 px-4 text-sm font-bold transition-all ${activeTab === 'users' ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Analyst Accounts
                </button>
            </div>

            {/* TAB 1: BULK IMPORT */}
            {activeTab === 'import' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card title="Excel / CSV Importer" subtitle="Upload historical records to populate Customers and Properties in bulk.">
                            <div className={`mt-4 border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isUploading ? 'bg-gray-50 border-gray-200' : 'border-brand-200 hover:border-brand-500 hover:bg-brand-50/30'}`}>
                                {isUploading ? (
                                    <div className="flex flex-col items-center">
                                        <Loader2 className="w-10 h-10 text-brand-600 animate-spin mb-4" />
                                        <p className="font-bold text-gray-900">Processing File...</p>
                                        <p className="text-sm text-gray-500">Parsing rows and linking properties to owners.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mx-auto w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-4">
                                            <FileSpreadsheet className="w-8 h-8 text-brand-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Drop your file here</h3>
                                        <p className="text-sm text-gray-500 mt-1 mb-6">Supports .xlsx, .xls, and .csv formats.</p>
                                        <input type="file" id="bulk-file" className="hidden" onChange={handleFileUpload} />
                                        <label htmlFor="bulk-file" className="cursor-pointer px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/20 hover:bg-brand-700">
                                            Select Spreadsheet
                                        </label>
                                    </>
                                )}
                            </div>

                            {uploadStatus === 'success' && (
                                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800">
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span className="text-sm font-bold">Import Complete: 142 Customers and 89 Properties added.</span>
                                </div>
                            )}
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="Import Instructions">
                            <ul className="space-y-4 text-sm font-medium text-gray-600">
                                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 shrink-0 flex items-center justify-center text-[10px] font-black">1</div> Column headers must match: email, first_name, last_name, villa_number.</li>
                                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 shrink-0 flex items-center justify-center text-[10px] font-black">2</div> Duplicate emails will be skipped.</li>
                                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 shrink-0 flex items-center justify-center text-[10px] font-black">3</div> Properties will be auto-linked if the owner's email exists.</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB 2: ASSET MANAGER */}
            {activeTab === 'assets' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title="Add New Project" subtitle="Upload neighborhood layout plans for geographical context.">
                        <div className="space-y-4">
                            <input type="text" placeholder="Project Name (e.g., Palm Jumeirah)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-500/20" />
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                                <Map className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase">Community Layout Image (.jpg/.png)</p>
                                <button className="mt-3 text-xs font-black text-brand-600 hover:underline">Browse Files</button>
                            </div>
                            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl">Create Project</button>
                        </div>
                    </Card>

                    <Card title="Add Floor Plan" subtitle="Link unit architectures to specific projects.">
                        <div className="space-y-4">
                            <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none">
                                <option>Select Project...</option>
                                <option>Palm Jumeirah</option>
                            </select>
                            <input type="text" placeholder="Plan Name (e.g., Type 3M)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-xs font-bold text-gray-400 uppercase">Floor Plan Image (.jpg/.png)</p>
                                <button className="mt-3 text-xs font-black text-brand-600 hover:underline">Browse Files</button>
                            </div>
                            <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-xl">Create Floor Plan</button>
                        </div>
                    </Card>
                </div>
            )}

            {/* TAB 3: ANALYST ACCOUNTS */}
            {activeTab === 'users' && (
                <Card title="System Users" subtitle="Manage the 3 Data Analysts who have access to this CRM.">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input type="text" placeholder="Full Name" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                            <input type="email" placeholder="Email Address" className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" />
                            <button className="flex items-center justify-center gap-2 bg-brand-600 text-white rounded-xl font-bold text-sm hover:bg-brand-700 transition-all shadow-md">
                                <Plus className="w-4 h-4" /> Add Analyst
                            </button>
                        </div>

                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 font-bold text-gray-400 uppercase tracking-widest text-[10px]">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-bold">Admin User</td>
                                        <td className="px-6 py-4 font-medium text-gray-500">admin@crm.local</td>
                                        <td className="px-6 py-4 text-right"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md font-black text-[10px]">ACTIVE</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}