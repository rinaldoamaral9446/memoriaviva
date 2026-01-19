const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export { API_URL };

export const API_ENDPOINTS = {
    auth: {
        login: `${API_URL}/api/auth/login`,
        register: `${API_URL}/api/auth/register`,
        profile: `${API_URL}/api/auth/profile`,
    },
    memories: {
        my: `${API_URL}/api/memories/my`,
        all: `${API_URL}/api/memories`,
        create: `${API_URL}/api/memories`,
        update: (id) => `${API_URL}/api/memories/${id}`,
        delete: (id) => `${API_URL}/api/memories/${id}`,
        search: `${API_URL}/api/memories/search`,
    },
    ai: {
        process: `${API_URL}/api/ai/process`,
        base: `${API_URL}/api/ai`,
    },
    upload: {
        image: `${API_URL}/api/upload/image`,
        deleteImage: (filename) => `${API_URL}/api/upload/image/${filename}`,
    },
    organizations: {
        all: `${API_URL}/api/organizations`,
        byId: (id) => `${API_URL}/api/organizations/${id}`,
        bySlug: (slug) => `${API_URL}/api/organizations/slug/${slug}`,
    }
};
