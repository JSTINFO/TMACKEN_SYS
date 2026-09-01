import api from "./api";


// =====================================
// RÉCUPÉRER TOUS LES PRODUITS
// =====================================

export const getProduits = async () => {

    const response = await api.get("/produits/");

    return response.data;
};


// =====================================
// RÉCUPÉRER UN PRODUIT
// =====================================

export const getProduit = async (idProduit) => {

    const response = await api.get(
        `/produits/${idProduit}`
    );

    return response.data;
};


// =====================================
// CRÉER UN PRODUIT
// =====================================

export const createProduit = async (produitData) => {

    const response = await api.post(
        "/produits/",
        produitData
    );

    return response.data;
};


// =====================================
// MODIFIER UN PRODUIT
// =====================================

export const updateProduit = async (
    idProduit,
    produitData
) => {

    const response = await api.put(
        `/produits/${idProduit}`,
        produitData
    );

    return response.data;
};


// =====================================
// SUPPRIMER UN PRODUIT
// =====================================

export const deleteProduit = async (idProduit) => {

    await api.delete(
        `/produits/${idProduit}`
    );
};