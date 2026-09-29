import api from "./api";


// ==========================================
// RÉCUPÉRER TOUTES LES PROFORMAS
// ==========================================

export const getProformas = async () => {

    const response = await api.get(
        "/proformas/"
    );

    return response.data;
};


// ==========================================
// RÉCUPÉRER UNE PROFORMA COMPLÈTE
// ==========================================

export const getProforma = async (
    idProforma
) => {

    const response = await api.get(
        `/proformas/${idProforma}`
    );

    return response.data;
};


// ==========================================
// CRÉER UNE PROFORMA
// ==========================================

export const createProforma = async (
    proformaData
) => {

    const response = await api.post(
        "/proformas/",
        proformaData
    );

    return response.data;
};


// ==========================================
// MODIFIER LE STATUT
// ==========================================

export const updateProforma = async (
    idProforma,
    proformaData
) => {

    const response = await api.put(
        `/proformas/${idProforma}`,
        proformaData
    );

    return response.data;
};