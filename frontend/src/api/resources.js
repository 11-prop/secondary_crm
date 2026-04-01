import apiClient from "./client";

function extractMessage(payload) {
    return payload?.detail || payload?.message || "Request failed.";
}

export function normalizeApiError(error) {
    if (error?.response) {
        const payload = error.response.data;
        return {
            status: error.response.status,
            message: extractMessage(payload),
            isNetworkError: false,
        };
    }

    return {
        status: 0,
        message: "The API is unavailable right now. Check the backend service and API base URL.",
        isNetworkError: true,
    };
}

async function get(path, config = {}) {
    try {
        const response = await apiClient.get(path, config);
        return response.data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

async function post(path, data, config = {}) {
    try {
        const response = await apiClient.post(path, data, config);
        return response.data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

async function patch(path, data, config = {}) {
    try {
        const response = await apiClient.patch(path, data, config);
        return response.data;
    } catch (error) {
        throw normalizeApiError(error);
    }
}

function unwrapItems(payload) {
    return {
        items: payload?.data ?? [],
        meta: payload?.meta ?? null,
    };
}

function unwrapItem(payload) {
    return payload?.data ?? null;
}

export function resolveAssetUrl(path) {
    if (!path) {
        return null;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const apiRoot = apiClient.defaults.baseURL?.replace(/\/api\/?$/, "") || "";
    return `${apiRoot}${path}`;
}

export async function listCustomers(params = {}) {
    return unwrapItems(await get("/customers/", { params }));
}

export async function getCustomer(customerId) {
    return unwrapItem(await get(`/customers/${customerId}`));
}

export async function createCustomer(payload) {
    return unwrapItem(await post("/customers/", payload));
}

export async function updateCustomer(customerId, payload) {
    return unwrapItem(await patch(`/customers/${customerId}`, payload));
}

export async function listAgents(params = {}) {
    return unwrapItems(await get("/agents/", { params }));
}

export async function createAgent(payload) {
    return unwrapItem(await post("/agents/", payload));
}

export async function updateAgent(agentId, payload) {
    return unwrapItem(await patch(`/agents/${agentId}`, payload));
}

export async function listProperties(params = {}) {
    return unwrapItems(await get("/properties/", { params }));
}

export async function createProperty(payload) {
    return unwrapItem(await post("/properties/", payload));
}

export async function updateProperty(propertyId, payload) {
    return unwrapItem(await patch(`/properties/${propertyId}`, payload));
}

export async function listProjects(params = {}) {
    return unwrapItems(await get("/projects/", { params }));
}

export async function createProject(payload) {
    return unwrapItem(await post("/projects/", payload));
}

export async function updateProject(projectId, payload) {
    return unwrapItem(await patch(`/projects/${projectId}`, payload));
}

export async function createCommunity(projectId, payload) {
    return unwrapItem(await post(`/projects/${projectId}/communities`, payload));
}

export async function updateCommunity(projectId, communityId, payload) {
    return unwrapItem(await patch(`/projects/${projectId}/communities/${communityId}`, payload));
}

export async function listFloorPlans(params = {}) {
    return unwrapItems(await get("/floor_plans/", { params }));
}

export async function createFloorPlan(payload) {
    return unwrapItem(await post("/floor_plans/", payload));
}

export async function updateFloorPlan(planId, payload) {
    return unwrapItem(await patch(`/floor_plans/${planId}`, payload));
}

export async function listNotesByCustomer(customerId) {
    return unwrapItems(await get(`/interaction_notes/customer/${customerId}`));
}

export async function createNote(payload) {
    return unwrapItem(await post("/interaction_notes", payload));
}

export async function listTransactionsByProperty(propertyId) {
    return unwrapItems(await get(`/transactions/property/${propertyId}`));
}

export async function createTransaction(payload) {
    return unwrapItem(await post("/transactions", payload));
}

export async function uploadImage(folder, file) {
    const formData = new FormData();
    formData.append("file", file);
    const payload = await post(`/uploads/image?folder=${folder}`, formData);
    return payload?.data?.file_path ?? null;
}

export async function importSpreadsheet(file) {
    const formData = new FormData();
    formData.append("file", file);
    return unwrapItem(await post("/import_data/excel", formData));
}

export async function listUsers(params = {}) {
    return unwrapItems(await get("/users/", { params }));
}

export async function listPropertyAttributeDefinitions(params = {}) {
    return unwrapItems(await get("/property_attributes/", { params }));
}

export async function createPropertyAttributeDefinition(payload) {
    return unwrapItem(await post("/property_attributes/", payload));
}

export async function updatePropertyAttributeDefinition(attributeDefinitionId, payload) {
    return unwrapItem(await patch(`/property_attributes/${attributeDefinitionId}`, payload));
}

export async function createUser(payload) {
    return unwrapItem(await post("/users/", payload));
}

export async function updateUser(userId, payload) {
    return unwrapItem(await patch(`/users/${userId}`, payload));
}

export async function getCurrentUser() {
    return unwrapItem(await get("/users/me"));
}

export async function updateMyPassword(payload) {
    return unwrapItem(await patch("/users/me/password", payload));
}

export async function deactivateUser(userId) {
    return unwrapItem(await patch(`/users/${userId}/deactivate`, {}));
}
