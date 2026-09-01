import api from "./api";


// =====================================
// RÉCUPÉRER TOUS LES CLIENTS
// =====================================

export const getClients = async () => {

    const response = await api.get("/clients/");

    return response.data;
};


// =====================================
// RÉCUPÉRER UN CLIENT
// =====================================

export const getClient = async (idClient) => {

    const response = await api.get(
        `/clients/${idClient}`
    );

    return response.data;
};


// =====================================
// CRÉER UN CLIENT
// =====================================

export const createClient = async (clientData) => {

    const response = await api.post(
        "/clients/",
        clientData
    );

    return response.data;
};


// =====================================
// MODIFIER UN CLIENT
// =====================================

export const updateClient = async (
    idClient,
    clientData
) => {

    const response = await api.put(
        `/clients/${idClient}`,
        clientData
    );

    return response.data;
};


// =====================================
// SUPPRIMER UN CLIENT
// =====================================

export const deleteClient = async (idClient) => {

    await api.delete(
        `/clients/${idClient}`
    );
};