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
    Trash2,
    CreditCard
} from "lucide-react";

import {
    getReservations,
    getReservation,
    createReservation,
    updateReservation,
    payerReservation
} from "../services/reservationService";

import { getClients } from "../services/clientService";
import { getProduits } from "../services/produitService";

import ConfirmModal from "../components/ConfirmModal";
import PaymentModal from "../components/PaymentModal";


function Reservations() {

    // =====================================================
    // DONNEES
    // =====================================================

    const [reservations, setReservations] = useState([]);
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);

    // =====================================================
    // ETATS
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // =====================================================
    // CREATION
    // =====================================================

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [creating, setCreating] =
        useState(false);

    const [form, setForm] = useState({
        id_client: "",
        rabais: 0,
        type_rabais: "MONTANT",
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

    const [confirmModal, setConfirmModal] = useState({
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
    // PAIEMENT
    // =====================================================

    const [paymentModal, setPaymentModal] = useState({
        open: false,
        reservation: null,
        loading: false
    });


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

            map[client.id_client] = client;

        });

        return map;

    }, [clients]);


    // =====================================================
    // MAP PRODUITS
    // =====================================================

    const produitsMap = useMemo(() => {

        const map = {};

        produits.forEach(produit => {

            map[produit.id_produit] = produit;

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
                ).includes(query)

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
    // TYPE RABAIS
    // =====================================================

    const handleDiscountTypeChange = event => {

        setForm(previous => ({
            ...previous,
            type_rabais:
                event.target.value,
            rabais: 0
        }));

    };


    // =====================================================
    // MONTANT RABAIS
    // =====================================================

    const handleDiscountChange = event => {

        let value =
            Number(event.target.value);

        if (Number.isNaN(value)) {
            value = 0;
        }

        if (value < 0) {
            value = 0;
        }

        if (
            form.type_rabais ===
            "POURCENTAGE"
            &&
            value > 100
        ) {
            value = 100;
        }

        setForm(previous => ({
            ...previous,
            rabais: value
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

        let quantity =
            Number(value);

        if (Number.isNaN(quantity)) {
            quantity = 1;
        }

        if (quantity < 1) {
            quantity = 1;
        }

        setForm(previous => {

            const details = [
                ...previous.details
            ];

            details[index] = {
                ...details[index],
                quantite: quantity
            };

            return {
                ...previous,
                details
            };

        });

    };


    // =====================================================
    // AJOUTER PRODUIT
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
    // SUPPRIMER PRODUIT
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
                        (_, i) =>
                            i !== index
                    )

            };

        });

    };


    // =====================================================
    // TOTAL BRUT
    // =====================================================

    const calculateGrossTotal = () => {

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
                    total +
                    Number(
                        produit.prix || 0
                    ) *
                    Number(
                        detail.quantite || 0
                    )
                );

            },
            0
        );

    };


    // =====================================================
    // MONTANT RABAIS
    // =====================================================

    const calculateDiscountAmount = () => {

        const totalBrut =
            calculateGrossTotal();

        const rabais =
            Number(form.rabais || 0);

        if (rabais <= 0) {
            return 0;
        }

        if (
            form.type_rabais ===
            "POURCENTAGE"
        ) {

            return Math.min(
                totalBrut,
                totalBrut * rabais / 100
            );

        }

        return Math.min(
            totalBrut,
            rabais
        );

    };


    // =====================================================
    // TOTAL FINAL
    // =====================================================

    const calculateFinalTotal = () => {

        const totalBrut =
            calculateGrossTotal();

        const discount =
            calculateDiscountAmount();

        return Math.max(
            0,
            totalBrut - discount
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

            rabais: 0,

            type_rabais: "MONTANT",

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


        // CLIENT
        if (!form.id_client) {

            setError(
                "Veuillez sélectionner un client."
            );

            return;
        }


        // PRODUITS
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


            productIds.push(
                productId
            );

        }


        // RABAIS
        const rabais =
            Number(form.rabais || 0);


        if (rabais < 0) {

            setError(
                "Le rabais ne peut pas être négatif."
            );

            return;
        }


        if (
            form.type_rabais ===
            "POURCENTAGE"
            &&
            rabais > 100
        ) {

            setError(
                "Le rabais en pourcentage ne peut pas dépasser 100 %."
            );

            return;
        }


        const client =
            clientsMap[
                Number(form.id_client)
            ];


        const totalBrut =
            calculateGrossTotal();

        const montantRabais =
            calculateDiscountAmount();

        const totalFinal =
            calculateFinalTotal();


        setConfirmModal({

            open: true,

            type: "info",

            title:
                "Créer la réservation ?",

            message:
                `Créer une réservation pour ${client?.prenom || ""} ${client?.nom || ""} avec ${form.details.length} produit(s). Total brut : ${formatPrice(totalBrut)} $, rabais : ${formatPrice(montantRabais)} $, total à payer : ${formatPrice(totalFinal)} $.`,

            confirmText:
                "Créer",

            action:
                createReservationConfirmed

        });

    };


    // =====================================================
    // CREATION CONFIRMEE
    // =====================================================

    const createReservationConfirmed =
        async () => {

            try {

                setConfirmLoading(true);

                setCreating(true);

                setError("");


                const data = {

                    id_client:
                        Number(
                            form.id_client
                        ),

                    rabais:
                        Number(
                            form.rabais || 0
                        ),

                    type_rabais:
                        form.type_rabais,

                    details:
                        form.details.map(
                            detail => ({

                                id_produit:
                                    Number(
                                        detail.id_produit
                                    ),

                                quantite:
                                    Number(
                                        detail.quantite
                                    )

                            })
                        )

                };


                console.log(
                    "DONNEES RESERVATION :",
                    data
                );


                const reservation =
                    await createReservation(
                        data
                    );


                setReservations(
                    previous => [
                        reservation,
                        ...previous
                    ]
                );


                setShowCreateModal(
                    false
                );

                resetForm();


                setConfirmModal({

                    open: false,

                    type: "warning",

                    title: "",

                    message: "",

                    confirmText:
                        "Confirmer",

                    action: null

                });


            } catch (err) {

                console.error(
                    err
                );

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

                    confirmText:
                        "Confirmer",

                    action: null

                });

            } finally {

                setConfirmLoading(
                    false
                );

                setCreating(
                    false
                );

            }

        };


    // =====================================================
    // OUVRIR DETAIL
    // =====================================================

    const openReservation =
        async idReservation => {

            try {

                setLoadingDetail(
                    true
                );

                setShowDetailModal(
                    true
                );

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

                console.error(
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Impossible de charger la réservation."
                );

                setShowDetailModal(
                    false
                );

            } finally {

                setLoadingDetail(
                    false
                );

            }

        };


    // =====================================================
    // FERMER DETAIL
    // =====================================================

    const closeDetailModal = () => {

        setShowDetailModal(
            false
        );

        setSelectedReservation(
            null
        );

    };


    // =====================================================
    // OUVRIR PAIEMENT
    // =====================================================

    const openPaymentModal =
        async reservation => {

            setError("");

            let fullReservation =
                reservation;


            if (
                !fullReservation.details ||
                fullReservation.details.length === 0 ||
                fullReservation.total === undefined
            ) {

                try {

                    fullReservation =
                        await getReservation(
                            reservation.id_reservation
                        );

                } catch (err) {

                    console.warn(
                        "Impossible de charger les détails :",
                        err
                    );

                }

            }


            setPaymentModal({

                open: true,

                reservation:
                    fullReservation,

                loading: false

            });

        };


    // =====================================================
    // FERMER PAIEMENT
    // =====================================================

    const closePaymentModal = () => {

        if (
            paymentModal.loading
        ) {
            return;
        }

        setPaymentModal({

            open: false,

            reservation: null,

            loading: false

        });

    };


    // =====================================================
    // PAYER RESERVATION
    // =====================================================

   // =====================================================
