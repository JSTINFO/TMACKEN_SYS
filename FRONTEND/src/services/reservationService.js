import api from "./api";

// ==========================================
// RÉCUPÉRER TOUTES LES RÉSERVATIONS
// ==========================================

export const getReservations = async () => {
    const response = await api.get("/reservations/");
    return response.data;
};


// ==========================================
// RÉCUPÉRER UNE RÉSERVATION COMPLÈTE
// ==========================================

export const getReservation = async (idReservation) => {
    const response = await api.get(
        `/reservations/${idReservation}`
    );

    return response.data;
};


// ==========================================
// CRÉER UNE RÉSERVATION
// ==========================================

export const createReservation = async (
    reservationData
) => {
    const response = await api.post(
        "/reservations/",
        reservationData
    );

    return response.data;
};


// ==========================================
// MODIFIER LE STATUT
// ==========================================

export const updateReservation = async (
    idReservation,
    reservationData
) => {
    const response = await api.put(
        `/reservations/${idReservation}`,
        reservationData
    );

    return response.data;
};


// ==========================================
// CONFIRMER ET PAYER UNE RÉSERVATION
// ==========================================

export const payerReservation = async (
    idReservation,
    paiementData
) => {
    const response = await api.post(
        `/reservations/${idReservation}/payer`,
        paiementData
    );

    return response.data;
};