import { useEffect, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react';

import Card from '../components/Card';
import {
    createFloorPlan,
    createProject,
    createUser,
    importSpreadsheet,
    listFloorPlans,
    listProjects,
    listUsers,
    uploadImage,
} from '../api/resources';
import { demoFloorPlans, demoProjects, demoUsers } from '../data/demoData';
import { formatDateLabel } from '../lib/formatters';

const emptyProjectForm = { project_name: '', neighborhood_name: '', file: null };
const emptyPlanForm = { project_id: '', plan_name: '', number_of_rooms: '', square_footage: '', amenities: '', file: null };
const emptyUserForm = { full_name: '', email: '', password: '' };

export default function Settings() {
    const [activeTab, setActiveTab] = useState('import');
    const [data, setData] = useState({ projects: [], plans: [], users: [], isDemo: false, warning: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [projectForm, setProjectForm] = useState(emptyProjectForm);
    const [planForm, setPlanForm] = useState(emptyPlanForm);
    const [userForm, setUserForm] = useState(emptyUserForm);
    const [savingProject, setSavingProject] = useState(false);
    const [savingPlan, setSavingPlan] = useState(false);
    const [savingUser, setSavingUser] = useState(false);

    useEffect(() => {
        loadSettingsData();
    }, []);

    async function loadSettingsData() {
        try {
            const [projectsRes, plansRes, usersRes] = await Promise.all([listProjects(), listFloorPlans(), listUsers()]);
            setData({ projects: projectsRes.items, plans: plansRes.items, users: usersRes.items, isDemo: false, warning: '' });
        } catch (error) {
            setData({ projects: demoProjects, plans: demoFloorPlans, users: demoUsers, isDemo: true, warning: error.message });
        }
    }

    async function handleImportFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const result = data.isDemo ? { customers_added: 12, properties_added: 7 } : await importSpreadsheet(file);
            setImportResult(result);
        } finally {
            setIsUploading(false);
        }
    }

    async function handleCreateProject(event) {
        event.preventDefault();
        setSavingProject(true);
        try {
            const layout_plan_path = data.isDemo || !projectForm.file ? `/uploads/projects/${projectForm.project_name.replace(/\s+/g, '-').toLowerCase()}.jpg` : await uploadImage('projects', projectForm.file);
            const payload = { project_name: projectForm.project_name, neighborhood_name: projectForm.neighborhood_name || null, layout_plan_path };
            const project = data.isDemo ? { ...payload, project_id: Date.now() } : await createProject(payload);
            setData((current) => ({ ...current, projects: [project, ...current.projects] }));
            setProjectForm(emptyProjectForm);
        } finally {
            setSavingProject(false);
        }
    }

    async function handleCreatePlan(event) {
        event.preventDefault();
        setSavingPlan(true);
        try {
            const floor_plan_image_path = data.isDemo || !planForm.file ? `/uploads/plans/${planForm.plan_name.replace(/\s+/g, '-').toLowerCase()}.jpg` : await uploadImage('plans', planForm.file);
            const payload = {
                project_id: Number(planForm.project_id),
                plan_name: planForm.plan_name,
                number_of_rooms: planForm.number_of_rooms ? Number(planForm.number_of_rooms) : null,
                square_footage: planForm.square_footage ? Number(planForm.square_footage) : null,
                amenities: planForm.amenities || null,
                floor_plan_image_path,
            };
            const plan = data.isDemo ? { ...payload, plan_id: Date.now() } : await createFloorPlan(payload);
            setData((current) => ({ ...current, plans: [plan, ...current.plans] }));
            setPlanForm(emptyPlanForm);
        } finally {
            setSavingPlan(false);
        }
    }

    async function handleCreateUser(event) {
        event.preventDefault();
        setSavingUser(true);
        try {
            const payload = { ...userForm, is_admin: true, is_active: true };
            const user = data.isDemo ? { ...payload, user_id: Date.now(), created_at: new Date().toISOString() } : await createUser(payload);
            setData((current) => ({ ...current, users: [user, ...current.users] }));
            setUserForm(emptyUserForm);
        } finally {
            setSavingUser(false);
        }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">System Management</h1>
                <p className="mt-1 text-gray-500">Configure imports, maintain visual assets, and manage analyst access.</p>
            </div>

            {data.isDemo && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">Demo mode is active for this screen. {data.warning}</div>}

            <div className="flex gap-2 border-b border-gray-200">
                {[
                    ['import', 'Bulk Data Import'],
                    ['assets', 'Project Assets'],
                    ['users', 'Analyst Accounts'],
                ].map(([tab, label]) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 pb-4 text-sm font-bold transition-all ${activeTab === tab ? 'border-b-2 border-brand-600 text-brand-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeTab === 'import' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card title="Excel / CSV Importer" subtitle="Upload historical records to populate customers and properties in bulk.">
                        <div className={`rounded-2xl border-2 border-dashed p-12 text-center transition-all ${isUploading ? 'border-gray-200 bg-gray-50' : 'border-brand-200 bg-brand-50/30 hover:border-brand-500'}`}>
                            {isUploading ? (
                                <div className="flex flex-col items-center"><Loader2 className="mb-4 h-10 w-10 animate-spin text-brand-600" /><p className="font-bold text-gray-900">Processing file...</p><p className="text-sm text-gray-500">Parsing rows and linking properties to owners.</p></div>
                            ) : (
                                <>
                                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100"><FileSpreadsheet className="h-8 w-8 text-brand-600" /></div>
                                    <h3 className="text-lg font-bold text-gray-900">Drop your file here</h3>
                                    <p className="mb-6 mt-1 text-sm text-gray-500">Supports .xlsx, .xls, and .csv formats.</p>
                                    <input type="file" id="bulk-file" className="hidden" onChange={handleImportFile} />
                                    <label htmlFor="bulk-file" className="cursor-pointer rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700">Select Spreadsheet</label>
                                </>
                            )}
                        </div>
                        {importResult && <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 className="h-5 w-5" /><span className="text-sm font-bold">Import complete: {importResult.customers_added} customers and {importResult.properties_added} properties added.</span></div>}
                    </Card>
                    <Card title="Import Instructions">
                        <ul className="space-y-4 text-sm font-medium text-gray-600">
                            <li>1. Expected columns include `first_name`, `last_name`, `email`, `phone_number`, and `villa_number`.</li>
                            <li>2. Duplicate emails are skipped during import.</li>
                            <li>3. Matching owner emails allow properties to auto-link to customers.</li>
                        </ul>
                    </Card>
                </div>
            )}

            {activeTab === 'assets' && (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <Card title="Add New Project" subtitle="Upload neighborhood layout plans for geographical context.">
                        <form className="space-y-4" onSubmit={handleCreateProject}>
                            <input type="text" required placeholder="Project Name" value={projectForm.project_name} onChange={(event) => setProjectForm((current) => ({ ...current, project_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            <input type="text" placeholder="Neighborhood name" value={projectForm.neighborhood_name} onChange={(event) => setProjectForm((current) => ({ ...current, neighborhood_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm font-semibold text-gray-600"><Upload className="h-4 w-4 text-brand-600" />Upload layout image<input type="file" accept="image/*" className="hidden" onChange={(event) => setProjectForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></label>
                            <button type="submit" disabled={savingProject} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-xl disabled:opacity-60">{savingProject ? 'Creating project...' : 'Create Project'}</button>
                        </form>
                    </Card>

                    <Card title="Add Floor Plan" subtitle="Link standardized layouts to existing projects.">
                        <form className="space-y-4" onSubmit={handleCreatePlan}>
                            <select required value={planForm.project_id} onChange={(event) => setPlanForm((current) => ({ ...current, project_id: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select Project...</option>{data.projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>
                            <input type="text" required placeholder="Plan Name" value={planForm.plan_name} onChange={(event) => setPlanForm((current) => ({ ...current, plan_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" placeholder="Rooms" value={planForm.number_of_rooms} onChange={(event) => setPlanForm((current) => ({ ...current, number_of_rooms: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="number" placeholder="Square footage" value={planForm.square_footage} onChange={(event) => setPlanForm((current) => ({ ...current, square_footage: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            </div>
                            <textarea rows={3} placeholder="Amenities" value={planForm.amenities} onChange={(event) => setPlanForm((current) => ({ ...current, amenities: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm font-semibold text-gray-600"><Upload className="h-4 w-4 text-brand-600" />Upload floor plan image<input type="file" accept="image/*" className="hidden" onChange={(event) => setPlanForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></label>
                            <button type="submit" disabled={savingPlan} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-xl disabled:opacity-60">{savingPlan ? 'Creating floor plan...' : 'Create Floor Plan'}</button>
                        </form>
                    </Card>

                    <Card title="Projects" subtitle="Existing communities in the CRM.">
                        <div className="space-y-3">{data.projects.map((project) => <div key={project.project_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="font-bold text-gray-900">{project.project_name}</p><p className="mt-1 text-sm text-gray-500">{project.neighborhood_name || 'No neighborhood label yet'}</p></div>)}</div>
                    </Card>

                    <Card title="Floor Plans" subtitle="Existing standardized layouts.">
                        <div className="space-y-3">{data.plans.map((plan) => <div key={plan.plan_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><p className="font-bold text-gray-900">{plan.plan_name}</p><p className="mt-1 text-sm text-gray-500">{plan.number_of_rooms || 'N/A'} rooms • {plan.square_footage || 'N/A'} sqft</p></div>)}</div>
                    </Card>
                </div>
            )}

            {activeTab === 'users' && (
                <Card title="System Users" subtitle="Manage the analysts who have access to this CRM.">
                    <form className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_0.8fr_auto]" onSubmit={handleCreateUser}>
                        <input type="text" required placeholder="Full Name" value={userForm.full_name} onChange={(event) => setUserForm((current) => ({ ...current, full_name: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                        <input type="email" required placeholder="Email Address" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                        <input type="password" required placeholder="Temporary Password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                        <button type="submit" disabled={savingUser} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">{savingUser ? 'Adding...' : 'Add Analyst'}</button>
                    </form>

                    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Name</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Email</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Created</th></tr></thead>
                            <tbody className="divide-y divide-gray-100 bg-white">{data.users.map((user) => <tr key={user.user_id}><td className="px-6 py-4 font-bold text-gray-900">{user.full_name || 'Unnamed user'}</td><td className="px-6 py-4 font-medium text-gray-500">{user.email}</td><td className="px-6 py-4"><span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 font-medium text-gray-500">{formatDateLabel(user.created_at)}</td></tr>)}</tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
