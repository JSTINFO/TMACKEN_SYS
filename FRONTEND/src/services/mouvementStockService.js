import api from "./api";


// ==========================================
// CRÉER UN MOUVEMENT
// ==========================================

export const createMouvementStock = async (
    mouvementData
) => {

    const response = await api.post(
        "/mouvements-stock/",
        mouvementData
    );

    return response.data;
};


// ==========================================
// RÉCUPÉRER LES MOUVEMENTS
// ==========================================

export const getMouvementsStock = async () => {

    const response = await api.get(
        "/mouvements-stock/"
    );

    return response.data;
};


// ==========================================
// RÉCUPÉRER UN MOUVEMENT
// ==========================================

export const getMouvementStock = async (
    idMouvement
) => {

    const response = await api.get(
        `/mouvements-stock/${idMouvement}`
    );

    return response.data;
};