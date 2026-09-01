import api from "./api";


// ==========================================
// RÉCUPÉRER TOUTES LES VENTES
// ==========================================

export const getVentes = async () => {

    const response = await api.get(
        "/ventes/"
    );

    return response.data;
};


// ==========================================
// RÉCUPÉRER UNE VENTE COMPLÈTE
// ==========================================

export const getVente = async (
    idVente
) => {

    const response = await api.get(
        `/ventes/${idVente}`
    );

    return response.data;
};


// ==========================================
// CRÉER UNE VENTE
// ==========================================

export const createVente = async (
    venteData
) => {

    const response = await api.post(
        "/ventes/",
        venteData
    );

    return response.data;
};


// ==========================================
// MODIFIER LE STATUT
// ==========================================

export const updateVente = async (
    idVente,
    venteData
) => {

    const response = await api.put(
        `/ventes/${idVente}`,
        venteData
    );

    return response.data;
};