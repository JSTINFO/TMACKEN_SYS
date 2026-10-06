import { useEffect, useMemo, useState } from "react";
import { useSettings } from "../context/SettingsContext";

import {
    Eye,
    Plus,
    Search,
    X,
    Check,
    Ban,
    ShoppingCart,
    Package,
    User,
    Loader2,
    Trash2,
    RefreshCw
} from "lucide-react";

import {
    getVentes,
    getVente,
    createVente,
    updateVente
} from "../services/venteService";

import { getClients } from "../services/clientService";
import { getProduits } from "../services/produitService";
import { getCurrentUser } from "../services/authService";
import { createPaiement } from "../services/paiementService";

import ConfirmModal from "../components/ConfirmModal";
import PaymentModal from "../components/PaymentModal";

import "./Ventes.css";


function Ventes() {

    const { formatMoney } = useSettings();

    // =====================================================
    // DONNEES
    // =====================================================

    const [ventes, setVentes] = useState([]);
    const [clients, setClients] = useState([]);
    const [produits, setProduits] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);


    // =====================================================
    // ETATS
    // =====================================================

    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");


    // =====================================================
    // MODALS
    // =====================================================

    const [showCreateModal, setShowCreateModal] =
        useState(false);

    const [showDetailModal, setShowDetailModal] =
        useState(false);

    const [selectedVente, setSelectedVente] =
        useState(null);


    // =====================================================
    // FORMULAIRE
    // =====================================================

    const [form, setForm] = useState({

        id_client: "",

        details: [
            {
                id_produit: "",
                quantite: 1
            }
        ],

        // -----------------------------
        // RABAIS
        // -----------------------------

        rabais: 0,

        type_rabais: "MONTANT"
    });


    // =====================================================
    // MODAL CONFIRMATION
    // =====================================================

    const [confirmModal, setConfirmModal] = useState({

        open: false,

        type: "warning",

        title: "",

        message: "",

        confirmText: "Confirmer",

        action: null
    });


    // =====================================================
    // MODAL PAIEMENT
    // =====================================================

    const [paymentModal, setPaymentModal] = useState({

        open: false,

        vente: null,

        loading: false
    });


    // =====================================================
    // CHARGER LES DONNEES
    // =====================================================

    const chargerDonnees = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                ventesData,
                clientsData,
                produitsData,
                currentUserData
            ] = await Promise.all([

                getVentes(),

                getClients(),

                getProduits(),

                getCurrentUser()
            ]);


            setVentes(
                Array.isArray(ventesData)
                    ? ventesData
                    : []
            );


            setClients(
                Array.isArray(clientsData)
                    ? clientsData
                    : []
            );


            setProduits(
                Array.isArray(produitsData)
                    ? produitsData
                    : []
            );


            setCurrentUser(
                currentUserData
            );

        } catch (err) {

            console.error(
                "ERREUR CHARGEMENT VENTES :",
                err
            );

            setError(
                err.response?.data?.detail ||
                "Impossible de charger les données."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // CHARGEMENT INITIAL
    // =====================================================

    useEffect(() => {

        chargerDonnees();

    }, []);


    // =====================================================
    // RESET FORMULAIRE
    // =====================================================

    const resetForm = () => {

        setForm({

            id_client: "",

            details: [
                {
                    id_produit: "",
                    quantite: 1
                }
            ],

            rabais: 0,

            type_rabais: "MONTANT"
        });
    };


    // =====================================================
    // OUVRIR MODAL CREATION
    // =====================================================

    const openCreateModal = () => {

        resetForm();

        setError("");

        setShowCreateModal(true);
    };


    // =====================================================
    // FERMER MODAL CREATION
    // =====================================================

    const closeCreateModal = () => {

        if (creating) {
            return;
        }

        setShowCreateModal(false);

        resetForm();

        setError("");
    };


    // =====================================================
    // CLIENT
    // =====================================================

    const handleClientChange = (event) => {

        setForm(previous => ({

            ...previous,

            id_client:
                event.target.value
        }));
    };


    // =====================================================
    // PRODUIT
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
    // QUANTITE
    // =====================================================

    const handleQuantityChange = (
        index,
        value
    ) => {

        const quantity =
            Math.max(
                1,
                Number(value) || 1
            );


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
    // RABAIS
    // =====================================================

    const handleRabaisChange = (
        event
    ) => {

        const value =
            event.target.value;

        setForm(previous => ({

            ...previous,

            rabais: value
        }));
    };


    // =====================================================
    // TYPE RABAIS
    // =====================================================

    const handleTypeRabaisChange = (
        event
    ) => {

        const type =
            event.target.value;

        setForm(previous => ({

            ...previous,

            type_rabais: type,

            // Lorsque l'on change
            // de type, on repart
            // proprement à zéro.
            rabais: 0
        }));
    };


    // =====================================================
    // AJOUTER PRODUIT
    // =====================================================

    const ajouterProduit = () => {

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

    const supprimerProduit = (
        index
    ) => {

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
    // PRODUITS DISPONIBLES
    // =====================================================

    const produitsDisponibles = (
        index
    ) => {

        const produitsSelectionnes =
            form.details
                .map(
                    (detail, i) =>
                        i === index
                            ? null
                            : Number(
                                detail.id_produit
                            )
                )
                .filter(Boolean);


        return produits.filter(
            produit =>
                !produitsSelectionnes.includes(
                    produit.id_produit
                )
        );
    };


    // =====================================================
    // TOTAL BRUT
    // =====================================================

    const totalBrutFormulaire = useMemo(() => {

        return form.details.reduce(
            (total, detail) => {

                const produit =
                    produits.find(
                        p =>
                            p.id_produit ===
                            Number(
                                detail.id_produit
                            )
                    );


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

    }, [
        form.details,
        produits
    ]);


    // =====================================================
    // MONTANT RABAIS
    // =====================================================

    const montantRabaisFormulaire =
        useMemo(() => {

            const rabais =
                Math.max(
                    0,
                    Number(
                        form.rabais || 0
                    )
                );


            if (
                form.type_rabais ===
                "POURCENTAGE"
            ) {

                return Math.min(
                    totalBrutFormulaire,

                    totalBrutFormulaire *
                    rabais /
                    100
                );
            }


            return Math.min(
                totalBrutFormulaire,
                rabais
            );

        }, [
            form.rabais,
            form.type_rabais,
            totalBrutFormulaire
        ]);


    // =====================================================
    // TOTAL FINAL
    // =====================================================

    const totalFormulaire =
        Math.max(
            0,
            totalBrutFormulaire -
            montantRabaisFormulaire
        );


    // =====================================================
    // VALIDATION FORMULAIRE
    // =====================================================

    const validerFormulaire = () => {

        if (!form.id_client) {

            setError(
                "Veuillez sélectionner un client."
            );

            return false;
        }


        if (!form.details.length) {

            setError(
                "La vente doit contenir au moins un produit."
            );

            return false;
        }


        for (
            const detail
            of form.details
        ) {

            if (!detail.id_produit) {

                setError(
                    "Veuillez sélectionner tous les produits."
                );

                return false;
            }


            if (
                !detail.quantite ||
                Number(detail.quantite) <= 0
            ) {

                setError(
                    "La quantité doit être supérieure à 0."
                );

                return false;
            }
        }


        // =================================================
        // VALIDATION RABAIS
        // =================================================

        const rabais =
            Number(
                form.rabais || 0
            );


        if (rabais < 0) {

            setError(
                "Le rabais ne peut pas être négatif."
            );

            return false;
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

            return false;
        }


        if (
            form.type_rabais ===
            "MONTANT"
            &&
            rabais > totalBrutFormulaire
        ) {

            setError(
                "Le rabais ne peut pas être supérieur au total de la vente."
            );

            return false;
        }


        if (
            !currentUser?.id_utilisateur
        ) {

            setError(
                "Impossible d'identifier l'utilisateur connecté."
            );

            return false;
        }


        return true;
    };


    // =====================================================
    // DEMANDER CREATION
    // =====================================================

    const demanderCreation = () => {

        setError("");


        if (
            !validerFormulaire()
        ) {

            return;
        }


        const rabais =
            Number(
                form.rabais || 0
            );


        const messageRabais =
            rabais > 0

                ? form.type_rabais ===
                    "POURCENTAGE"

                    ? `Rabais : ${rabais.toFixed(2)} %`

                    : `Rabais : ${formatMoney(rabais)}`

                : "Aucun rabais";


        setConfirmModal({

            open: true,

            type: "warning",

            title:
                "Créer la vente ?",

            message:
                `Total brut : ${formatMoney(totalBrutFormulaire)}\n` +
                `${messageRabais}\n` +
                `Total final : ${formatMoney(totalFormulaire)}`,

            confirmText:
                "Créer la vente",

            action:
                createVenteConfirmed
        });
    };


    // =====================================================
    // CREER VENTE
    // =====================================================

    const createVenteConfirmed =
        async () => {

            try {

                setConfirmLoading(true);

                setCreating(true);

                setError("");


                // -------------------------------------------------
                // DONNEES ENVOYEES AU BACKEND
                // -------------------------------------------------

                const data = {

                    id_client:
                        Number(
                            form.id_client
                        ),

                    id_utilisateur:
                        Number(
                            currentUser.id_utilisateur
                        ),


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
                        ),


                    statut:
                        "EN_COURS",


                    // -------------------------------------------------
                    // RABAIS
                    // -------------------------------------------------

                    rabais:
                        Number(
                            form.rabais || 0
                        ),

                    type_rabais:
                        form.type_rabais
                };


                console.log(
                    "DEBUT CREATION VENTE"
                );


                console.log(
                    "DONNEES ENVOYEES :",
                    data
                );


                // -------------------------------------------------
                // APPEL API
                // -------------------------------------------------

                const vente =
                    await createVente(
                        data
                    );


                console.log(
                    "VENTE CREEE :",
                    vente
                );


                // -------------------------------------------------
                // FERMER MODAL CONFIRMATION
                // -------------------------------------------------

                setConfirmModal({

                    open: false,

                    type: "warning",

                    title: "",

                    message: "",

                    confirmText:
                        "Confirmer",

                    action: null
                });


                // -------------------------------------------------
                // FERMER MODAL CREATION
                // -------------------------------------------------

                setShowCreateModal(
                    false
                );


                // -------------------------------------------------
                // RESET FORMULAIRE
                // -------------------------------------------------

                resetForm();


                // -------------------------------------------------
                // RECHARGER LES DONNEES
                // -------------------------------------------------

                await chargerDonnees();


                // -------------------------------------------------
                // OUVRIR LE MODAL DE PAIEMENT
                // -------------------------------------------------

                demanderPaiement(
                    vente
                );


            } catch (err) {

                console.error(
                    "ERREUR CREATION VENTE :",
                    err
                );


                console.error(
                    "RESPONSE :",
                    err.response
                );


                console.error(
                    "DATA :",
                    err.response?.data
                );


                const message =
                    err.response?.data?.detail ||
                    "Impossible de créer la vente.";


                setError(
                    message
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

    const openVente =
        async (
            idVente
        ) => {

            try {

                setLoadingDetail(
                    true
                );

                setError("");


                const data =
                    await getVente(
                        idVente
                    );


                setSelectedVente(
                    data
                );


                setShowDetailModal(
                    true
                );


            } catch (err) {

                console.error(
                    "ERREUR DETAIL VENTE :",
                    err
                );


                setError(
                    err.response?.data?.detail ||
                    "Impossible de charger la vente."
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

        if (loadingDetail) {
            return;
        }


        setShowDetailModal(
            false
        );


        setSelectedVente(
            null
        );
    };


    // =====================================================
    // DEMANDER PAIEMENT
    // =====================================================

    const demanderPaiement =
        async (
            vente
        ) => {

            setError("");


            let fullVente =
                vente;


            if (
                !fullVente.details ||
                fullVente.details.length === 0
            ) {

                try {

                    fullVente =
                        await getVente(
                            vente.id_vente
                        );

                } catch (err) {

                    console.warn(
                        "Impossible de précharger les détails complets de la vente:",
                        err
                    );
                }
            }


            setPaymentModal({

                open: true,

                vente:
                    fullVente,

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

            vente: null,

            loading: false
        });
    };


    // =====================================================
    // CONFIRMER PAIEMENT VENTE
    // =====================================================

    const handleConfirmPaymentVente =
        async ({
            mode_paiement,
            montant
        }) => {

            if (
                !paymentModal.vente
            ) {

                return;
            }


            setPaymentModal(
                prev => ({

                    ...prev,

                    loading: true
                })
            );


            try {

                // =================================================
                // CREER PAIEMENT
                // =================================================

                await createPaiement({

                    id_vente:
                        paymentModal
                            .vente
                            .id_vente,

                    id_utilisateur:
                        currentUser?.id_utilisateur ||
                        paymentModal
                            .vente
                            .id_utilisateur,

                    montant:
                        Number(
                            montant
                        ),

                    mode_paiement
                });


                // =================================================
                // RECUPERER VENTE MISE A JOUR
                // =================================================

                const updated =
                    await getVente(
                        paymentModal
                            .vente
                            .id_vente
                    );


                // =================================================
                // METTRE A JOUR LISTE
                // =================================================

                setVentes(
                    prev =>
                        prev.map(
                            item =>
                                item.id_vente ===
                                updated.id_vente

                                    ? updated

                                    : item
                        )
                );


                // =================================================
                // METTRE A JOUR DETAIL
                // =================================================

                if (
                    selectedVente &&
                    selectedVente.id_vente ===
                    updated.id_vente
                ) {

                    setSelectedVente(
                        updated
                    );
                }


                // =================================================
                // GARDER LE MODAL OUVERT POUR PROPOSER L'IMPRESSION
                // =================================================

                setPaymentModal(prev => ({
                    ...prev,
                    loading: false
                }));

                return updated;

            } catch (err) {

                setPaymentModal(
                    prev => ({

                        ...prev,

                        loading: false
                    })
                );


                throw err;
            }
        };


    // =====================================================
    // DEMANDER ANNULATION
    // =====================================================

    const demanderAnnulation =
        (
            vente
        ) => {

            setConfirmModal({

                open: true,

                type: "warning",

                title:
                    "Annuler la vente ?",

                message:
                    `La vente #${vente.id_vente} sera définitivement annulée.`,

                confirmText:
                    "Annuler la vente",

                action:
                    () =>
                        annulerVente(
                            vente
                        )
            });
        };


    // =====================================================
    // ANNULER VENTE
    // =====================================================

    const annulerVente =
        async (
            vente
        ) => {

            try {

                setConfirmLoading(
                    true
                );

                setError("");


                const updated =
                    await updateVente(

                        vente.id_vente,

                        {
                            statut:
                                "ANNULEE"
                        }
                    );


                setVentes(
                    previous =>
                        previous.map(
                            item =>
                                item.id_vente ===
                                updated.id_vente

                                    ? updated

                                    : item
                        )
                );


                if (
                    selectedVente &&
                    selectedVente.id_vente ===
                    updated.id_vente
                ) {

                    setSelectedVente(
                        previous => ({

                            ...previous,

                            ...updated
                        })
                    );
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


            } catch (err) {

                console.error(
                    "ERREUR ANNULATION :",
                    err
                );


                setError(
                    err.response?.data?.detail ||
                    "Impossible d'annuler la vente."
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
            }
        };


    // =====================================================
    // RECHERCHE
    // =====================================================

    const ventesFiltrees =
        useMemo(() => {

            const valeur =
                search
                    .trim()
                    .toLowerCase();


            if (!valeur) {

                return ventes;
            }


            return ventes.filter(
                vente => {

                    const client =
                        clients.find(
                            c =>
                                c.id_client ===
                                vente.id_client
                        );


                    const nomClient =
                        client
                            ? `${client.nom} ${client.prenom}`
                            : "";


                    return (

                        String(
                            vente.id_vente
                        )
                            .toLowerCase()
                            .includes(
                                valeur
                            )

                        ||

                        nomClient
                            .toLowerCase()
                            .includes(
                                valeur
                            )

                        ||

                        String(
                            vente.statut
                        )
                            .toLowerCase()
                            .includes(
                                valeur
                            )
                    );
                }
            );

        }, [
            ventes,
            clients,
            search
        ]);


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const statistiques =
        useMemo(() => {

            const enCours =
                ventes.filter(
                    v =>
                        v.statut ===
                        "EN_COURS"
                ).length;


            const payees =
                ventes.filter(
                    v =>
                        v.statut ===
                        "PAYEE"
                );


            const annulees =
                ventes.filter(
                    v =>
                        v.statut ===
                        "ANNULEE"
                ).length;


            const chiffreAffaires =
                payees.reduce(
                    (
                        total,
                        vente
                    ) =>
                        total +
                        Number(
                            vente.total ||
                            0
                        ),

                    0
                );


            return {

                total:
                    ventes.length,

                enCours,

                payees:
                    payees.length,

                annulees,

                chiffreAffaires
            };

        }, [
            ventes
        ]);


    // =====================================================
    // NOM CLIENT
    // =====================================================

    const getClientName =
        (
            idClient
        ) => {

            const client =
                clients.find(
                    c =>
                        c.id_client ===
                        idClient
                );


            if (!client) {

                return `Client #${idClient}`;
            }


            return `${client.nom} ${client.prenom}`;
        };


    // // =====================================================
    // // FORMAT MONNAIE
    // // =====================================================

    // const formatMoney =
    //     (
    //         value
    //     ) => {

    //         return (

    //             Number(
    //                 value || 0
    //             ).toLocaleString(
    //                 "fr-FR",
    //                 {

    //                     minimumFractionDigits:
    //                         2,

    //                     maximumFractionDigits:
    //                         2
    //                 }
    //             ) + " $"
    //         );
    //     };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate =
        (
            date
        ) => {

            if (!date) {

                return "—";
            }


            return new Date(
                date
            ).toLocaleDateString(
                "fr-FR",
                {

                    day: "2-digit",

                    month: "2-digit",

                    year: "numeric",

                    hour: "2-digit",

                    minute: "2-digit"
                }
            );
        };


    // =====================================================
    // STATUS CLASS
    // =====================================================

    const getStatusClass =
        (
            statut
        ) => {

            switch (statut) {

                case "PAYEE":

                    return "paid";

                case "ANNULEE":

                    return "cancelled";

                default:

                    return "pending";
            }
        };


    // =====================================================
    // STATUS LABEL
    // =====================================================

    const getStatusLabel =
        (
            statut
        ) => {

            switch (statut) {

                case "PAYEE":

                    return "Payée";

                case "ANNULEE":

                    return "Annulée";

                default:

                    return "En cours";
            }
        };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="ventes-page">

                <div className="vente-loading">

                    <Loader2
                        size={22}
                        className="spin"
                    />

                    <span>
                        Chargement des ventes...
                    </span>

                </div>

            </div>
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="ventes-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                {/* <div>

                    <h1 className="page-title">
                        Ventes
                    </h1>

                    <p className="page-description">
                        Gestion des ventes et des transactions
                    </p>

                </div> */}


                <button
                    className="btn btn-primary"
                    onClick={
                        openCreateModal
                    }
                >

                    <Plus size={17} />

                    Nouvelle vente

                </button>

            </div>


            {/* =================================================
                ERREUR
            ================================================= */}

            {error && (

                <div className="vente-error">
                    {error}
                </div>
            )}


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="stats-grid">


                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Total ventes
                        </span>

                        <strong className="stat-value">
                            {statistiques.total}
                        </strong>

                    </div>

                    <ShoppingCart
                        size={22}
                    />

                </div>


                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            En cours
                        </span>

                        <strong className="stat-value">
                            {statistiques.enCours}
                        </strong>

                    </div>

                    <RefreshCw
                        size={22}
                    />

                </div>


                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Payées
                        </span>

                        <strong className="stat-value">
                            {statistiques.payees}
                        </strong>

                    </div>

                    <Check
                        size={22}
                    />

                </div>


                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Chiffre d'affaires
                        </span>

                        <strong className="stat-value">

                            {
                                formatMoney(
                                    statistiques.chiffreAffaires
                                )
                            }

                        </strong>

                    </div>

                    <ShoppingCart
                        size={22}
                    />

                </div>

            </div>


            {/* =================================================
                BARRE RECHERCHE
            ================================================= */}

           <div className="toolbar">
    <div className="vente-search-wrapper">
        <Search size={17} />

        <input
            type="text"
            placeholder="Rechercher une vente..."
            value={search}
            onChange={e =>
                setSearch(
                    e.target.value
                )
            }
        />
    </div>

    <button
        className="btn btn-secondary"
        onClick={chargerDonnees}
        disabled={loading}
    >
        <RefreshCw
            size={16}
            className={loading ? "spin" : ""}
        />
        Actualiser
    </button>
</div>

            {/* =================================================
                TABLEAU
            ================================================= */}

            <div className="table-container">

                {ventesFiltrees.length === 0 ? (

                    <div className="vente-empty">

                        <ShoppingCart
                            size={35}
                        />

                        <h3>
                            Aucune vente
                        </h3>

                        <p>
                            Commencez par créer une nouvelle vente.
                        </p>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>
                                    #
                                </th>

                                <th>
                                    Client
                                </th>

                                <th>
                                    Date
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Statut
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {ventesFiltrees.map(
                                vente => (

                                    <tr
                                        key={
                                            vente.id_vente
                                        }
                                    >

                                        <td>

                                            <strong>
                                                #{vente.id_vente}
                                            </strong>

                                        </td>


                                        <td>

                                            <div className="vente-client">

                                                <User
                                                    size={16}
                                                />

                                                <span>

                                                    {
                                                        getClientName(
                                                            vente.id_client
                                                        )
                                                    }

                                                </span>

                                            </div>

                                        </td>


                                        <td>

                                            {
                                                formatDate(
                                                    vente.date_vente
                                                )
                                            }

                                        </td>


                                        <td>

                                            <strong>

                                                {
                                                    formatMoney(
                                                        vente.total
                                                    )
                                                }

                                            </strong>

                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    `vente-status ${getStatusClass(
                                                        vente.statut
                                                    )}`
                                                }
                                            >

                                                {
                                                    getStatusLabel(
                                                        vente.statut
                                                    )
                                                }

                                            </span>

                                        </td>


                                        <td>

                                            <div className="vente-actions">


                                                {/* VOIR */}

                                                <button
                                                    className="table-action view"
                                                    title="Voir"
                                                    onClick={() =>
                                                        openVente(
                                                            vente.id_vente
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={16}
                                                    />

                                                </button>


                                                {/* ACTIONS VENTE EN COURS */}

                                                {vente.statut ===
                                                    "EN_COURS" && (

                                                    <>

                                                        <button
                                                            className="table-action confirm"
                                                            title="Payer"
                                                            onClick={() =>
                                                                demanderPaiement(
                                                                    vente
                                                                )
                                                            }
                                                        >

                                                            <Check
                                                                size={16}
                                                            />

                                                        </button>


                                                        <button
                                                            className="table-action delete"
                                                            title="Annuler"
                                                            onClick={() =>
                                                                demanderAnnulation(
                                                                    vente
                                                                )
                                                            }
                                                        >

                                                            <Ban
                                                                size={16}
                                                            />

                                                        </button>

                                                    </>
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

                <div
                    className="modal-overlay"
                    onMouseDown={e => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            closeCreateModal();
                        }
                    }}
                >

                    <div className="client-modal vente-modal">


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nouvelle vente
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
                                disabled={
                                    creating
                                }
                            >

                                <X
                                    size={18}
                                />

                            </button>

                        </div>


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
                                disabled={
                                    creating
                                }
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
                                                client.nom
                                            }{" "}

                                            {
                                                client.prenom
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
                                        Ajoutez les produits vendus et leurs quantités.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        ajouterProduit
                                    }
                                    disabled={
                                        creating
                                    }
                                >

                                    <Plus
                                        size={15}
                                    />

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


                                        {/* PRODUIT */}

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
                                            disabled={
                                                creating
                                            }
                                        >

                                            <option value="">
                                                Sélectionner un produit
                                            </option>


                                            {produitsDisponibles(
                                                index
                                            ).map(
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
                                                            formatMoney(
                                                                produit.prix
                                                            )
                                                        }

                                                    </option>
                                                )
                                            )}

                                        </select>


                                        {/* QUANTITE */}

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
                                            disabled={
                                                creating
                                            }
                                        />


                                        {/* SUPPRIMER */}

                                        <button
                                            type="button"
                                            className="table-action delete"
                                            onClick={() =>
                                                supprimerProduit(
                                                    index
                                                )
                                            }
                                            disabled={
                                                creating ||
                                                form.details.length ===
                                                1
                                            }
                                            title="Retirer"
                                        >

                                            <Trash2
                                                size={15}
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
                                        Appliquez une réduction à la vente.
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
                                            handleTypeRabaisChange
                                        }
                                        disabled={
                                            creating
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

                                        {
                                            form.type_rabais ===
                                            "POURCENTAGE"

                                                ? "Pourcentage"
                                                : "Montant"
                                        }

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
                                            handleRabaisChange
                                        }
                                        disabled={
                                            creating
                                        }
                                        placeholder={
                                            form.type_rabais ===
                                            "POURCENTAGE"

                                                ? "Ex. 10"
                                                : "Ex. 50"
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
                                    flexDirection: "column",
                                    gap: "6px"
                                }}
                            >

                                <span>
                                    Total brut
                                </span>

                                <span>
                                    Rabais
                                </span>

                                <strong>
                                    Total à payer
                                </strong>

                            </div>


                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "6px",
                                    textAlign: "right"
                                }}
                            >

                                <span>
                                    {
                                        formatMoney(
                                            totalBrutFormulaire
                                        )
                                    }
                                </span>


                                <span>

                                    {form.type_rabais ===
                                    "POURCENTAGE"

                                        ? `- ${formatMoney(
                                            montantRabaisFormulaire
                                        )} (${Number(
                                            form.rabais || 0
                                        ).toFixed(2)} %)`
                                        
                                        : `- ${formatMoney(
                                            montantRabaisFormulaire
                                        )}`
                                    }

                                </span>


                                <strong>

                                    {
                                        formatMoney(
                                            totalFormulaire
                                        )
                                    }

                                </strong>

                            </div>

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
                                type="button"
                                className="btn btn-primary"
                                onClick={
                                    demanderCreation
                                }
                                disabled={
                                    creating ||
                                    !currentUser
                                }
                            >

                                {creating ? (

                                    <>

                                        <Loader2
                                            size={16}
                                            className="spin"
                                        />

                                        Création...

                                    </>

                                ) : (

                                    <>

                                        <ShoppingCart
                                            size={16}
                                        />

                                        Créer la vente

                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}


            {/* =================================================
                MODAL DETAIL
            ================================================= */}

            {showDetailModal &&
                selectedVente && (

                    <div
                        className="modal-overlay"
                        onMouseDown={e => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {

                                closeDetailModal();
                            }
                        }}
                    >

                        <div className="client-modal vente-detail-modal">


                            {/* HEADER */}

                            <div className="modal-header">

                                <div>

                                    <h2>

                                        Vente #
                                        {
                                            selectedVente.id_vente
                                        }

                                    </h2>

                                    <p>
                                        Détails de la transaction
                                    </p>

                                </div>


                                <button
                                    className="modal-close"
                                    onClick={
                                        closeDetailModal
                                    }
                                >

                                    <X
                                        size={18}
                                    />

                                </button>

                            </div>


                            {/* INFORMATIONS */}

                            <div className="vente-detail-top">


                                <div>

                                    <span className="detail-label">
                                        Client
                                    </span>

                                    <strong>

                                        {
                                            getClientName(
                                                selectedVente.id_client
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
                                                selectedVente.date_vente
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span className="detail-label">
                                        Statut
                                    </span>

                                    <strong
                                        className={
                                            `vente-status ${getStatusClass(
                                                selectedVente.statut
                                            )}`
                                        }
                                    >

                                        {
                                            getStatusLabel(
                                                selectedVente.statut
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span className="detail-label">
                                        Total
                                    </span>

                                    <strong>

                                        {
                                            formatMoney(
                                                selectedVente.total
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* PRODUITS */}

                            <div className="reservation-products-list">

                                {selectedVente.details?.length > 0 ? (

                                    selectedVente.details.map(
                                        detail => (

                                            <div
                                                className="reservation-product-row"
                                                key={
                                                    detail.id_detail_vente
                                                }
                                            >

                                                <div className="reservation-product-info">

                                                    <div className="reservation-product-icon">

                                                        <Package
                                                            size={16}
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
                                                                formatMoney(
                                                                    detail.prix_unitaire
                                                                )
                                                            }

                                                        </span>

                                                    </div>

                                                </div>


                                                <strong>

                                                    {
                                                        formatMoney(
                                                            detail.sous_total
                                                        )
                                                    }

                                                </strong>

                                            </div>
                                        )
                                    )

                                ) : (

                                    <div className="vente-empty">

                                        <Package
                                            size={30}
                                        />

                                        <p>
                                            Aucun produit dans cette vente.
                                        </p>

                                    </div>
                                )}

                            </div>


                            {/* =================================================
                                TOTAL DETAIL
                            ================================================= */}

                            <div className="reservation-total-row">

                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "5px"
                                    }}
                                >

                                    <span>
                                        Total brut
                                    </span>

                                    <span>
                                        Rabais
                                    </span>

                                    <strong>
                                        Total
                                    </strong>

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "5px",
                                        textAlign: "right"
                                    }}
                                >

                                    <span>

                                        {
                                            formatMoney(
                                                selectedVente.total_calcul
                                                    ? (
                                                        Number(
                                                            selectedVente.total_calcul
                                                        ) +
                                                        (
                                                            selectedVente.type_rabais ===
                                                            "POURCENTAGE"

                                                                ? Number(
                                                                    selectedVente.total_calcul
                                                                ) /
                                                                (
                                                                    1 -
                                                                    Number(
                                                                        selectedVente.rabais ||
                                                                        0
                                                                    ) /
                                                                    100
                                                                ) -
                                                                Number(
                                                                    selectedVente.total_calcul
                                                                )

                                                                : Number(
                                                                    selectedVente.rabais ||
                                                                    0
                                                                )
                                                        )
                                                    )
                                                    : selectedVente.total
                                            )
                                        }

                                    </span>


                                    <span>

                                        -{" "}

                                        {
                                            selectedVente.type_rabais ===
                                            "POURCENTAGE"

                                                ? `${Number(
                                                    selectedVente.rabais ||
                                                    0
                                                ).toFixed(2)} %`

                                                : formatMoney(
                                                    selectedVente.rabais ||
                                                    0
                                                )
                                        }

                                    </span>


                                    <strong>

                                        {
                                            formatMoney(
                                                selectedVente.total
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                {selectedVente.statut ===
                                    "EN_COURS" && (

                                    <>

                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                demanderAnnulation(
                                                    selectedVente
                                                )
                                            }
                                        >

                                            <Ban
                                                size={16}
                                            />

                                            Annuler

                                        </button>


                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                demanderPaiement(
                                                    selectedVente
                                                )
                                            }
                                        >

                                            <Check
                                                size={16}
                                            />

                                            Marquer payée

                                        </button>

                                    </>
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

                        </div>

                    </div>
                )}


            {/* =================================================
                MODAL CONFIRMATION
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

                onCancel={() => {

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
                }}

            />


            {/* =================================================
                MODAL DE PAIEMENT
            ================================================= */}

            <PaymentModal

                open={
                    paymentModal.open
                }

                onClose={
                    closePaymentModal
                }

                title={
                    `Règlement — Vente #${paymentModal.vente?.id_vente || ""}`
                }

                clientName={
                    paymentModal.vente

                        ? getClientName(
                            paymentModal
                                .vente
                                .id_client
                        )

                        : ""
                }

                reference={
                    `Vente #${paymentModal.vente?.id_vente || ""}`
                }

                totalAmount={
                    paymentModal.vente?.total || 0
                }

                items={
                    paymentModal.vente?.details || []
                }

                onConfirmPayment={
                    handleConfirmPaymentVente
                }

                loading={
                    paymentModal.loading
                }

                companyName="LAZARE"
                userName={
                    currentUser
                        ? `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim() || currentUser.nom_utilisateur || currentUser.username || "Utilisateur connecté"
                        : "Utilisateur connecté"
                }

            />

        </div>
    );
}


export default Ventes;