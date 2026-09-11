import api from "./api";

// ============================================================
// PAIEMENTS
// ============================================================

/**
 * Récupérer tous les paiements
 *
 * Backend :
 * GET /paiements/
 */
export const getPaiementsDetails = async () => {
    const response = await api.get("/paiements/");
    return response.data;
};


// ============================================================
// RÉCUPÉRER UN PAIEMENT
// ============================================================

/**
 * Récupérer un paiement par son ID
 *
 * Backend :
 * GET /paiements/{id_paiement}
 */
export const getPaiement = async (idPaiement) => {
    const response = await api.get(
        `/paiements/${idPaiement}`
    );

    return response.data;
};


// ============================================================
// CRÉER UN PAIEMENT
// ============================================================

/**
 * Enregistrer un paiement.
 *
 * Pour une vente :
 * {
 *     montant,
 *     mode_paiement,
 *     id_vente,
 *     id_reservation: null
 * }
 *
 * Pour une réservation :
 * {
 *     montant,
 *     mode_paiement,
 *     id_vente: null,
 *     id_reservation
 * }
 *
 * Backend :
 * POST /paiements/
 */
export const createPaiement = async (paiementData) => {
    const response = await api.post(
        "/paiements/",
        paiementData
    );

    return response.data;
};


// ============================================================
// MONTANT D'UNE VENTE
// ============================================================

/**
 * Récupérer les informations de paiement d'une vente.
 *
 * Retour attendu :
 * {
 *     total,
 *     total_paye,
 *     reste_a_payer
 * }
 *
 * NOTE :
 * Cette fonction utilise l'endpoint /ventes/{id}/montant
 * si celui-ci existe dans le backend.
 */
export const getMontantVente = async (idVente) => {
    const response = await api.get(
        `/ventes/${idVente}/montant`
    );

    return response.data;
};


// ============================================================
// MONTANT D'UNE RÉSERVATION
// ============================================================

/**
 * Récupérer les informations de paiement d'une réservation.
 *
 * Retour attendu :
 * {
 *     total,
 *     total_paye,
 *     reste_a_payer
 * }
 *
 * NOTE :
 * Cette fonction utilise l'endpoint
 * /reservations/{id}/montant
 * si celui-ci existe dans le backend.
 */
export const getMontantReservation = async (
    idReservation
) => {
    const response = await api.get(
        `/reservations/${idReservation}/montant`
    );

    return response.data;
};


// ============================================================
// PAIEMENT D'UNE VENTE
// ============================================================

/**
 * Paiement direct d'une vente.
 *
 * Exemple :
 *
 * payerVente(5, {
 *     montant: 1500,
 *     mode_paiement: "ESPECES",
 *     id_utilisateur: 1
 * })
 */
export const payerVente = async (
    idVente,
    data
) => {
    const paiementData = {
        ...data,
        id_vente: Number(idVente),
        id_reservation: null
    };

    const response = await api.post(
        "/paiements/",
        paiementData
    );

    return response.data;
};


// ============================================================
// PAIEMENT D'UNE RÉSERVATION
// ============================================================

/**
 * Paiement direct d'une réservation.
 *
 * Exemple :
 *
 * payerReservation(10, {
 *     montant: 2500,
 *     mode_paiement: "ESPECES",
 *     id_utilisateur: 1
 * })
 */
export const payerReservation = async (
    idReservation,
    data
) => {
    const paiementData = {
        ...data,
        id_vente: null,
        id_reservation: Number(idReservation)
    };

    const response = await api.post(
        "/paiements/",
        paiementData
    );

    return response.data;
};


// ============================================================
// EXPORT PAR DÉFAUT
// ============================================================

export default {
    getPaiementsDetails,
    getPaiement,
    createPaiement,
    getMontantVente,
    getMontantReservation,
    payerVente,
    payerReservation
};