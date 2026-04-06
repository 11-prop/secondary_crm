import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, KeyRound, Loader2, MapPinned, Pencil, Search, ShieldCheck, SlidersHorizontal, Trash2, Upload, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AssetPreview from '../components/AssetPreview';

import Card from '../components/Card';
import {
    createCommunity,
    createFloorPlan,
    createProject,
    createPropertyAttributeDefinition,
    createUser,
    deactivateUser,
    getCurrentUser,
    importSpreadsheet,
    listFloorPlans,
    listProjects,
    listPropertyAttributeDefinitions,
    listUsers,
    resolveAssetUrl,
    updateCommunity,
    updateFloorPlan,
    updateMyPassword,
    updateProject,
    updatePropertyAttributeDefinition,
    updateUser,
    uploadImage,
} from '../api/resources';
import { formatDateLabel } from '../lib/formatters';

const emptyProjectForm = { project_name: '' };
const emptyCommunityForm = { project_id: '', community_name: '', file: null, existing_layout_plan_path: null };
const emptyPlanForm = { project_id: '', community_id: '', plan_name: '', number_of_rooms: '', square_footage: '', amenities: '', file: null, existing_floor_plan_image_path: null };
const emptyAttributeForm = { label: '', key: '', value_type: 'boolean', options: '', sort_order: '0', is_active: true };
const emptyUserForm = { full_name: '', email: '', password: '' };
const emptyPasswordForm = { current_password: '', new_password: '', confirm_password: '' };
const SETTINGS_TABS = ['account', 'users', 'import', 'assets'];

