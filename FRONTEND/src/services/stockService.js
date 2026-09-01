import api from "./api";


// ==========================================
// RÉCUPÉRER LE STOCK
// ==========================================

export const getStocks = async () => {

    const response = await api.get("/stock/");

    return response.data;
};


// ==========================================
// RÉCUPÉRER LES ALERTES
// ==========================================

export const getAlertesStock = async () => {

    const response = await api.get("/stock/alertes");

    return response.data;
};