// PAYER RESERVATION
// =====================================================

const handleConfirmPaymentReservation = async ({
    mode_paiement,
    montant
}) => {
    if (!paymentModal.reservation) {
        return;
    }

    const idReservation =
        paymentModal.reservation.id_reservation;

    setPaymentModal(previous => ({
        ...previous,
        loading: true
    }));

    try {
        // ================================================
        // 1. EFFECTUER LE PAIEMENT
        // ================================================

        await payerReservation(
        idReservation,
        {
            mode_paiement,
            montant,
            id_utilisateur: paymentModal.reservation?.id_utilisateur
        }
    );
        // ================================================
        // 2. RECHARGER LA RESERVATION
        // ================================================

        const updatedReservation =
            await getReservation(
                idReservation
            );

        // ================================================
        // 3. METTRE A JOUR LA LISTE
        // ================================================

        setReservations(previous =>
            previous.map(item =>
                item.id_reservation === idReservation
                    ? updatedReservation
                    : item
            )
        );

        // ================================================
        // 4. METTRE A JOUR LE DETAIL SI OUVERT
        // ================================================

        if (
            selectedReservation &&
            selectedReservation.id_reservation ===
                idReservation
        ) {
            setSelectedReservation(
                updatedReservation
            );
        }

        // ================================================
        // 5. FERMER LE MODAL
        // ================================================

        setPaymentModal({
            open: false,
            reservation: null,
            loading: false
        });

        // ================================================
        // 6. RAFRAICHIR LES DONNEES
        // ================================================

        await loadData();

    } catch (err) {

        console.error(
            "Erreur paiement réservation :",
            err
        );

        setPaymentModal(previous => ({
            ...previous,
            loading: false
        }));

        const detail = err.response?.data?.detail;

        let message =
            "Impossible d'effectuer le paiement de la réservation.";

        if (typeof detail === "string") {
            message = detail;
        } else if (Array.isArray(detail)) {
            message = detail
                .map(item => item?.msg || "Erreur de validation.")
                .join(" | ");
        } else if (detail) {
            message = String(detail);
        } else if (err.message) {
            message = err.message;
        }

        setError(message);
    }
};


    // =====================================================
    // CONFIRMER SANS PAIEMENT
    // =====================================================

    const handleConfirmWithoutPaymentReservation =
        async () => {

            if (
                !paymentModal.reservation
            ) {
                return;
            }


            setPaymentModal(
                previous => ({
                    ...previous,
                    loading: true
                })
            );


            try {

                const updated =
                    await updateReservation(

                        paymentModal
                            .reservation
                            .id_reservation,

                        {
                            statut:
                                "CONFIRMEE"
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
                    updated.id_reservation
                ) {

                    const detail =
                        await getReservation(
                            updated.id_reservation
                        );

                    setSelectedReservation(
                        detail
                    );

                }


                setPaymentModal({

                    open: false,

                    reservation: null,

                    loading: false

                });


            } catch (err) {

                console.error(
                    err
                );

                setError(
                    err.response?.data?.detail ||
                    "Impossible de confirmer la réservation sans paiement."
                );

                setPaymentModal(
                    previous => ({
                        ...previous,
                        loading: false
                    })
                );

            }

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

                        console.error(
                            err
                        );

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
    // FERMER CONFIRMATION
    // =====================================================

    const closeConfirmModal = () => {

        if (
            confirmLoading
        ) {
            return;
        }

        setConfirmModal({

            open: false,

            type: "warning",

            title: "",

            message: "",

            confirmText:
                "Confirmer",

            action: null

        });

    };


    // =====================================================
    // NOM CLIENT
    // =====================================================

    const getClientName =
        idClient => {

            const client =
                clientsMap[
                    idClient
                ];

            if (!client) {

                return `Client #${idClient}`;

            }

            return `${client.prenom} ${client.nom}`;

        };


    // =====================================================
    // STATUT
    // =====================================================

    const renderStatus =
        statut => {

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

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div />

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


            {/* =================================================
                STATS
            ================================================= */}

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


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="toolbar">

                <div className="reservation-search-wrapper">

                    <Search size={17} />

                    <input
                        value={search}
                        onChange={e =>
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


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="reservation-error">

                    {error}

                </div>

            )}


            {/* =================================================
                TABLE
            ================================================= */}

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

                        <CalendarDays size={40} />

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

                                                {/* VOIR */}

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


                                                {/* CONFIRMER + PAYER */}

                                                {reservation.statut ===
                                                    "EN_ATTENTE" && (

                                                    <button
                                                        className="table-action confirm"
                                                        title="Confirmer & Encaisser"
                                                        onClick={() =>
                                                            openPaymentModal(
                                                                reservation
                                                            )
                                                        }
                                                    >

                                                        <CheckCircle2
                                                            size={16}
                                                        />

                                                    </button>

                                                )}


                                                {/* PAYER */}

                                                {/* {reservation.statut ===
                                                    "CONFIRMEE" && (

                                                    <button
                                                        className="table-action confirm"
                                                        title="Encaisser"
                                                        style={{
                                                            color:
                                                                "#19d36b"
                                                        }}
                                                        onClick={() =>
                                                            openPaymentModal(
                                                                reservation
                                                            )
                                                        }
                                                    >

                                                        <CreditCard
                                                            size={16}
                                                        />

                                                    </button>

                                                )} */}


                                                {/* ANNULER */}

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

                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nouvelle réservation
                                </h2>

                                <p>
                                    Ajoutez le client, les produits, le rabais et les quantités.
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


                        {/* ERROR */}

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

                            {/* =================================================
                                CLIENT
                            ================================================= */}

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


                            {/* =================================================
                                PRODUITS
                            ================================================= */}

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
                                    (
                                        detail,
                                        index
                                    ) => (

                                        <div
                                            className="reservation-product-form-row"
                                            key={index}
                                        >

                                            <select
                                                className="form-input"
                                                value={
                                                    detail.id_produit
                                                }
                                                onChange={e =>
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

                                                                {" $"}

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
                                                onChange={e =>
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


                            {/* =================================================
                                RABAIS
                            ================================================= */}

                            <div className="reservation-form-section">

                                <div className="reservation-products-header">

                                    <div>

                                        <h3>
                                            Rabais
                                        </h3>

                                        <p>
                                            Appliquez une réduction à la réservation.
                                        </p>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns:
                                            "1fr 1fr",
                                        gap: "12px"
                                    }}
                                >

                                    {/* TYPE */}

                                    <div className="form-group">

                                        <label className="form-label">
                                            Type de rabais
                                        </label>

                                        <select
                                            className="form-input"
                                            value={
                                                form.type_rabais
                                            }
                                            onChange={
                                                handleDiscountTypeChange
                                            }
                                        >

                                            <option value="MONTANT">
                                                Montant
                                            </option>

                                            <option value="POURCENTAGE">
                                                Pourcentage
                                            </option>

                                        </select>

                                    </div>


                                    {/* VALEUR */}

                                    <div className="form-group">

                                        <label className="form-label">

                                            {form.type_rabais ===
                                            "POURCENTAGE"
                                                ? "Pourcentage"
                                                : "Montant"}

                                        </label>

                                        <input
                                            className="form-input"
                                            type="number"
                                            min="0"
                                            max={
                                                form.type_rabais ===
                                                "POURCENTAGE"
                                                    ? "100"
                                                    : undefined
                                            }
                                            step="0.01"
                                            value={
                                                form.rabais
                                            }
                                            onChange={
                                                handleDiscountChange
                                            }
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                TOTAL
                            ================================================= */}

                            <div className="reservation-total-preview">

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        marginBottom:
                                            "8px"
                                    }}
                                >

                                    <span>
                                        Total brut
                                    </span>

                                    <strong>
                                        {
                                            formatPrice(
                                                calculateGrossTotal()
                                            )
                                        } $
                                    </strong>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        marginBottom:
                                            "8px"
                                    }}
                                >

                                    <span>
                                        Rabais
                                    </span>

                                    <strong>

                                        -{" "}

                                        {
                                            formatPrice(
                                                calculateDiscountAmount()
                                            )
                                        }

                                        {" $"}

                                    </strong>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        fontSize:
                                            "18px"
                                    }}
                                >

                                    <strong>
                                        Total à payer
                                    </strong>

                                    <strong>
                                        {
                                            formatPrice(
                                                calculateFinalTotal()
                                            )
                                        } $
                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

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

                                {/* INFOS */}

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

                                            {" $"}

                                        </strong>

                                    </div>

                                </div>


                                {/* PRODUITS */}

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
                                        ?.map(
                                            detail => (

                                                <div
                                                    className="reservation-product-row"
                                                    key={
                                                        detail.id_detail_reservation ||
                                                        `${detail.id_produit}-${detail.nom_produit}`
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
                                                                    detail.nom_produit
                                                                }

                                                            </strong>


                                                            <span>

                                                                {
                                                                    detail.quantite
                                                                }

                                                                {" × "}

                                                                {
                                                                    formatPrice(
                                                                        detail.prix_unitaire
                                                                    )
                                                                }

                                                                {" $"}

                                                            </span>

                                                        </div>

                                                    </div>


                                                    <strong>

                                                        {
                                                            formatPrice(
                                                                detail.sous_total
                                                            )
                                                        }

                                                        {" $"}

                                                    </strong>

                                                </div>

                                            )
                                        )}

                                </div>


                                {/* TOTAL DETAIL */}

                                <div className="reservation-total-row">

                                    <span>
                                        Total brut
                                    </span>

                                    <strong>

                                        {
                                            formatPrice(
                                                selectedReservation
                                                    .details
                                                    ?.reduce(
                                                        (
                                                            total,
                                                            detail
                                                        ) =>
                                                            total +
                                                            Number(
                                                                detail.sous_total ||
                                                                0
                                                            ),
                                                        0
                                                    )
                                            )
                                        }

                                        {" $"}

                                    </strong>

                                </div>


                                <div className="reservation-total-row">

                                    <span>
                                        Rabais
                                        {" "}
                                        (
                                        {
                                            selectedReservation
                                                .type_rabais ===
                                            "POURCENTAGE"
                                                ? `${selectedReservation.rabais || 0}%`
                                                : `${formatPrice(selectedReservation.rabais || 0)} $`
                                        }
                                        )
                                    </span>

                                    <strong>

                                        -

                                        {" "}

                                        {
                                            formatPrice(
                                                Math.max(
                                                    0,
                                                    (
                                                        selectedReservation
                                                            .details
                                                            ?.reduce(
                                                                (
                                                                    total,
                                                                    detail
                                                                ) =>
                                                                    total +
                                                                    Number(
                                                                        detail.sous_total ||
                                                                        0
                                                                    ),
                                                                0
                                                            ) || 0
                                                    )
                                                    -
                                                    Number(
                                                        selectedReservation
                                                            .total ||
                                                        0
                                                    )
                                                )
                                            )
                                        }

                                        {" $"}

                                    </strong>

                                </div>


                                <div
                                    className="reservation-total-row"
                                    style={{
                                        fontSize:
                                            "18px"
                                    }}
                                >

                                    <strong>
                                        Total à payer
                                    </strong>

                                    <strong>

                                        {
                                            formatPrice(
                                                selectedReservation
                                                    .total
                                            )
                                        }

                                        {" $"}

                                    </strong>

                                </div>


                                {/* ACTIONS */}

                                <div className="modal-actions">


                                    {selectedReservation
                                        .statut ===
                                        "EN_ATTENTE" && (

                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                openPaymentModal(
                                                    selectedReservation
                                                )
                                            }
                                        >

                                            <CheckCircle2
                                                size={16}
                                            />

                                            Confirmer & Encaisser

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


                                    {/* {selectedReservation
                                        .statut ===
                                        "CONFIRMEE" && (

                                        <> */}

                                            {/* <button
                                                className="btn btn-primary"
                                                onClick={() =>
                                                    openPaymentModal(
                                                        selectedReservation
                                                    )
                                                }
                                            >

                                                <CreditCard
                                                    size={16}
                                                />

                                                Encaisser

                                            </button> */}


                                            {/* <button
                                                className="btn btn-secondary"
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

                                                Marquer terminée

                                            </button>

                                        </> */}

                                    {/* )} */}


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


            {/* =================================================
                PAIEMENT
            ================================================= */}

            <PaymentModal
    open={paymentModal.open}
    onClose={closePaymentModal}

    title={`Règlement — Réservation #${paymentModal.reservation?.id_reservation || ""}`}

    clientName={
        paymentModal.reservation
            ? getClientName(paymentModal.reservation.id_client)
            : ""
    }

    reference={`Réservation #${paymentModal.reservation?.id_reservation || ""}`}

    totalAmount={paymentModal.reservation?.total || 0}

    items={paymentModal.reservation?.details || []}

    rabaisInitial={
        paymentModal.reservation?.rabais || 0
    }

    typeRabaisInitial={
        paymentModal.reservation?.type_rabais || "MONTANT"
    }

    onConfirmPayment={handleConfirmPaymentReservation}

    onConfirmWithoutPayment={
        paymentModal.reservation?.statut === "EN_ATTENTE"
            ? handleConfirmWithoutPaymentReservation
            : undefined
    }

    loading={paymentModal.loading}
/>

        </div>

    );

}


export default Reservations;