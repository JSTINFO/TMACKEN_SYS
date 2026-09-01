import api from "./api";


// =====================================
// RÉCUPÉRER TOUS LES PAIEMENTS
// =====================================

export const getPaiements = async () => {

    const response = await api.get(
        "/paiements/"
    );

    return response.data;
};


// =====================================
// RÉCUPÉRER LES PAIEMENTS DÉTAILLÉS
// =====================================

export const getPaiementsDetails = async () => {

    const response = await api.get(
        "/paiements/details/"
    );

    return response.data;
};


// =====================================
// RÉCUPÉRER UN PAIEMENT
// =====================================

export const getPaiement = async (
    idPaiement
) => {

    const response = await api.get(
        `/paiements/${idPaiement}`
    );

    return response.data;
};


// =====================================
// CRÉER UN PAIEMENT
// =====================================

export const createPaiement = async (
    paiementData
) => {

    const response = await api.post(
        "/paiements/",
        paiementData
    );

    return response.data;
};