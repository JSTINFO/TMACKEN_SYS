import api from "./api";

// ==========================================
// RÉCUPÉRER LES DONNÉES DU DASHBOARD
// ==========================================

export const getDashboard = async () => {
    const response = await api.get("/dashboard/");
    return response.data;
};