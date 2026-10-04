import api from "./api";


// =====================================================
// RÉCUPÉRER LES INFORMATIONS DE L'ENTREPRISE
// =====================================================

export const getMyEntreprise = async () => {
    const response = await api.get("/entreprise/me");

    return response.data;
};


// =====================================================
// MODIFIER LES INFORMATIONS DE L'ENTREPRISE
// =====================================================

export const updateMyEntreprise = async (entrepriseData) => {
    const response = await api.put(
        "/entreprise/me",
        entrepriseData
    );

    return response.data;
};


// =====================================================
// ENVOYER LE LOGO
// =====================================================

export const uploadEntrepriseLogo = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/entreprise/me/logo",
        formData
    );

    return response.data;
};


// =====================================================
// RÉCUPÉRER LE BRANDING PUBLIC DE L'ENTREPRISE
// =====================================================

export const getPublicEntreprise = async () => {
    const response = await api.get("/entreprise/public");

    return response.data;
};