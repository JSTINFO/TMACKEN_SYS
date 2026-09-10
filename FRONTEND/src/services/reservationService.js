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
// PAYER UNE RÉSERVATION
// ==========================================
// Le paiement passe par le routeur central
// /paiements/ afin de gérer dans une seule
// transaction :
// - Paiement
// - Vente
// - Détails de vente
// - Stock
// - Mouvement de stock
// - Confirmation de la réservation
// ==========================================

export const payerReservation = async (
    idReservation,
    paiementData
) => {
    const response = await api.post(
        "/paiements/",
        {
            ...paiementData,
            id_reservation: idReservation,
            id_vente: null,
        }
    );

    return response.data;
};