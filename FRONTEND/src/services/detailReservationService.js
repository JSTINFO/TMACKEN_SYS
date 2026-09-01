import api from "./api";


// =========================================================
// TOUS LES DETAILS
// =========================================================

export const getDetailsReservation = async () => {

    const response = await api.get(
        "/details-reservation/"
    );

    return response.data;
};


// =========================================================
// UN DETAIL
// =========================================================

export const getDetailReservation = async (
    idDetail
) => {

    const response = await api.get(
        `/details-reservation/${idDetail}`
    );

    return response.data;
};


// =========================================================
// AJOUTER UN DETAIL
// =========================================================

export const createDetailReservation = async (
    data
) => {

    const response = await api.post(
        "/details-reservation/",
        data
    );

    return response.data;
};


// =========================================================
// MODIFIER UN DETAIL
// =========================================================

export const updateDetailReservation = async (
    idDetail,
    data
) => {

    const response = await api.put(
        `/details-reservation/${idDetail}`,
        data
    );

    return response.data;
};


// =========================================================
// SUPPRIMER UN DETAIL
// =========================================================

export const deleteDetailReservation = async (
    idDetail
) => {

    await api.delete(
        `/details-reservation/${idDetail}`
    );
};