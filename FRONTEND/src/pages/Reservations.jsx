import { useEffect, useMemo, useState } from "react";

import {
    Plus,
    Search,
    RefreshCw,
    Eye,
    XCircle,
    CheckCircle2,
    Clock3,
    CalendarDays,
    UserRound,
    Package,
    Trash2
} from "lucide-react";

import {
    getReservations,
    getReservation,
    createReservation,
    updateReservation
} from "../services/reservationService";

import { getClients } from "../services/clientService";
import { getProduits } from "../services/produitService";

import ConfirmModal from "../components/ConfirmModal";


function Reservations() {

    // =====================================================
    // DONNEES
    // =====================================================

    const [reservations, setReservations] =
        useState([]);

    const [clients, setClients] =
        useState([]);

    const [produits, setProduits] =
        useState([]);


    // =====================================================
    // ETATS
    // =====================================================

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");


    // =====================================================
    // CREATION
    // =====================================================

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [creating, setCreating] =
        useState(false);


    const [form, setForm] = useState({

        id_client: "",

        details: [
            {
                id_produit: "",
                quantite: 1
            }
        ]

    });


    // =====================================================
    // DETAIL
    // =====================================================

    const [showDetailModal, setShowDetailModal] =
        useState(false);

    const [selectedReservation, setSelectedReservation] =
        useState(null);

    const [loadingDetail, setLoadingDetail] =
        useState(false);


    // =====================================================
    // CONFIRMATION
    // =====================================================

    const [confirmModal, setConfirmModal] =
        useState({

            open: false,

            type: "warning",

            title: "",

            message: "",

            confirmText: "Confirmer",

            action: null

        });


    const [confirmLoading, setConfirmLoading] =
        useState(false);


    // =====================================================
    // CHARGEMENT
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                reservationsData,
                clientsData,
                produitsData
            ] = await Promise.all([

                getReservations(),

                getClients(),

                getProduits()

            ]);


            setReservations(
                reservationsData || []
            );

            setClients(
                clientsData || []
            );

            setProduits(
                produitsData || []
            );


        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Impossible de charger les données."
            );


        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // =====================================================
    // MAP CLIENTS
    // =====================================================

    const clientsMap = useMemo(() => {

        const map = {};

        clients.forEach(client => {

            map[client.id_client] =
                client;

        });

        return map;

    }, [clients]);


    // =====================================================
    // MAP PRODUITS
    // =====================================================

    const produitsMap = useMemo(() => {

        const map = {};

        produits.forEach(produit => {

            map[produit.id_produit] =
                produit;

        });

        return map;

    }, [produits]);


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const totalReservations =
        reservations.length;


    const enAttente =
        reservations.filter(
            r => r.statut === "EN_ATTENTE"
        ).length;


    const confirmees =
        reservations.filter(
            r => r.statut === "CONFIRMEE"
        ).length;


    const annulees =
        reservations.filter(
            r => r.statut === "ANNULEE"
        ).length;


    // =====================================================
    // RECHERCHE
    // =====================================================

    const filteredReservations =
        reservations.filter(reservation => {

            const query =
                search.toLowerCase().trim();


            if (!query) {

                return true;

            }


            const client =
                clientsMap[
                    reservation.id_client
                ];


            const nomClient = client

                ? `${client.prenom} ${client.nom}`

                : "";


            return (

                String(
                    reservation.id_reservation
                )
                    .includes(query)

                ||

                nomClient
                    .toLowerCase()
                    .includes(query)

                ||

                reservation.statut
                    .toLowerCase()
                    .includes(query)

            );

        });


    // =====================================================
    // FORM CLIENT
    // =====================================================

    const handleClientChange = event => {

        setForm(previous => ({

            ...previous,

            id_client:
                event.target.value

        }));

    };


    // =====================================================
    // PRODUIT CHANGE
    // =====================================================

    const handleProductChange = (
        index,
        value
    ) => {

        setForm(previous => {

            const details = [
                ...previous.details
            ];

            details[index] = {

                ...details[index],

                id_produit: value

            };

            return {

                ...previous,

                details

            };

        });

    };


    // =====================================================
    // QUANTITE CHANGE
    // =====================================================

    const handleQuantityChange = (
        index,
        value
    ) => {

        setForm(previous => {

            const details = [
                ...previous.details
            ];

            details[index] = {

                ...details[index],

                quantite:
                    Number(value)

            };

            return {

                ...previous,

                details

            };

        });

    };


    // =====================================================
    // AJOUTER LIGNE PRODUIT
    // =====================================================

    const addProductLine = () => {

        setForm(previous => ({

            ...previous,

            details: [

                ...previous.details,

                {
                    id_produit: "",
                    quantite: 1
                }

            ]

        }));

    };


    // =====================================================
    // SUPPRIMER LIGNE
    // =====================================================

    const removeProductLine = index => {

        setForm(previous => {

            if (
                previous.details.length === 1
            ) {

                return previous;

            }


            return {

                ...previous,

                details:
                    previous.details.filter(
                        (_, i) => i !== index
                    )

            };

        });

    };


    // =====================================================
    // TOTAL
    // =====================================================

    const calculateTotal = () => {

        return form.details.reduce(
            (total, detail) => {

                const produit =
                    produitsMap[
                        Number(
                            detail.id_produit
                        )
                    ];


                if (!produit) {

                    return total;

                }


                return (
                    total
                    +
                    Number(produit.prix || 0)
                    *
                    Number(detail.quantite || 0)
                );

            },

            0
        );

    };


    // =====================================================
    // FORMAT PRIX
    // =====================================================

    const formatPrice = price => {

        return Number(
            price || 0
        ).toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = date => {

        if (!date) {

            return "—";

        }


        return new Date(
            date
        ).toLocaleString(
            "fr-FR",
            {
                dateStyle: "short",
                timeStyle: "short"
            }
        );

    };


    // =====================================================
    // RESET
    // =====================================================

    const resetForm = () => {

        setForm({

            id_client: "",

            details: [

                {
                    id_produit: "",
                    quantite: 1
                }

            ]

        });

    };


    // =====================================================
    // OUVRIR CREATION
    // =====================================================

    const openCreateModal = () => {

        setError("");

        resetForm();

        setShowCreateModal(true);

    };


    // =====================================================
    // FERMER CREATION
    // =====================================================

    const closeCreateModal = () => {

        if (creating) {

            return;

        }


        setShowCreateModal(false);

        resetForm();

    };


    // =====================================================
    // PREPARER CREATION
    // =====================================================

    const handleCreateSubmit = event => {

        event.preventDefault();

        setError("");


        if (!form.id_client) {

            setError(
                "Veuillez sélectionner un client."
            );

            return;

        }


        if (!form.details.length) {

            setError(
                "Ajoutez au moins un produit."
            );

            return;

        }


        const productIds = [];


        for (
            const detail of form.details
        ) {

            if (!detail.id_produit) {

                setError(
                    "Veuillez sélectionner un produit pour chaque ligne."
                );

                return;

            }


            if (
                !detail.quantite ||
                detail.quantite <= 0
            ) {

                setError(
                    "Chaque quantité doit être supérieure à 0."
                );

                return;

            }


            const productId =
                Number(
                    detail.id_produit
                );


            if (
                productIds.includes(
                    productId
                )
            ) {

                setError(
                    "Un même produit ne peut pas être ajouté deux fois."
                );

                return;

            }


            productIds.push(productId);

        }


        const client =
            clientsMap[
                Number(form.id_client)
            ];


        setConfirmModal({

            open: true,

            type: "info",

            title:
                "Créer la réservation ?",

            message:
                `Créer une réservation pour ${client.prenom} ${client.nom} avec ${form.details.length} produit(s) pour un total de ${formatPrice(calculateTotal())} ?`,

            confirmText:
                "Créer",

            action:
                createReservationConfirmed

        });

    };


    // =====================================================
    // CREATION CONFIRMEE
    // =====================================================

const createReservationConfirmed = async () => {
    try {
        console.log("1️⃣ DEBUT CREATION");

        setConfirmLoading(true);
        setCreating(true);
        setError("");

        const data = {
            id_client: Number(form.id_client),

            details: form.details.map(detail => ({
                id_produit: Number(detail.id_produit),
                quantite: Number(detail.quantite)
            }))
        };

        console.log("2️⃣ DONNEES ENVOYEES :", data);

        const reservation = await createReservation(data);

        console.log("3️⃣ RESERVATION RECUE :", reservation);

        setReservations(previous => [
            reservation,
            ...previous
        ]);

        console.log("4️⃣ FERMETURE MODAL");

        setShowCreateModal(false);
        resetForm();

        setConfirmModal({
            open: false,
            type: "warning",
            title: "",
            message: "",
            confirmText: "Confirmer",
            action: null
        });

        console.log("5️⃣ FIN SANS ERREUR");

    } catch (err) {

        console.error("🔥 ERREUR COMPLETE :", err);
        console.error("🔥 RESPONSE :", err.response);
        console.error("🔥 DATA :", err.response?.data);
        console.error("🔥 STATUS :", err.response?.status);

        setError(
            err.response?.data?.detail ||
            err.message ||
            "Impossible de créer la réservation."
        );

        setConfirmModal({
            open: false,
            type: "warning",
            title: "",
            message: "",
            confirmText: "Confirmer",
            action: null
        });

    } finally {
        setConfirmLoading(false);
        setCreating(false);
    }
};

    // =====================================================
    // OUVRIR DETAIL
    // =====================================================

    const openReservation =
        async idReservation => {

            try {

                setLoadingDetail(true);

                setShowDetailModal(true);

                setSelectedReservation(
                    null
                );

                setError("");


                const data =
                    await getReservation(
                        idReservation
                    );


                setSelectedReservation(
                    data
                );


            } catch (err) {

                console.error(err);


                setError(
                    err.response?.data?.detail ||
                    "Impossible de charger la réservation."
                );


                setShowDetailModal(false);


            } finally {

                setLoadingDetail(false);

            }

        };


    // =====================================================
    // FERMER DETAIL
    // =====================================================

    const closeDetailModal = () => {

        setShowDetailModal(false);

        setSelectedReservation(
            null
        );

    };


    // =====================================================
    // CHANGER STATUT
    // =====================================================

    const changeStatus = (
        reservation,
        status
    ) => {

        let title = "";

        let message = "";

        let confirmText = "";


        if (
            status === "CONFIRMEE"
        ) {

            title =
                "Confirmer la réservation ?";

            message =
                `La réservation #${reservation.id_reservation} sera confirmée et les quantités seront retirées du stock.`;

            confirmText =
                "Confirmer";

        }


        if (
            status === "ANNULEE"
        ) {

            title =
                "Annuler la réservation ?";

            message =
                reservation.statut ===
                "CONFIRMEE"

                    ? "Les produits seront remis dans le stock."

                    : "La réservation sera annulée.";

            confirmText =
                "Annuler la réservation";

        }


        if (
            status === "TERMINEE"
        ) {

            title =
                "Terminer la réservation ?";

            message =
                `Marquer la réservation #${reservation.id_reservation} comme terminée ?`;

            confirmText =
                "Terminer";

        }


        setConfirmModal({

            open: true,

            type:
                status === "ANNULEE"
                    ? "warning"
                    : "info",

            title,

            message,

            confirmText,

            action:
                async () => {

                    try {

                        setConfirmLoading(
                            true
                        );


                        const updated =
                            await updateReservation(

                                reservation
                                    .id_reservation,

                                {
                                    statut:
                                        status
                                }

                            );


                        setReservations(
                            previous =>

                                previous.map(
                                    item =>

                                        item.id_reservation ===
                                        updated.id_reservation

                                            ? updated

                                            : item

                                )
                        );


                        if (
                            selectedReservation
                            &&
                            selectedReservation
                                .id_reservation ===
                            reservation.id_reservation
                        ) {

                            const detail =
                                await getReservation(
                                    reservation
                                        .id_reservation
                                );


                            setSelectedReservation(
                                detail
                            );

                        }


                        closeConfirmModal();


                    } catch (err) {

                        console.error(err);


                        setError(
                            err.response?.data?.detail ||
                            "Impossible de modifier la réservation."
                        );


                        closeConfirmModal();

                    } finally {

                        setConfirmLoading(
                            false
                        );

                    }

                }

        });

    };


    // =====================================================
    // CONFIRM MODAL
    // =====================================================

    const closeConfirmModal = () => {

        if (confirmLoading) {

            return;

        }


        setConfirmModal({

            open: false,

            type: "warning",

            title: "",

            message: "",

            confirmText: "Confirmer",

            action: null

        });

    };


    // =====================================================
    // NOM CLIENT
    // =====================================================

    const getClientName =
        idClient => {

            const client =
                clientsMap[idClient];


            if (!client) {

                return `Client #${idClient}`;

            }


            return `${client.prenom} ${client.nom}`;

        };


    // =====================================================
    // STATUT
    // =====================================================

    const renderStatus = statut => {

        if (
            statut ===
            "EN_ATTENTE"
        ) {

            return (

                <span className="reservation-status pending">

                    <Clock3 size={14} />

                    En attente

                </span>

            );

        }


        if (
            statut ===
            "CONFIRMEE"
        ) {

            return (

                <span className="reservation-status confirmed">

                    <CheckCircle2 size={14} />

                    Confirmée

                </span>

            );

        }


        if (
            statut ===
            "ANNULEE"
        ) {

            return (

                <span className="reservation-status cancelled">

                    <XCircle size={14} />

                    Annulée

                </span>

            );

        }


        if (
            statut ===
            "TERMINEE"
        ) {

            return (

                <span className="reservation-status completed">

                    <CheckCircle2 size={14} />

                    Terminée

                </span>

            );

        }


        return statut;

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="reservations-page">


            {/* HEADER */}

            <div className="page-header">

                <div>

                    {/* <h1 className="page-title">

                        Réservations

                    </h1>

                    <p className="page-description">

                        Gérez les réservations clients et leurs produits.

                    </p> */}

                </div>


                <button
                    className="btn btn-primary"
                    onClick={
                        openCreateModal
                    }
                >

                    <Plus size={17} />

                    Nouvelle réservation

                </button>

            </div>


            {/* STATS */}

            <div className="stats-grid">


                <div className="stat-card">

                    <span className="stat-label">

                        Total

                    </span>

                    <strong className="stat-value">

                        {totalReservations}

                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">

                        En attente

                    </span>

                    <strong className="stat-value">

                        {enAttente}

                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">

                        Confirmées

                    </span>

                    <strong className="stat-value">

                        {confirmees}

                    </strong>

                </div>


                <div className="stat-card">

                    <span className="stat-label">

                        Annulées

                    </span>

                    <strong className="stat-value">

                        {annulees}

                    </strong>

                </div>

            </div>


            {/* TOOLBAR */}

            <div className="toolbar">

                <div className="reservation-search-wrapper">

                    <Search size={17} />

                    <input
                        value={search}
                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }
                        placeholder="Rechercher une réservation..."
                    />

                </div>


                <button
                    className="btn btn-secondary"
                    onClick={
                        loadData
                    }
                >

                    <RefreshCw size={16} />

                    Actualiser

                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="reservation-error">

                    {error}

                </div>

            )}


            {/* TABLE */}

            <div className="table-container">


                {loading ? (

                    <div className="reservation-loading">

                        <RefreshCw
                            className="spin"
                        />

                        Chargement...

                    </div>

                ) : filteredReservations.length === 0 ? (

                    <div className="reservation-empty">

                        <CalendarDays
                            size={40}
                        />

                        <h3>

                            Aucune réservation

                        </h3>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Client</th>

                                <th>Date</th>

                                <th>Statut</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredReservations.map(
                                reservation => (

                                    <tr
                                        key={
                                            reservation
                                                .id_reservation
                                        }
                                    >

                                        <td>

                                            #
                                            {
                                                reservation
                                                    .id_reservation
                                            }

                                        </td>


                                        <td>

                                            <div className="reservation-client">

                                                <UserRound
                                                    size={16}
                                                />

                                                {
                                                    getClientName(
                                                        reservation
                                                            .id_client
                                                    )
                                                }

                                            </div>

                                        </td>


                                        <td>

                                            {
                                                formatDate(
                                                    reservation
                                                        .date_reservation
                                                )
                                            }

                                        </td>


                                        <td>

                                            {
                                                renderStatus(
                                                    reservation
                                                        .statut
                                                )
                                            }

                                        </td>


                                        <td>

                                            <div className="reservation-actions">

                                                <button
                                                    className="table-action view"
                                                    title="Voir"
                                                    onClick={() =>
                                                        openReservation(
                                                            reservation
                                                                .id_reservation
                                                        )
                                                    }
                                                >

                                                    <Eye size={16} />

                                                </button>


                                                {reservation.statut ===
                                                    "EN_ATTENTE" && (

                                                    <button
                                                        className="table-action confirm"
                                                        title="Confirmer"
                                                        onClick={() =>
                                                            changeStatus(
                                                                reservation,
                                                                "CONFIRMEE"
                                                            )
                                                        }
                                                    >

                                                        <CheckCircle2
                                                            size={16}
                                                        />

                                                    </button>

                                                )}


                                                {(
                                                    reservation.statut ===
                                                        "EN_ATTENTE"
                                                    ||
                                                    reservation.statut ===
                                                        "CONFIRMEE"
                                                ) && (

                                                    <button
                                                        className="table-action delete"
                                                        title="Annuler"
                                                        onClick={() =>
                                                            changeStatus(
                                                                reservation,
                                                                "ANNULEE"
                                                            )
                                                        }
                                                    >

                                                        <XCircle
                                                            size={16}
                                                        />

                                                    </button>

                                                )}

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* =================================================
                MODAL CREATION
            ================================================= */}

            {showCreateModal && (

                <div className="modal-overlay">


                    <div className="client-modal reservation-modal">


                        <div className="modal-header">

                            <div>

                                <h2>

                                    Nouvelle réservation

                                </h2>

                                <p>

                                    Ajoutez le client et les produits.

                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={
                                    closeCreateModal
                                }
                            >

                                ×

                            </button>

                        </div>


                        {error && (

                            <div className="reservation-error modal-error">

                                {error}

                            </div>

                        )}


                        <form
                            onSubmit={
                                handleCreateSubmit
                            }
                        >


                            {/* CLIENT */}

                            <div className="form-group">

                                <label className="form-label">

                                    Client *

                                </label>


                                <select
                                    className="form-input"
                                    value={
                                        form.id_client
                                    }
                                    onChange={
                                        handleClientChange
                                    }
                                    required
                                >

                                    <option value="">

                                        Sélectionner un client

                                    </option>


                                    {clients.map(
                                        client => (

                                            <option
                                                key={
                                                    client.id_client
                                                }
                                                value={
                                                    client.id_client
                                                }
                                            >

                                                {
                                                    client.prenom
                                                }
                                                {" "}
                                                {
                                                    client.nom
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* PRODUITS */}

                            <div className="reservation-form-section">

                                <div className="reservation-products-header">

                                    <div>

                                        <h3>

                                            Produits

                                        </h3>

                                        <p>

                                            Ajoutez les produits et leurs quantités.

                                        </p>

                                    </div>


                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={
                                            addProductLine
                                        }
                                    >

                                        <Plus size={15} />

                                        Ajouter

                                    </button>

                                </div>


                                {form.details.map(
                                    (detail, index) => (

                                        <div
                                            className="reservation-product-form-row"
                                            key={index}
                                        >


                                            <select
                                                className="form-input"
                                                value={
                                                    detail.id_produit
                                                }
                                                onChange={
                                                    e =>
                                                        handleProductChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                }
                                                required
                                            >

                                                <option value="">

                                                    Sélectionner un produit

                                                </option>


                                                {produits
                                                    .filter(
                                                        produit =>
                                                            produit.statut
                                                    )
                                                    .map(
                                                        produit => (

                                                            <option
                                                                key={
                                                                    produit.id_produit
                                                                }
                                                                value={
                                                                    produit.id_produit
                                                                }
                                                            >

                                                                {
                                                                    produit.nom
                                                                }

                                                                {" — "}

                                                                {
                                                                    formatPrice(
                                                                        produit.prix
                                                                    )
                                                                }

                                                            </option>

                                                        )
                                                    )}

                                            </select>


                                            <input
                                                className="form-input quantity-input"
                                                type="number"
                                                min="1"
                                                value={
                                                    detail.quantite
                                                }
                                                onChange={
                                                    e =>
                                                        handleQuantityChange(
                                                            index,
                                                            e.target.value
                                                        )
                                                }
                                                required
                                            />


                                            <button
                                                type="button"
                                                className="table-action delete"
                                                disabled={
                                                    form.details.length ===
                                                    1
                                                }
                                                onClick={() =>
                                                    removeProductLine(
                                                        index
                                                    )
                                                }
                                            >

                                                <Trash2
                                                    size={16}
                                                />

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>


                            {/* TOTAL */}

                            <div className="reservation-total-preview">

                                <span>

                                    Total

                                </span>


                                <strong>

                                    {
                                        formatPrice(
                                            calculateTotal()
                                        )
                                    }

                                </strong>

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        closeCreateModal
                                    }
                                    disabled={
                                        creating
                                    }
                                >

                                    Annuler

                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={
                                        creating
                                    }
                                >

                                    <Plus size={16} />

                                    Créer la réservation

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =================================================
                MODAL DETAIL
            ================================================= */}

            {showDetailModal && (

                <div className="modal-overlay">


                    <div className="client-modal reservation-detail-modal">


                        <div className="modal-header">

                            <div>

                                <h2>

                                    Réservation #

                                    {
                                        selectedReservation
                                            ?.id_reservation
                                    }

                                </h2>

                                <p>

                                    {selectedReservation &&
                                        getClientName(
                                            selectedReservation
                                                .id_client
                                        )}

                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={
                                    closeDetailModal
                                }
                            >

                                ×

                            </button>

                        </div>


                        {loadingDetail ? (

                            <div className="reservation-loading">

                                <RefreshCw
                                    className="spin"
                                />

                                Chargement...

                            </div>

                        ) : selectedReservation ? (

                            <>


                                <div className="reservation-detail-top">

                                    <div>

                                        <span className="detail-label">

                                            Client

                                        </span>

                                        <strong>

                                            {
                                                getClientName(
                                                    selectedReservation
                                                        .id_client
                                                )
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span className="detail-label">

                                            Date

                                        </span>

                                        <strong>

                                            {
                                                formatDate(
                                                    selectedReservation
                                                        .date_reservation
                                                )
                                            }

                                        </strong>

                                    </div>


                                    <div>

                                        <span className="detail-label">

                                            Statut

                                        </span>

                                        {
                                            renderStatus(
                                                selectedReservation
                                                    .statut
                                            )
                                        }

                                    </div>


                                    <div>

                                        <span className="detail-label">

                                            Total

                                        </span>

                                        <strong>

                                            {
                                                formatPrice(
                                                    selectedReservation
                                                        .total
                                                )
                                            }

                                        </strong>

                                    </div>

                                </div>


                                <div className="reservation-products-header">

                                    <div>

                                        <h3>

                                            Produits

                                        </h3>

                                    </div>

                                </div>


                                <div className="reservation-products-list">

                                    {selectedReservation
                                        .details
                                        .map(
                                            detail => (

                                                <div
                                                    className="reservation-product-row"
                                                    key={
                                                        detail
                                                            .id_detail_reservation
                                                    }
                                                >

                                                    <div className="reservation-product-info">

                                                        <div className="reservation-product-icon">

                                                            <Package
                                                                size={17}
                                                            />

                                                        </div>


                                                        <div>

                                                            <strong>

                                                                {
                                                                    detail
                                                                        .nom_produit
                                                                }

                                                            </strong>


                                                            <span>

                                                                {
                                                                    detail
                                                                        .quantite
                                                                }

                                                                {" × "}

                                                                {
                                                                    formatPrice(
                                                                        detail
                                                                            .prix_unitaire
                                                                    )
                                                                }

                                                            </span>

                                                        </div>

                                                    </div>


                                                    <strong>

                                                        {
                                                            formatPrice(
                                                                detail
                                                                    .sous_total
                                                            )
                                                        }

                                                    </strong>

                                                </div>

                                            )
                                        )}

                                </div>


                                <div className="reservation-total-row">

                                    <span>

                                        Total

                                    </span>

                                    <strong>

                                        {
                                            formatPrice(
                                                selectedReservation
                                                    .total
                                            )
                                        }

                                    </strong>

                                </div>


                                <div className="modal-actions">


                                    {selectedReservation
                                        .statut ===
                                        "EN_ATTENTE" && (

                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                changeStatus(
                                                    selectedReservation,
                                                    "CONFIRMEE"
                                                )
                                            }
                                        >

                                            <CheckCircle2
                                                size={16}
                                            />

                                            Confirmer

                                        </button>

                                    )}


                                    {(
                                        selectedReservation
                                            .statut ===
                                            "EN_ATTENTE"
                                        ||
                                        selectedReservation
                                            .statut ===
                                            "CONFIRMEE"
                                    ) && (

                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                changeStatus(
                                                    selectedReservation,
                                                    "ANNULEE"
                                                )
                                            }
                                        >

                                            <XCircle
                                                size={16}
                                            />

                                            Annuler

                                        </button>

                                    )}


                                    {selectedReservation
                                        .statut ===
                                        "CONFIRMEE" && (

                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                changeStatus(
                                                    selectedReservation,
                                                    "TERMINEE"
                                                )
                                            }
                                        >

                                            <CheckCircle2
                                                size={16}
                                            />

                                            Terminer

                                        </button>

                                    )}


                                    <button
                                        className="btn btn-secondary"
                                        onClick={
                                            closeDetailModal
                                        }
                                    >

                                        Fermer

                                    </button>

                                </div>

                            </>

                        ) : null}

                    </div>

                </div>

            )}


            {/* =================================================
                CONFIRMATION
            ================================================= */}

            <ConfirmModal

                open={
                    confirmModal.open
                }

                type={
                    confirmModal.type
                }

                title={
                    confirmModal.title
                }

                message={
                    confirmModal.message
                }

                confirmText={
                    confirmModal.confirmText
                }

                cancelText="Annuler"

                loading={
                    confirmLoading
                }

                onConfirm={
                    confirmModal.action
                }

                onCancel={
                    closeConfirmModal
                }

            />

        </div>

    );

}


export default Reservations;