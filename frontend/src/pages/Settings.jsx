import { useEffect, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, KeyRound, Loader2, ShieldCheck, Trash2, Upload } from 'lucide-react';

import Card from '../components/Card';
import {
    createFloorPlan,
    createProject,
    createUser,
    deactivateUser,
    getCurrentUser,
    importSpreadsheet,
    listFloorPlans,
    listProjects,
    listUsers,
    updateMyPassword,
    uploadImage,
} from '../api/resources';
import { formatDateLabel } from '../lib/formatters';

const emptyProjectForm = { project_name: '', neighborhood_name: '', file: null };
const emptyPlanForm = { project_id: '', plan_name: '', number_of_rooms: '', square_footage: '', amenities: '', file: null };
const emptyUserForm = { full_name: '', email: '', password: '' };
const emptyPasswordForm = { current_password: '', new_password: '', confirm_password: '' };

export default function Settings() {
    const [activeTab, setActiveTab] = useState('account');
    const [data, setData] = useState({ projects: [], plans: [], users: [], currentUser: null });
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [projectForm, setProjectForm] = useState(emptyProjectForm);
    const [planForm, setPlanForm] = useState(emptyPlanForm);
    const [userForm, setUserForm] = useState(emptyUserForm);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [savingProject, setSavingProject] = useState(false);
    const [savingPlan, setSavingPlan] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [deactivatingUserId, setDeactivatingUserId] = useState(null);

    useEffect(() => {
        loadSettingsData();
    }, []);

    function showError(message) {
        setFeedback({ error: message, success: '' });
    }

    function showSuccess(message) {
        setFeedback({ error: '', success: message });
    }

    async function loadSettingsData() {
        const [projectsRes, plansRes, usersRes, currentUserRes] = await Promise.allSettled([
            listProjects(),
            listFloorPlans(),
            listUsers(),
            getCurrentUser(),
        ]);

        setData({
            projects: projectsRes.status === 'fulfilled' ? projectsRes.value.items : [],
            plans: plansRes.status === 'fulfilled' ? plansRes.value.items : [],
            users: usersRes.status === 'fulfilled' ? usersRes.value.items : [],
            currentUser: currentUserRes.status === 'fulfilled' ? currentUserRes.value : null,
        });

        const firstError = [projectsRes, plansRes, usersRes, currentUserRes].find((result) => result.status === 'rejected');
        if (firstError?.status === 'rejected') {
            showError(firstError.reason.message);
        } else {
            setFeedback({ error: '', success: '' });
        }
    }

    async function handleImportFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setIsUploading(true);
        try {
            const result = await importSpreadsheet(file);
            setImportResult(result);
            showSuccess(`Import complete: ${result.customers_added} customers and ${result.properties_added} properties added.`);
        } catch (error) {
            showError(error.message);
        } finally {
            setIsUploading(false);
        }
    }

    async function handleCreateProject(event) {
        event.preventDefault();
        setSavingProject(true);
        try {
            const layout_plan_path = projectForm.file ? await uploadImage('projects', projectForm.file) : null;
            const payload = { project_name: projectForm.project_name, neighborhood_name: projectForm.neighborhood_name || null, layout_plan_path };
            const project = await createProject(payload);
            setData((current) => ({ ...current, projects: [project, ...current.projects] }));
            setProjectForm(emptyProjectForm);
            showSuccess(`Project "${project.project_name}" created.`);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingProject(false);
        }
    }

    async function handleCreatePlan(event) {
        event.preventDefault();
        setSavingPlan(true);
        try {
            const floor_plan_image_path = planForm.file ? await uploadImage('plans', planForm.file) : null;
            const payload = {
                project_id: Number(planForm.project_id),
                plan_name: planForm.plan_name,
                number_of_rooms: planForm.number_of_rooms ? Number(planForm.number_of_rooms) : null,
                square_footage: planForm.square_footage ? Number(planForm.square_footage) : null,
                amenities: planForm.amenities || null,
                floor_plan_image_path,
            };
            const plan = await createFloorPlan(payload);
            setData((current) => ({ ...current, plans: [plan, ...current.plans] }));
            setPlanForm(emptyPlanForm);
            showSuccess(`Floor plan "${plan.plan_name}" created.`);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingPlan(false);
        }
    }

    async function handleCreateUser(event) {
        event.preventDefault();
        setSavingUser(true);
        try {
            const payload = { ...userForm, is_admin: true, is_active: true };
            const user = await createUser(payload);
            setData((current) => ({ ...current, users: [user, ...current.users] }));
            setUserForm(emptyUserForm);
            showSuccess(`Analyst "${user.full_name || user.email}" added.`);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingUser(false);
        }
    }

    async function handleUpdatePassword(event) {
        event.preventDefault();

        if (passwordForm.new_password !== passwordForm.confirm_password) {
            showError('New password and confirmation must match.');
            return;
        }

        setSavingPassword(true);
        try {
            const user = await updateMyPassword({
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
            });
            setData((current) => ({ ...current, currentUser: user }));
            setPasswordForm(emptyPasswordForm);
            showSuccess('Your password was updated successfully.');
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingPassword(false);
        }
    }

    async function handleDeactivateUser(user) {
        if (!user?.is_active) {
            return;
        }

        if (!window.confirm(`Deactivate ${user.full_name || user.email}? They will no longer be able to sign in.`)) {
            return;
        }

        setDeactivatingUserId(user.user_id);
        try {
            const updatedUser = await deactivateUser(user.user_id);
            setData((current) => ({
                ...current,
                users: current.users.map((item) => (item.user_id === updatedUser.user_id ? updatedUser : item)),
            }));
            showSuccess(`"${updatedUser.full_name || updatedUser.email}" was deactivated.`);
        } catch (error) {
            showError(error.message);
        } finally {
            setDeactivatingUserId(null);
        }
    }

    const isCurrentUserAdmin = !!data.currentUser?.is_admin;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-black tracking-tight text-gray-900">System Management</h1>
                <p className="mt-1 text-gray-500">Configure imports, maintain visual assets, and manage analyst access.</p>
            </div>

            {feedback.error && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{feedback.error}</div>}

            {feedback.success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{feedback.success}</div>}

            <div className="flex gap-2 border-b border-gray-200">
                {[
                    ['account', 'My Account'],
                    ['users', 'Analyst Accounts'],
                    ['import', 'Bulk Data Import'],
                    ['assets', 'Project Assets'],
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

            {activeTab === 'account' && (
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-[0.8fr_1.2fr]">
                    <Card title="Signed-in Account" subtitle="Review your profile and current access status.">
                        {!data.currentUser ? (
                            <p className="text-sm font-medium text-gray-500">Unable to load the current user profile.</p>
                        ) : (
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.3em] text-brand-600">Analyst</p>
                                    <h2 className="mt-2 text-2xl font-black text-gray-900">{data.currentUser.full_name || 'Unnamed user'}</h2>
                                    <p className="mt-1 text-sm font-medium text-gray-500">{data.currentUser.email}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <InfoStat label="Status" value={data.currentUser.is_active ? 'Active' : 'Inactive'} />
                                    <InfoStat label="Role" value={data.currentUser.is_admin ? 'Administrator' : 'Analyst'} />
                                    <InfoStat label="Created" value={formatDateLabel(data.currentUser.created_at)} />
                                    <InfoStat label="User ID" value={String(data.currentUser.user_id)} />
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card title="Change Password" subtitle="Update your own password without relying on another admin.">
                        <form className="space-y-4" onSubmit={handleUpdatePassword} autoComplete="off">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <input type="password" required name="current-password" autoComplete="current-password" placeholder="Current password" value={passwordForm.current_password} onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="password" required name="new-password" autoComplete="new-password" placeholder="New password" value={passwordForm.new_password} onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="password" required name="confirm-new-password" autoComplete="new-password" placeholder="Confirm new password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                            </div>

                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-600">
                                Your current session stays active after the change. Future logins will use the new password.
                            </div>

                            <button type="submit" disabled={savingPassword || !data.currentUser} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">
                                <KeyRound className="h-4 w-4" />
                                {savingPassword ? 'Updating password...' : 'Update Password'}
                            </button>
                        </form>
                    </Card>
                </div>
            )}

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
                    {!isCurrentUserAdmin ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
                            Analyst account management requires an administrator account.
                        </div>
                    ) : (
                        <>
                            <form className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_0.8fr_auto]" onSubmit={handleCreateUser} autoComplete="off">
                                <input type="text" required name="new-user-full-name" autoComplete="off" placeholder="Full Name" value={userForm.full_name} onChange={(event) => setUserForm((current) => ({ ...current, full_name: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="email" required name="new-user-email" autoComplete="off" placeholder="Email Address" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="password" required name="new-user-password" autoComplete="new-password" placeholder="Temporary Password" value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <button type="submit" disabled={savingUser} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">{savingUser ? 'Adding...' : 'Add Analyst'}</button>
                            </form>

                            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Name</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Email</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Role</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Created</th><th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th></tr></thead>
                                    <tbody className="divide-y divide-gray-100 bg-white">
                                        {data.users.length === 0 ? (
                                            <tr><td className="px-6 py-6 text-sm font-medium text-gray-500" colSpan={6}>No user accounts have been created yet.</td></tr>
                                        ) : data.users.map((user) => {
                                            const isCurrentUser = user.user_id === data.currentUser?.user_id;
                                            return <tr key={user.user_id}><td className="px-6 py-4 font-bold text-gray-900">{user.full_name || 'Unnamed user'}</td><td className="px-6 py-4 font-medium text-gray-500">{user.email}</td><td className="px-6 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${user.is_admin ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}><ShieldCheck className="h-3.5 w-3.5" />{user.is_admin ? 'Administrator' : 'Analyst'}</span></td><td className="px-6 py-4"><span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-6 py-4 font-medium text-gray-500">{formatDateLabel(user.created_at)}</td><td className="px-6 py-4 text-right">{isCurrentUser ? <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Current user</span> : user.is_active ? <button type="button" disabled={deactivatingUserId === user.user_id} onClick={() => handleDeactivateUser(user)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />{deactivatingUserId === user.user_id ? 'Deactivating...' : 'Deactivate'}</button> : <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Soft deleted</span>}</td></tr>;
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </Card>
            )}
        </div>
    );
}

function InfoStat({ label, value }) {
    return <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{label}</p><p className="mt-2 text-sm font-bold text-gray-900">{value}</p></div>;
}