export default function Settings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(() => {
        const requestedTab = searchParams.get('tab');
        return SETTINGS_TABS.includes(requestedTab) ? requestedTab : 'account';
    });
    const [data, setData] = useState({ projects: [], plans: [], users: [], currentUser: null, attributeDefinitions: [] });
    const [feedback, setFeedback] = useState({ error: '', success: '' });
    const [isUploading, setIsUploading] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [projectForm, setProjectForm] = useState(emptyProjectForm);
    const [communityForm, setCommunityForm] = useState(emptyCommunityForm);
    const [planForm, setPlanForm] = useState(emptyPlanForm);
    const [attributeForm, setAttributeForm] = useState(emptyAttributeForm);
    const [userForm, setUserForm] = useState(emptyUserForm);
    const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
    const [projectSearch, setProjectSearch] = useState('');
    const [planSearch, setPlanSearch] = useState('');
    const [attributeSearch, setAttributeSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');
    const [savingProject, setSavingProject] = useState(false);
    const [savingCommunity, setSavingCommunity] = useState(false);
    const [savingPlan, setSavingPlan] = useState(false);
    const [savingAttribute, setSavingAttribute] = useState(false);
    const [savingUser, setSavingUser] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [deactivatingUserId, setDeactivatingUserId] = useState(null);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [editingCommunity, setEditingCommunity] = useState(null);
    const [editingPlanId, setEditingPlanId] = useState(null);
    const [editingAttributeId, setEditingAttributeId] = useState(null);
    const [editingUserId, setEditingUserId] = useState(null);
    const [expandedCommunityPreviewKey, setExpandedCommunityPreviewKey] = useState(null);
    const [expandedPlanPreviewId, setExpandedPlanPreviewId] = useState(null);

    useEffect(() => {
        loadSettingsData();
    }, []);

    useEffect(() => {
        const requestedTab = searchParams.get('tab');
        const nextTab = SETTINGS_TABS.includes(requestedTab) ? requestedTab : 'account';
        if (nextTab !== activeTab) {
            setActiveTab(nextTab);
        }
    }, [activeTab, searchParams]);

    function changeTab(nextTab) {
        setActiveTab(nextTab);
        const nextParams = new URLSearchParams(searchParams);
        if (nextTab === 'account') {
            nextParams.delete('tab');
        } else {
            nextParams.set('tab', nextTab);
        }
        setSearchParams(nextParams, { replace: true });
    }

    const editingProject = useMemo(
        () => data.projects.find((project) => project.project_id === editingProjectId) || null,
        [data.projects, editingProjectId],
    );

    const editingPlan = useMemo(
        () => data.plans.find((plan) => plan.plan_id === editingPlanId) || null,
        [data.plans, editingPlanId],
    );

    const editingCommunityRecord = useMemo(() => {
        if (!editingCommunity) {
            return null;
        }

        return getProjectCommunities(data.projects, editingCommunity.project_id).find((community) => community.community_id === editingCommunity.community_id) || null;
    }, [data.projects, editingCommunity]);

    const editingAttribute = useMemo(
        () => data.attributeDefinitions.find((definition) => definition.attribute_definition_id === editingAttributeId) || null,
        [data.attributeDefinitions, editingAttributeId],
    );

    const isCurrentUserAdmin = !!data.currentUser?.is_admin;
    const availablePlanCommunities = getProjectCommunities(data.projects, planForm.project_id);

    const filteredProjects = useMemo(() => {
        const search = projectSearch.trim().toLowerCase();
        return sortProjects(data.projects).filter((project) => {
            if (!search) {
                return true;
            }
            const communities = (project.communities || []).map((community) => community.community_name || '').join(' ');
            return `${project.project_name || ''} ${communities}`.toLowerCase().includes(search);
        });
    }, [data.projects, projectSearch]);

    const filteredPlans = useMemo(() => {
        const search = planSearch.trim().toLowerCase();
        return sortFloorPlans(data.plans).filter((plan) => {
            if (!search) {
                return true;
            }
            const projectName = getProjectName(data.projects, plan.project_id);
            const communityName = getCommunityName(data.projects, plan.project_id, plan.community_id);
            return `${plan.plan_name || ''} ${projectName} ${communityName} ${plan.amenities || ''} ${plan.number_of_rooms || ''} ${plan.square_footage || ''}`.toLowerCase().includes(search);
        });
    }, [data.plans, data.projects, planSearch]);

    const filteredUsers = useMemo(() => {
        const search = userSearch.trim().toLowerCase();
        return sortUsers(data.users).filter((user) => {
            if (!search) {
                return true;
            }
            const role = user.is_admin ? 'administrator' : 'analyst';
            const status = user.is_active ? 'active' : 'inactive';
            return `${user.full_name || ''} ${user.email || ''} ${role} ${status}`.toLowerCase().includes(search);
        });
    }, [data.users, userSearch]);

    const filteredAttributeDefinitions = useMemo(() => {
        const search = attributeSearch.trim().toLowerCase();
        return sortPropertyAttributeDefinitions(data.attributeDefinitions).filter((definition) => {
            if (!search) {
                return true;
            }
            const options = (definition.options || []).join(' ');
            const scope = definition.is_system ? 'system' : 'custom';
            return `${definition.label || ''} ${definition.key || ''} ${definition.value_type || ''} ${scope} ${options}`.toLowerCase().includes(search);
        });
    }, [data.attributeDefinitions, attributeSearch]);

    function showError(message) {
        setFeedback({ error: message, success: '' });
    }

    function showSuccess(message) {
        setFeedback({ error: '', success: message });
    }

    async function loadSettingsData() {
        const [projectsRes, plansRes, usersRes, currentUserRes, attributeDefinitionsRes] = await Promise.allSettled([
            listProjects({ limit: 500 }),
            listFloorPlans({ limit: 500 }),
            listUsers({ limit: 500 }),
            getCurrentUser(),
            listPropertyAttributeDefinitions({ limit: 500 }),
        ]);

        setData({
            projects: projectsRes.status === 'fulfilled' ? sortProjects(projectsRes.value.items) : [],
            plans: plansRes.status === 'fulfilled' ? sortFloorPlans(plansRes.value.items) : [],
            users: usersRes.status === 'fulfilled' ? sortUsers(usersRes.value.items) : [],
            currentUser: currentUserRes.status === 'fulfilled' ? currentUserRes.value : null,
            attributeDefinitions: attributeDefinitionsRes.status === 'fulfilled' ? sortPropertyAttributeDefinitions(attributeDefinitionsRes.value.items) : [],
        });

        const firstError = [projectsRes, plansRes, usersRes, currentUserRes, attributeDefinitionsRes].find((result) => result.status === 'rejected');
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
    async function handleSaveProject(event) {
        event.preventDefault();
        setSavingProject(true);
        try {
            const payload = { project_name: projectForm.project_name };
            const project = await createProject(payload);
            const hydratedProject = { ...project, communities: project.communities || [] };
            setData((current) => ({ ...current, projects: sortProjects([hydratedProject, ...current.projects]) }));
            setCommunityForm((current) => ({ ...current, project_id: String(project.project_id) }));
            setPlanForm((current) => ({ ...current, project_id: String(project.project_id), community_id: '' }));
            showSuccess(`Project "${project.project_name}" created. You can now add one or more communities under it.`);
            setProjectForm(emptyProjectForm);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingProject(false);
        }
    }

    async function handleSaveCommunity(event) {
        event.preventDefault();
        setSavingCommunity(true);
        try {
            const layout_plan_path = communityForm.file ? await uploadImage('projects', communityForm.file) : communityForm.existing_layout_plan_path;
            const community = await createCommunity(Number(communityForm.project_id), { community_name: communityForm.community_name, layout_plan_path });
            setData((current) => ({
                ...current,
                projects: current.projects.map((project) => (
                    project.project_id === community.project_id
                        ? { ...project, communities: [...(project.communities || []), community].sort((left, right) => left.community_name.localeCompare(right.community_name)) }
                        : project
                )),
            }));
            setPlanForm((current) => current.project_id === communityForm.project_id ? { ...current, community_id: String(community.community_id) } : current);
            showSuccess(`Community "${community.community_name}" added.`);
            setCommunityForm(emptyCommunityForm);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingCommunity(false);
        }
    }

    async function handleSavePlan(event) {
        event.preventDefault();
        setSavingPlan(true);
        try {
            const floor_plan_image_path = planForm.file ? await uploadImage('plans', planForm.file) : planForm.existing_floor_plan_image_path;
            const payload = {
                project_id: Number(planForm.project_id),
                community_id: planForm.community_id ? Number(planForm.community_id) : null,
                plan_name: planForm.plan_name,
                number_of_rooms: planForm.number_of_rooms ? Number(planForm.number_of_rooms) : null,
                square_footage: planForm.square_footage ? Number(planForm.square_footage) : null,
                amenities: planForm.amenities || null,
                floor_plan_image_path,
            };
            const plan = await createFloorPlan(payload);
            setData((current) => ({ ...current, plans: sortFloorPlans([plan, ...current.plans]) }));
            showSuccess(`Floor plan "${plan.plan_name}" created.`);
            setPlanForm(emptyPlanForm);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingPlan(false);
        }
    }

    async function handleSaveAttribute(event) {
        event.preventDefault();
        setSavingAttribute(true);
        try {
            const payload = {
                label: attributeForm.label.trim(),
                key: attributeForm.key.trim() || null,
                value_type: attributeForm.value_type,
                options: attributeForm.value_type === 'select' ? parseAttributeOptions(attributeForm.options) : [],
                sort_order: Number.isFinite(Number(attributeForm.sort_order)) ? Number(attributeForm.sort_order) : 0,
                is_active: attributeForm.is_active,
            };

            if (!payload.label) {
                throw new Error('Attribute label is required.');
            }

            const definition = await createPropertyAttributeDefinition(payload);
            setData((current) => ({
                ...current,
                attributeDefinitions: sortPropertyAttributeDefinitions([definition, ...current.attributeDefinitions]),
            }));
            showSuccess(`Property attribute "${definition.label}" created.`);

            setAttributeForm(emptyAttributeForm);
        } catch (error) {
            showError(error.message);
        } finally {
            setSavingAttribute(false);
        }
    }

    async function handleUpdateProjectDetails(projectId, formState) {
        setSavingProject(true);
        try {
            const project = await updateProject(projectId, { project_name: formState.project_name });
            const hydratedProject = {
                ...project,
                communities: project.communities || data.projects.find((item) => item.project_id === project.project_id)?.communities || [],
            };
            setData((current) => ({
                ...current,
                projects: sortProjects(current.projects.map((item) => (item.project_id === hydratedProject.project_id ? hydratedProject : item))),
            }));
            setEditingProjectId(null);
            showSuccess(`Project "${project.project_name}" updated.`);
            return { success: true };
        } catch (error) {
            showError(error.message);
            return { success: false, error: error.message };
        } finally {
            setSavingProject(false);
        }
    }

    async function handleUpdateCommunityDetails(target, formState) {
        if (!target) {
            return { success: false, error: 'Community not found.' };
        }

        setSavingCommunity(true);
        try {
            const layout_plan_path = formState.file ? await uploadImage('projects', formState.file) : formState.existing_layout_plan_path;
            const community = await updateCommunity(target.project_id, target.community_id, {
                community_name: formState.community_name,
                layout_plan_path,
            });
            setData((current) => ({
                ...current,
                projects: current.projects.map((project) => (
                    project.project_id === target.project_id
                        ? {
                            ...project,
                            communities: (project.communities || [])
                                .map((item) => (item.community_id === community.community_id ? community : item))
                                .sort((left, right) => left.community_name.localeCompare(right.community_name)),
                        }
                        : project
                )),
            }));
            setEditingCommunity(null);
            showSuccess(`Community "${community.community_name}" updated.`);
            return { success: true };
        } catch (error) {
            showError(error.message);
            return { success: false, error: error.message };
        } finally {
            setSavingCommunity(false);
        }
    }

    async function handleUpdatePlanDetails(planId, formState) {
        setSavingPlan(true);
        try {
            const floor_plan_image_path = formState.file ? await uploadImage('plans', formState.file) : formState.existing_floor_plan_image_path;
            const payload = {
                project_id: Number(formState.project_id),
                community_id: formState.community_id ? Number(formState.community_id) : null,
                plan_name: formState.plan_name,
                number_of_rooms: formState.number_of_rooms ? Number(formState.number_of_rooms) : null,
                square_footage: formState.square_footage ? Number(formState.square_footage) : null,
                amenities: formState.amenities || null,
                floor_plan_image_path,
            };
            const plan = await updateFloorPlan(planId, payload);
            setData((current) => ({
                ...current,
                plans: sortFloorPlans(current.plans.map((item) => (item.plan_id === plan.plan_id ? plan : item))),
            }));
            setEditingPlanId(null);
            showSuccess(`Floor plan "${plan.plan_name}" updated.`);
            return { success: true };
        } catch (error) {
            showError(error.message);
            return { success: false, error: error.message };
        } finally {
            setSavingPlan(false);
        }
    }

    async function handleUpdateAttributeDetails(attributeDefinitionId, formState) {
        setSavingAttribute(true);
        try {
            const payload = {
                label: formState.label.trim(),
                key: formState.key.trim() || null,
                value_type: formState.value_type,
                options: formState.value_type === 'select' ? parseAttributeOptions(formState.options) : [],
                sort_order: Number.isFinite(Number(formState.sort_order)) ? Number(formState.sort_order) : 0,
                is_active: formState.is_active,
            };

            if (!payload.label) {
                throw new Error('Attribute label is required.');
            }

            const definition = await updatePropertyAttributeDefinition(attributeDefinitionId, payload);
            setData((current) => ({
                ...current,
                attributeDefinitions: sortPropertyAttributeDefinitions(current.attributeDefinitions.map((item) => (
                    item.attribute_definition_id === definition.attribute_definition_id ? definition : item
                ))),
            }));
            setEditingAttributeId(null);
            showSuccess(`Property attribute "${definition.label}" updated.`);
            return { success: true };
        } catch (error) {
            showError(error.message);
            return { success: false, error: error.message };
        } finally {
            setSavingAttribute(false);
        }
    }

    function startEditingProject(project) {
        setEditingProjectId(project.project_id);
    }

    function startEditingCommunity(projectId, community) {
        setEditingCommunity({ project_id: projectId, community_id: community.community_id });
    }

    function startEditingPlan(plan) {
        setEditingPlanId(plan.plan_id);
    }

    function startEditingAttribute(definition) {
        setEditingAttributeId(definition.attribute_definition_id);
    }

    async function handleSaveUser(event) {
        event.preventDefault();
        setSavingUser(true);
        try {
            if (editingUserId) {
                const payload = {
                    full_name: userForm.full_name,
                    email: userForm.email,
                    is_admin: true,
                    is_active: true,
                };
                if (userForm.password) {
                    payload.password = userForm.password;
                }
                const user = await updateUser(editingUserId, payload);
                setData((current) => ({
                    ...current,
                    users: sortUsers(current.users.map((item) => (item.user_id === user.user_id ? user : item))),
                    currentUser: current.currentUser?.user_id === user.user_id ? user : current.currentUser,
                }));
                showSuccess(`Analyst "${user.full_name || user.email}" updated.`);
            } else {
                const payload = { ...userForm, is_admin: true, is_active: true };
                const user = await createUser(payload);
                setData((current) => ({ ...current, users: sortUsers([user, ...current.users]) }));
                showSuccess(`Analyst "${user.full_name || user.email}" added.`);
            }
            setUserForm(emptyUserForm);
            setEditingUserId(null);
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
                users: sortUsers(current.users.map((item) => (item.user_id === updatedUser.user_id ? updatedUser : item))),
            }));
            showSuccess(`"${updatedUser.full_name || updatedUser.email}" was deactivated.`);
        } catch (error) {
            showError(error.message);
        } finally {
            setDeactivatingUserId(null);
        }
    }

    function startEditingUser(user) {
        setEditingUserId(user.user_id);
        setUserForm({
            full_name: user.full_name || '',
            email: user.email || '',
            password: '',
        });
    }
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
                        onClick={() => changeTab(tab)}
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
                <div className="space-y-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <Card title="Add New Project" subtitle="Create the top-level development that will contain multiple communities.">
                            <form className="space-y-4" onSubmit={handleSaveProject}>
                                <input type="text" required placeholder="Project Name" value={projectForm.project_name} onChange={(event) => setProjectForm((current) => ({ ...current, project_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <button type="submit" disabled={savingProject} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-xl disabled:opacity-60">{savingProject ? 'Saving project...' : 'Create Project'}</button>
                            </form>
                        </Card>

                        <Card title="Add Community" subtitle="A single project can own multiple communities or clusters, each with its own layout asset.">
                            <form className="space-y-4" onSubmit={handleSaveCommunity}>
                                <select required value={communityForm.project_id} onChange={(event) => setCommunityForm((current) => ({ ...current, project_id: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select Project...</option>{data.projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>
                                <input type="text" required placeholder="Community Name" value={communityForm.community_name} onChange={(event) => setCommunityForm((current) => ({ ...current, community_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm font-semibold text-gray-600"><Upload className="h-4 w-4 text-brand-600" />Upload community layout asset (image or PDF, up to 20 MB)<input type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={(event) => setCommunityForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></label>
                                <AssetReference
                                    title="Community layout preview"
                                    assetPath={communityForm.existing_layout_plan_path}
                                    file={communityForm.file}
                                    emptyMessage="Upload a community layout to see its preview here."
                                />
                                <button type="submit" disabled={savingCommunity || data.projects.length === 0} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60"><MapPinned className="h-4 w-4" />{savingCommunity ? 'Saving community...' : 'Add Community'}</button>
                                {data.projects.length === 0 && <p className="text-sm font-medium text-gray-500">Create a project first, then add its communities here.</p>}
                            </form>
                        </Card>

                        <Card title="Add Floor Plan" subtitle="Attach a plan to a whole project or narrow it to one community.">
                            <form className="space-y-4" onSubmit={handleSavePlan}>
                                <select required value={planForm.project_id} onChange={(event) => setPlanForm((current) => ({ ...current, project_id: event.target.value, community_id: '' }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select Project...</option>{data.projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>
                                <select value={planForm.community_id} onChange={(event) => setPlanForm((current) => ({ ...current, community_id: event.target.value }))} disabled={!planForm.project_id} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none disabled:opacity-50"><option value="">All communities in this project</option>{availablePlanCommunities.map((community) => <option key={community.community_id} value={community.community_id}>{community.community_name}</option>)}</select>
                                <input type="text" required placeholder="Plan Name" value={planForm.plan_name} onChange={(event) => setPlanForm((current) => ({ ...current, plan_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="number" placeholder="Rooms" value={planForm.number_of_rooms} onChange={(event) => setPlanForm((current) => ({ ...current, number_of_rooms: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                    <input type="number" placeholder="Square footage" value={planForm.square_footage} onChange={(event) => setPlanForm((current) => ({ ...current, square_footage: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                </div>
                                <textarea rows={3} placeholder="Amenities" value={planForm.amenities} onChange={(event) => setPlanForm((current) => ({ ...current, amenities: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm font-semibold text-gray-600"><Upload className="h-4 w-4 text-brand-600" />Upload floor plan asset (image or PDF, up to 20 MB)<input type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={(event) => setPlanForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></label>
                                <AssetReference
                                    title="Floor plan preview"
                                    assetPath={planForm.existing_floor_plan_image_path}
                                    file={planForm.file}
                                    emptyMessage="Upload a floor plan image or PDF to preview it here."
                                />
                                <button type="submit" disabled={savingPlan} className="w-full rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-xl disabled:opacity-60">{savingPlan ? 'Saving floor plan...' : 'Create Floor Plan'}</button>
                            </form>
                        </Card>

                        <Card title="Add Property Attribute" subtitle="Create the flexible flags and values that appear in property forms.">
                            <form className="space-y-4" onSubmit={handleSaveAttribute}>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <input type="text" required placeholder="Label" value={attributeForm.label} onChange={(event) => setAttributeForm((current) => ({ ...current, label: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                    <input type="text" placeholder="Key (optional)" value={attributeForm.key} onChange={(event) => setAttributeForm((current) => ({ ...current, key: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                    <select value={attributeForm.value_type} onChange={(event) => setAttributeForm((current) => ({ ...current, value_type: event.target.value, options: event.target.value === 'select' ? current.options : '' }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none">
                                        <option value="boolean">Boolean flag</option>
                                        <option value="text">Text</option>
                                        <option value="number">Number</option>
                                        <option value="select">Select list</option>
                                    </select>
                                    <input type="number" placeholder="Display order" value={attributeForm.sort_order} onChange={(event) => setAttributeForm((current) => ({ ...current, sort_order: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                </div>

                                {attributeForm.value_type === 'select' && (
                                    <textarea rows={3} placeholder="Options, separated by commas or new lines" value={attributeForm.options} onChange={(event) => setAttributeForm((current) => ({ ...current, options: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                                )}

                                <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                                    <input type="checkbox" checked={attributeForm.is_active} onChange={(event) => setAttributeForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                                    Show this attribute in active property forms
                                </label>

                                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-600">
                                    Use boolean flags for simple yes or no fields, or use text, number, and select when a property needs richer metadata.
                                </div>

                                <button type="submit" disabled={savingAttribute} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-bold text-white shadow-xl disabled:opacity-60"><SlidersHorizontal className="h-4 w-4" />{savingAttribute ? 'Saving attribute...' : 'Create Attribute'}</button>
                            </form>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
                        <Card title="Projects" subtitle="Each project can hold multiple communities, and search now scales better as the directory grows.">
                            <div className="flex h-120 flex-col">
                                <SearchInput value={projectSearch} onChange={setProjectSearch} placeholder="Search projects or communities..." />
                                <p className="mt-3 text-xs font-semibold text-gray-500">Showing {filteredProjects.length} of {data.projects.length} projects.</p>
                                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                                    {filteredProjects.length === 0 ? (
                                        <p className="text-sm font-medium text-gray-500">{data.projects.length === 0 ? 'No projects have been created yet.' : 'No projects match this search.'}</p>
                                    ) : filteredProjects.map((project) => (
                                        <div key={project.project_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-bold text-gray-900">{project.project_name}</p>
                                                    <p className="mt-1 text-sm text-gray-500">{(project.communities || []).length} communities linked</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditingProject(project)}
                                                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </button>
                                            </div>

                                            <div className="mt-3 space-y-2">
                                                {(project.communities || []).length === 0 ? (
                                                    <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-400 ring-1 ring-gray-200">No communities yet</span>
                                                ) : (project.communities || []).map((community) => {
                                                    const communityPreviewKey = `${project.project_id}:${community.community_id}`;
                                                    const isPreviewExpanded = expandedCommunityPreviewKey === communityPreviewKey;

                                                    return (
                                                    <div key={community.community_id} className="rounded-xl bg-white px-3 py-3 ring-1 ring-gray-200">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <span className="text-sm font-bold text-gray-800">{community.community_name}</span>
                                                                <p className={`mt-1 text-xs font-bold ${community.layout_plan_path ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                                    {community.layout_plan_path ? 'Layout uploaded' : 'No layout yet'}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                {community.layout_plan_path && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setExpandedCommunityPreviewKey((current) => current === communityPreviewKey ? null : communityPreviewKey)}
                                                                        className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                                                    >
                                                                        {isPreviewExpanded ? 'Hide preview' : 'Preview'}
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => startEditingCommunity(project.project_id, community)}
                                                                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                    Edit
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {community.layout_plan_path && isPreviewExpanded && (
                                                            <AssetReference
                                                                title={`${community.community_name} layout`}
                                                                assetPath={community.layout_plan_path}
                                                                compact
                                                            />
                                                        )}
                                                    </div>
                                                )})}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        <Card title="Floor Plans" subtitle="The card stays fixed while the plan list scrolls, so long inventories stay easy to scan.">
                            <div className="flex h-120 flex-col">
                                <SearchInput value={planSearch} onChange={setPlanSearch} placeholder="Search plans, projects, or communities..." />
                                <p className="mt-3 text-xs font-semibold text-gray-500">Showing {filteredPlans.length} of {data.plans.length} floor plans.</p>
                                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                                    {filteredPlans.length === 0 ? (
                                        <p className="text-sm font-medium text-gray-500">{data.plans.length === 0 ? 'No floor plans have been created yet.' : 'No floor plans match this search.'}</p>
                                    ) : filteredPlans.map((plan) => {
                                        const communityName = getCommunityName(data.projects, plan.project_id, plan.community_id);
                                        const isPreviewExpanded = expandedPlanPreviewId === plan.plan_id;

                                        return (
                                            <div key={plan.plan_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0 flex-1">
                                                            <p className="font-bold text-gray-900">{plan.plan_name}</p>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {getProjectName(data.projects, plan.project_id)}
                                                            {' - '}
                                                            {communityName || 'All communities'}
                                                        </p>
                                                        <p className="mt-1 text-sm text-gray-500">{plan.number_of_rooms || 'N/A'} rooms - {plan.square_footage || 'N/A'} sqft</p>
                                                        <p className="mt-2 line-clamp-2 text-xs font-medium text-gray-500">{plan.amenities || 'No amenities listed yet.'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {plan.floor_plan_image_path && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setExpandedPlanPreviewId((current) => current === plan.plan_id ? null : plan.plan_id)}
                                                                className="text-xs font-bold text-gray-500 hover:text-gray-700"
                                                            >
                                                                {isPreviewExpanded ? 'Hide preview' : 'Preview'}
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => startEditingPlan(plan)}
                                                            className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                            Edit
                                                        </button>
                                                    </div>
                                                </div>
                                                {plan.floor_plan_image_path && isPreviewExpanded && (
                                                    <AssetReference
                                                        title={plan.plan_name}
                                                        assetPath={plan.floor_plan_image_path}
                                                        compact
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>

                        <Card title="Property Attributes" subtitle="Core property identity stays fixed in the schema; this list controls the configurable flags and custom values.">
                            <div className="flex h-120 flex-col">
                                <SearchInput value={attributeSearch} onChange={setAttributeSearch} placeholder="Search labels, keys, types, or options..." />
                                <p className="mt-3 text-xs font-semibold text-gray-500">Showing {filteredAttributeDefinitions.length} of {data.attributeDefinitions.length} attributes.</p>
                                <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
                                    {filteredAttributeDefinitions.length === 0 ? (
                                        <p className="text-sm font-medium text-gray-500">{data.attributeDefinitions.length === 0 ? 'No configurable attributes have been created yet.' : 'No property attributes match this search.'}</p>
                                    ) : filteredAttributeDefinitions.map((definition) => (
                                        <div key={definition.attribute_definition_id} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="font-bold text-gray-900">{definition.label}</p>
                                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${definition.is_system ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100' : 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'}`}>{definition.is_system ? 'System' : 'Custom'}</span>
                                                        <span className="inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 ring-1 ring-gray-200">{definition.value_type}</span>
                                                        {!definition.is_active && <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Inactive</span>}
                                                    </div>
                                                    <p className="mt-1 text-xs font-medium text-gray-500">{definition.key}</p>
                                                    {definition.value_type === 'select' && definition.options?.length > 0 && (
                                                        <p className="mt-2 text-xs font-medium text-gray-500">Options: {definition.options.join(', ')}</p>
                                                    )}
                                                    <p className="mt-2 text-xs font-medium text-gray-400">Sort order {definition.sort_order} • Created {formatDateLabel(definition.created_at)}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => startEditingAttribute(definition)}
                                                    className="inline-flex items-center gap-1 text-sm font-bold text-brand-600 hover:text-brand-800"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                    Edit
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
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
                            <form className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1fr_0.8fr_auto_auto]" onSubmit={handleSaveUser} autoComplete="off">
                                <input type="text" required name="new-user-full-name" autoComplete="off" placeholder="Full Name" value={userForm.full_name} onChange={(event) => setUserForm((current) => ({ ...current, full_name: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="email" required name="new-user-email" autoComplete="off" placeholder="Email Address" value={userForm.email} onChange={(event) => setUserForm((current) => ({ ...current, email: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <input type="password" required={!editingUserId} name="new-user-password" autoComplete="new-password" placeholder={editingUserId ? 'Set a new password (optional)' : 'Temporary Password'} value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                                <button type="submit" disabled={savingUser} className="rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">{savingUser ? 'Saving...' : editingUserId ? 'Save Analyst' : 'Add Analyst'}</button>
                                {editingUserId && <button type="button" onClick={() => { setEditingUserId(null); setUserForm(emptyUserForm); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-gray-600"><X className="h-4 w-4" />Cancel</button>}
                            </form>

                            <div className="mt-6 space-y-4">
                                <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search analysts, emails, roles, or status..." />
                                <p className="text-xs font-semibold text-gray-500">Showing {filteredUsers.length} of {data.users.length} users.</p>
                                <div className="overflow-hidden rounded-2xl border border-gray-100">
                                    <div className="max-h-120 overflow-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="sticky top-0 z-10 border-b border-gray-100 bg-gray-50"><tr><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Name</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Email</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Role</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th><th className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Created</th><th className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th></tr></thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {filteredUsers.length === 0 ? (
                                                    <tr><td className="px-6 py-6 text-sm font-medium text-gray-500" colSpan={6}>{data.users.length === 0 ? 'No user accounts have been created yet.' : 'No users match this search.'}</td></tr>
                                                ) : filteredUsers.map((user) => {
                                                    const isCurrentUser = user.user_id === data.currentUser?.user_id;

                                                    return (
                                                        <tr key={user.user_id}>
                                                            <td className="px-6 py-4 font-bold text-gray-900">{user.full_name || 'Unnamed user'}</td>
                                                            <td className="px-6 py-4 font-medium text-gray-500">{user.email}</td>
                                                            <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${user.is_admin ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-100' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}><ShieldCheck className="h-3.5 w-3.5" />{user.is_admin ? 'Administrator' : 'Analyst'}</span></td>
                                                            <td className="px-6 py-4"><span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                                                            <td className="px-6 py-4 font-medium text-gray-500">{formatDateLabel(user.created_at)}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-3">
                                                                    <button type="button" onClick={() => startEditingUser(user)} className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-800"><Pencil className="h-3.5 w-3.5" />Edit</button>
                                                                    {isCurrentUser ? (
                                                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Current user</span>
                                                                    ) : user.is_active ? (
                                                                        <button type="button" disabled={deactivatingUserId === user.user_id} onClick={() => handleDeactivateUser(user)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-60"><Trash2 className="h-3.5 w-3.5" />{deactivatingUserId === user.user_id ? 'Deactivating...' : 'Deactivate'}</button>
                                                                    ) : (
                                                                        <span className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Soft deleted</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            )}

            <ProjectEditDrawer
                isOpen={!!editingProject}
                project={editingProject}
                onClose={() => setEditingProjectId(null)}
                onSubmit={handleUpdateProjectDetails}
                isSubmitting={savingProject}
            />

            <CommunityEditDrawer
                isOpen={!!editingCommunityRecord}
                projectId={editingCommunity?.project_id || null}
                projects={data.projects}
                community={editingCommunityRecord}
                onClose={() => setEditingCommunity(null)}
                onSubmit={handleUpdateCommunityDetails}
                isSubmitting={savingCommunity}
            />

            <FloorPlanEditDrawer
                isOpen={!!editingPlan}
                plan={editingPlan}
                projects={data.projects}
                onClose={() => setEditingPlanId(null)}
                onSubmit={handleUpdatePlanDetails}
                isSubmitting={savingPlan}
            />

            <PropertyAttributeEditDrawer
                isOpen={!!editingAttribute}
                definition={editingAttribute}
                onClose={() => setEditingAttributeId(null)}
                onSubmit={handleUpdateAttributeDetails}
                isSubmitting={savingAttribute}
            />
        </div>
    );
}

function SearchInput({ value, onChange, placeholder }) {
    return (
        <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm outline-none"
            />
        </div>
    );
}

function SettingsEditDrawer({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-lg' }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className={`absolute inset-y-0 right-0 flex w-full ${maxWidth} flex-col bg-white shadow-2xl`}>
                <div className="flex items-center justify-between border-b border-gray-100 bg-brand-900 p-6 text-white">
                    <div>
                        <h2 className="text-lg font-bold uppercase tracking-tight">{title}</h2>
                        {subtitle && <p className="mt-1 text-sm font-medium text-white/70">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
            </div>
        </div>
    );
}

function ProjectEditDrawer({ isOpen, project, onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState(emptyProjectForm);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen && project) {
            setForm({ project_name: project.project_name || '' });
            setSubmitError('');
        }
    }, [isOpen, project]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!project) {
            return;
        }

        const result = await onSubmit(project.project_id, form);
        if (!result?.success) {
            setSubmitError(result?.error || 'Unable to update this project.');
            return;
        }

        onClose();
    }

    return (
        <SettingsEditDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Project"
            subtitle="Rename the project without changing the creation form on the main screen."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    required
                    placeholder="Project Name"
                    value={form.project_name}
                    onChange={(event) => setForm({ project_name: event.target.value })}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"
                />
                {submitError && <DrawerError message={submitError} />}
                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">
                    {isSubmitting ? 'Saving project...' : 'Save Project'}
                </button>
            </form>
        </SettingsEditDrawer>
    );
}

function CommunityEditDrawer({ isOpen, projectId, projects, community, onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState(emptyCommunityForm);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen && community) {
            setForm({
                project_id: String(projectId || ''),
                community_name: community.community_name || '',
                file: null,
                existing_layout_plan_path: community.layout_plan_path || null,
            });
            setSubmitError('');
        }
    }, [community, isOpen, projectId]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!community || !projectId) {
            return;
        }

        const result = await onSubmit({ project_id: projectId, community_id: community.community_id }, form);
        if (!result?.success) {
            setSubmitError(result?.error || 'Unable to update this community.');
            return;
        }

        onClose();
    }

    return (
        <SettingsEditDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Community"
            subtitle="Review the saved layout asset and replace it only if needed."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Project</p>
                    <p className="mt-2 text-sm font-bold text-gray-900">{getProjectName(projects, projectId)}</p>
                </div>
                <input
                    type="text"
                    required
                    placeholder="Community Name"
                    value={form.community_name}
                    onChange={(event) => setForm((current) => ({ ...current, community_name: event.target.value }))}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"
                />
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm font-semibold text-gray-600">
                    <Upload className="h-4 w-4 text-brand-600" />
                    Replace community layout asset (image or PDF, up to 20 MB)
                    <input
                        type="file"
                        accept="image/*,.pdf,application/pdf"
                        className="hidden"
                        onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                    />
                </label>
                <AssetReference
                    title="Community layout preview"
                    assetPath={form.existing_layout_plan_path}
                    file={form.file}
                    emptyMessage="Upload a community layout to see its preview here."
                />
                {submitError && <DrawerError message={submitError} />}
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">
                    <MapPinned className="h-4 w-4" />
                    {isSubmitting ? 'Saving community...' : 'Save Community'}
                </button>
            </form>
        </SettingsEditDrawer>
    );
}

function FloorPlanEditDrawer({ isOpen, plan, projects, onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState(emptyPlanForm);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen && plan) {
            setForm({
                project_id: String(plan.project_id || ''),
                community_id: plan.community_id ? String(plan.community_id) : '',
                plan_name: plan.plan_name || '',
                number_of_rooms: plan.number_of_rooms ?? '',
                square_footage: plan.square_footage ?? '',
                amenities: plan.amenities || '',
                file: null,
                existing_floor_plan_image_path: plan.floor_plan_image_path || null,
            });
            setSubmitError('');
        }
    }, [isOpen, plan]);

    const availableCommunities = getProjectCommunities(projects, form.project_id);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!plan) {
            return;
        }

        const result = await onSubmit(plan.plan_id, form);
        if (!result?.success) {
            setSubmitError(result?.error || 'Unable to update this floor plan.');
            return;
        }

        onClose();
    }

    return (
        <SettingsEditDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Floor Plan"
            subtitle="Cross-check the existing floor plan asset and update the plan details without creating a duplicate."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <select required value={form.project_id} onChange={(event) => setForm((current) => ({ ...current, project_id: event.target.value, community_id: '' }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none"><option value="">Select Project...</option>{projects.map((project) => <option key={project.project_id} value={project.project_id}>{project.project_name}</option>)}</select>
                <select value={form.community_id} onChange={(event) => setForm((current) => ({ ...current, community_id: event.target.value }))} disabled={!form.project_id} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none disabled:opacity-50"><option value="">All communities in this project</option>{availableCommunities.map((community) => <option key={community.community_id} value={community.community_id}>{community.community_name}</option>)}</select>
                <input type="text" required placeholder="Plan Name" value={form.plan_name} onChange={(event) => setForm((current) => ({ ...current, plan_name: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Rooms" value={form.number_of_rooms} onChange={(event) => setForm((current) => ({ ...current, number_of_rooms: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                    <input type="number" placeholder="Square footage" value={form.square_footage} onChange={(event) => setForm((current) => ({ ...current, square_footage: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                </div>
                <textarea rows={3} placeholder="Amenities" value={form.amenities} onChange={(event) => setForm((current) => ({ ...current, amenities: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-gray-200 p-4 text-sm font-semibold text-gray-600"><Upload className="h-4 w-4 text-brand-600" />Replace floor plan asset (image or PDF, up to 20 MB)<input type="file" accept="image/*,.pdf,application/pdf" className="hidden" onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} /></label>
                <AssetReference
                    title="Floor plan preview"
                    assetPath={form.existing_floor_plan_image_path}
                    file={form.file}
                    emptyMessage="Upload a floor plan image or PDF to preview it here."
                />
                {submitError && <DrawerError message={submitError} />}
                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">
                    {isSubmitting ? 'Saving floor plan...' : 'Save Floor Plan'}
                </button>
            </form>
        </SettingsEditDrawer>
    );
}

function PropertyAttributeEditDrawer({ isOpen, definition, onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState(emptyAttributeForm);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        if (isOpen && definition) {
            setForm({
                label: definition.label || '',
                key: definition.key || '',
                value_type: definition.value_type || 'boolean',
                options: (definition.options || []).join(', '),
                sort_order: String(definition.sort_order ?? 0),
                is_active: !!definition.is_active,
            });
            setSubmitError('');
        }
    }, [definition, isOpen]);

    async function handleSubmit(event) {
        event.preventDefault();
        if (!definition) {
            return;
        }

        const result = await onSubmit(definition.attribute_definition_id, form);
        if (!result?.success) {
            setSubmitError(result?.error || 'Unable to update this property attribute.');
            return;
        }

        onClose();
    }

    return (
        <SettingsEditDrawer
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Property Attribute"
            subtitle="Update the configurable field without changing the separate add form."
        >
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="text" required placeholder="Label" value={form.label} onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                    <input type="text" placeholder="Key (optional)" value={form.key} onChange={(event) => setForm((current) => ({ ...current, key: event.target.value }))} disabled={!!definition?.is_system} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none disabled:opacity-50" />
                    <select value={form.value_type} onChange={(event) => setForm((current) => ({ ...current, value_type: event.target.value, options: event.target.value === 'select' ? current.options : '' }))} disabled={!!definition?.is_system} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none disabled:opacity-50">
                        <option value="boolean">Boolean flag</option>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="select">Select list</option>
                    </select>
                    <input type="number" placeholder="Display order" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none" />
                </div>

                {form.value_type === 'select' && (
                    <textarea rows={3} placeholder="Options, separated by commas or new lines" value={form.options} onChange={(event) => setForm((current) => ({ ...current, options: event.target.value }))} className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none" />
                )}

                <label className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                    <input type="checkbox" checked={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                    Show this attribute in active property forms
                </label>

                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm font-medium text-gray-600">
                    {definition?.is_system
                        ? 'This is a system-backed attribute migrated from the old fixed-flag model. Its key and value type stay locked so existing data remains stable.'
                        : 'Use boolean flags for simple yes or no fields, or use text, number, and select when a property needs richer metadata.'}
                </div>

                {submitError && <DrawerError message={submitError} />}
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-bold text-white shadow-lg shadow-brand-500/20 disabled:opacity-60">
                    <SlidersHorizontal className="h-4 w-4" />
                    {isSubmitting ? 'Saving attribute...' : 'Save Attribute'}
                </button>
            </form>
        </SettingsEditDrawer>
    );
}

function DrawerError({ message }) {
    return (
        <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-semibold text-red-700">
            {message}
        </div>
    );
}

function AssetReference({ title, assetPath = null, file = null, emptyMessage = 'No asset uploaded yet.', compact = false }) {
    const [localPreviewUrl, setLocalPreviewUrl] = useState(null);

    useEffect(() => {
        if (!file) {
            setLocalPreviewUrl(null);
            return undefined;
        }

        const objectUrl = URL.createObjectURL(file);
        setLocalPreviewUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    const previewSource = file ? localPreviewUrl : resolveAssetUrl(assetPath);
    if (file && !localPreviewUrl) {
        return (
            <div className={`rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 ${compact ? 'mt-3' : ''}`}>
                Preparing preview...
            </div>
        );
    }

    if (!previewSource && !file && !assetPath) {
        return (
            <div className={`rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 ${compact ? 'mt-3' : ''}`}>
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className={compact ? 'mt-3 max-w-sm space-y-2' : 'space-y-3'}>
            <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{title}</p>
                <span className="text-xs font-semibold text-gray-500">{file ? file.name : 'Saved asset'}</span>
            </div>
            <AssetPreview
                title={title}
                src={previewSource}
                fileName={file?.name || assetPath || ''}
                mimeType={file?.type || ''}
            />
        </div>
    );
}

function InfoStat({ label, value }) {
    return <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{label}</p><p className="mt-2 text-sm font-bold text-gray-900">{value}</p></div>;
}

function getProjectCommunities(projects, projectId) {
    const normalizedProjectId = Number(projectId);
    if (!normalizedProjectId) {
        return [];
    }

    return projects.find((project) => project.project_id === normalizedProjectId)?.communities || [];
}

function getProjectName(projects, projectId) {
    return projects.find((project) => project.project_id === projectId)?.project_name || 'Unknown project';
}

function getCommunityName(projects, projectId, communityId) {
    if (!communityId) {
        return '';
    }

    return getProjectCommunities(projects, projectId).find((community) => community.community_id === communityId)?.community_name || '';
}

function sortProjects(projects) {
    return [...projects].sort((left, right) => (left.project_name || '').localeCompare(right.project_name || ''));
}

function sortFloorPlans(plans) {
    return [...plans].sort((left, right) => (left.plan_name || '').localeCompare(right.plan_name || ''));
}

function sortUsers(users) {
    return [...users].sort((left, right) => {
        if (left.is_active !== right.is_active) {
            return left.is_active ? -1 : 1;
        }
        return (left.full_name || left.email || '').localeCompare(right.full_name || right.email || '');
    });
}

function sortPropertyAttributeDefinitions(definitions) {
    return [...definitions].sort((left, right) => {
        if ((left.sort_order ?? 0) !== (right.sort_order ?? 0)) {
            return (left.sort_order ?? 0) - (right.sort_order ?? 0);
        }
        return (left.label || '').localeCompare(right.label || '');
    });
}

function parseAttributeOptions(value) {
    const normalized = [];
    const seen = new Set();

    for (const option of String(value || '').split(/[\n,]/)) {
        const trimmed = option.trim();
        if (!trimmed) {
            continue;
        }
        const lowered = trimmed.toLowerCase();
        if (seen.has(lowered)) {
            continue;
        }
        normalized.push(trimmed);
        seen.add(lowered);
    }

    return normalized;
}
