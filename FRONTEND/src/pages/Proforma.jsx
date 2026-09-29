import { useEffect, useMemo, useState } from "react";

import {
    Eye,
    Plus,
    Search,
    X,
    FileText,
    Package,
    User,
    Loader2,
    Trash2,
    RefreshCw,
    Check,
    Ban,
    Send,
    XCircle,
    Printer
} from "lucide-react";

import {
    getProformas,
    getProforma,
    createProforma,
    updateProforma
} from "../services/proformaService";

import { getClients } from "../services/clientService";
import { getProduits } from "../services/produitService";
import { getCurrentUser } from "../services/authService";

import ConfirmModal from "../components/ConfirmModal";

import "./Proformas.css";


function Proformas() {

    // =====================================================
    // DONNEES
    // =====================================================

    const [proformas, setProformas] = useState([]);
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

    const [selectedProforma, setSelectedProforma] =
        useState(null);

    const [createdProforma, setCreatedProforma] =
        useState(null);  


    // =====================================================
    // FORMULAIRE
    // =====================================================

    const [form, setForm] = useState({

        id_client: "",

        date_validite: "",

        details: [
            {
                id_produit: "",
                quantite: 1
            }
        ],

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
    // CHARGER LES DONNEES
    // =====================================================

    const chargerDonnees = async () => {

        try {

            setLoading(true);

            setError("");

            const [
                proformasData,
                clientsData,
                produitsData,
                currentUserData
            ] = await Promise.all([

                getProformas(),

                getClients(),

                getProduits(),

                getCurrentUser()
            ]);


            setProformas(
                Array.isArray(proformasData)
                    ? proformasData
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
                "ERREUR CHARGEMENT PROFORMAS :",
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

            date_validite: "",

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
    // DATE VALIDITE
    // =====================================================

    const handleDateValiditeChange = (event) => {

        setForm(previous => ({

            ...previous,

            date_validite:
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

    const totalBrutFormulaire =
        useMemo(() => {

            return form.details.reduce(
                (
                    total,
                    detail
                ) => {

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
                "La proforma doit contenir au moins un produit."
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
                "Le rabais ne peut pas être supérieur au total de la proforma."
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
                "Créer la proforma ?",

            message:
                `Total brut : ${formatMoney(totalBrutFormulaire)}\n` +
                `${messageRabais}\n` +
                `Total final : ${formatMoney(totalFormulaire)}`,

            confirmText:
                "Créer la proforma",

            action:
                createProformaConfirmed
        });
    };


    // =====================================================
    // CREER PROFORMA
    // =====================================================

    const createProformaConfirmed =
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


                    date_validite:
                        form.date_validite ||
                        null,


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
                        "BROUILLON",


                    rabais:
                        Number(
                            form.rabais || 0
                        ),


                    type_rabais:
                        form.type_rabais
                };


                console.log(
                    "DEBUT CREATION PROFORMA"
                );


                console.log(
                    "DONNEES ENVOYEES :",
                    data
                );


                // -------------------------------------------------
                // APPEL API
                // -------------------------------------------------

                const proforma =
                    await createProforma(
                        
                        data
                    );

                setCreatedProforma(proforma);    


                console.log(
                    "PROFORMA CREEE :",
                    proforma
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


            } catch (err) {

                console.error(
                    "ERREUR CREATION PROFORMA :",
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
                    "Impossible de créer la proforma.";


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

    const openProforma =
        async (
            idProforma
        ) => {

            try {

                setLoadingDetail(
                    true
                );

                setError("");


                const data =
                    await getProforma(
                        idProforma
                    );


                setSelectedProforma(
                    data
                );


                setShowDetailModal(
                    true
                );


            } catch (err) {

                console.error(
                    "ERREUR DETAIL PROFORMA :",
                    err
                );


                setError(
                    err.response?.data?.detail ||
                    "Impossible de charger la proforma."
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


        setSelectedProforma(
            null
        );
    };


    // =====================================================
    // DEMANDER CHANGEMENT STATUT
    // =====================================================

    const demanderChangementStatut =
        (
            proforma,
            nouveauStatut
        ) => {

            const labels = {

                ENVOYEE:
                    "envoyer",

                ACCEPTEE:
                    "accepter",

                REFUSEE:
                    "refuser",

                EXPIREE:
                    "marquer comme expirée",

                ANNULEE:
                    "annuler",

                CONVERTIE:
                    "convertir"
            };


            const label =
                labels[nouveauStatut] ||
                "modifier";


            setConfirmModal({

                open: true,

                type:
                    nouveauStatut ===
                    "ANNULEE"

                        ? "danger"

                        : "warning",

                title:
                    `${label.charAt(0).toUpperCase() + label.slice(1)} la proforma ?`,

                message:
                    `La proforma ${proforma.numero_proforma} passera au statut « ${getStatusLabel(nouveauStatut)} ».`,

                confirmText:
                    label.charAt(0).toUpperCase() +
                    label.slice(1),

                action:
                    () =>
                        changerStatut(
                            proforma,
                            nouveauStatut
                        )
            });
        };


    // =====================================================
    // CHANGER STATUT
    // =====================================================

    const changerStatut =
        async (
            proforma,
            nouveauStatut
        ) => {

            try {

                setConfirmLoading(
                    true
                );

                setError("");


                const updated =
                    await updateProforma(

                        proforma.id_proforma,

                        {
                            statut:
                                nouveauStatut
                        }
                    );


                // -------------------------------------------------
                // METTRE A JOUR LA LISTE
                // -------------------------------------------------

                setProformas(
                    previous =>
                        previous.map(
                            item =>
                                item.id_proforma ===
                                updated.id_proforma

                                    ? updated

                                    : item
                        )
                );


                // -------------------------------------------------
                // METTRE A JOUR LE DETAIL
                // -------------------------------------------------

                if (
                    selectedProforma &&
                    selectedProforma.id_proforma ===
                    updated.id_proforma
                ) {

                    setSelectedProforma(
                        previous => ({

                            ...previous,

                            ...updated
                        })
                    );
                }


                // -------------------------------------------------
                // FERMER CONFIRMATION
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


            } catch (err) {

                console.error(
                    "ERREUR CHANGEMENT STATUT :",
                    err
                );


                setError(
                    err.response?.data?.detail ||
                    "Impossible de modifier le statut."
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

    const proformasFiltrees =
        useMemo(() => {

            const valeur =
                search
                    .trim()
                    .toLowerCase();


            if (!valeur) {

                return proformas;
            }


            return proformas.filter(
                proforma => {

                    const client =
                        clients.find(
                            c =>
                                c.id_client ===
                                proforma.id_client
                        );


                    const nomClient =
                        client

                            ? `${client.nom} ${client.prenom}`

                            : "";


                    return (

                        String(
                            proforma.numero_proforma
                        )
                            .toLowerCase()
                            .includes(
                                valeur
                            )

                        ||

                        String(
                            proforma.id_proforma
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
                            proforma.statut
                        )
                            .toLowerCase()
                            .includes(
                                valeur
                            )
                    );
                }
            );

        }, [
            proformas,
            clients,
            search
        ]);


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const statistiques =
        useMemo(() => {

            const brouillons =
                proformas.filter(
                    p =>
                        p.statut ===
                        "BROUILLON"
                ).length;


            const envoyees =
                proformas.filter(
                    p =>
                        p.statut ===
                        "ENVOYEE"
                ).length;


            const acceptees =
                proformas.filter(
                    p =>
                        p.statut ===
                        "ACCEPTEE"
                ).length;


            const montantTotal =
                proformas
                    .filter(
                        p =>
                            p.statut !==
                            "ANNULEE" &&
                            p.statut !==
                            "REFUSEE"
                    )
                    .reduce(
                        (
                            total,
                            proforma
                        ) =>
                            total +
                            Number(
                                proforma.total ||
                                0
                            ),
                        0
                    );


            return {

                total:
                    proformas.length,

                brouillons,

                envoyees,

                acceptees,

                montantTotal
            };

        }, [
            proformas
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


    // =====================================================
    // FORMAT MONNAIE
    // =====================================================

    const formatMoney =
        (
            value
        ) => {

            return (

                Number(
                    value || 0
                ).toLocaleString(
                    "fr-FR",
                    {

                        minimumFractionDigits:
                            2,

                        maximumFractionDigits:
                            2
                    }
                ) + " $"
            );
        };


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

                    year: "numeric"
                }
            );
        };


    // =====================================================
    // FORMAT DATE + HEURE
    // =====================================================

    const formatDateTime =
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

                case "ACCEPTEE":
                    return "accepted";

                case "ENVOYEE":
                    return "sent";

                case "REFUSEE":
                    return "rejected";

                case "ANNULEE":
                    return "cancelled";

                case "EXPIREE":
                    return "expired";

                case "CONVERTIE":
                    return "converted";

                default:
                    return "draft";
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

                case "BROUILLON":
                    return "Brouillon";

                case "ENVOYEE":
                    return "Envoyée";

                case "ACCEPTEE":
                    return "Acceptée";

                case "REFUSEE":
                    return "Refusée";

                case "EXPIREE":
                    return "Expirée";

                case "ANNULEE":
                    return "Annulée";

                case "CONVERTIE":
                    return "Convertie";

                default:
                    return statut;
            }
        };



        // =====================================================
    // IMPRESSION PROFORMA A4
    // =====================================================

    const escapeHtml = (value) => {

        return String(
            value ?? ""
        )
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };


    const imprimerProforma = (
        proforma
    ) => {

        if (!proforma) {

            return;
        }


        const client =
            clients.find(
                c =>
                    c.id_client ===
                    proforma.id_client
            );


        const clientNom =
            client

                ? `${client.nom || ""} ${client.prenom || ""}`.trim()

                : `Client #${proforma.id_client}`;


        const clientTelephone =
            client?.telephone ||
            client?.phone ||
            client?.telephone_client ||
            "";


        const clientEmail =
            client?.email ||
            client?.email_client ||
            "";


        const rows =
            (proforma.details || [])
                .map(
                    detail => {

                        const sousTotal =
                            Number(
                                detail.sous_total ||
                                (
                                    Number(
                                        detail.prix_unitaire ||
                                        0
                                    ) *
                                    Number(
                                        detail.quantite ||
                                        0
                                    )
                                )
                            );


                        return `
                            <tr>

                                <td>
                                    ${escapeHtml(
                                        detail.nom_produit
                                    )}
                                </td>

                                <td class="center">
                                    ${Number(
                                        detail.quantite || 0
                                    )}
                                </td>

                                <td class="right">
                                    ${formatMoney(
                                        detail.prix_unitaire
                                    )}
                                </td>

                                <td class="right">
                                    ${formatMoney(
                                        sousTotal
                                    )}
                                </td>

                            </tr>
                        `;
                    }
                )
                .join("");


        const rabaisMontant =
            proforma.type_rabais ===
            "POURCENTAGE"

                ? Number(
                    proforma.total_calcul || 0
                ) *
                Number(
                    proforma.rabais || 0
                ) /
                100

                : Number(
                    proforma.rabais || 0
                );


        const totalBrut =
            Number(
                proforma.total_calcul || 0
            );


        const totalFinal =
            Number(
                proforma.total || 0
            );


        const dateCreation =
            formatDateTime(
                proforma.date_creation
            );


        const dateValidite =
            formatDate(
                proforma.date_validite
            );


        const statut =
            getStatusLabel(
                proforma.statut
            );


        const utilisateur =
            currentUser

                ? `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim()
                    ||
                    currentUser.nom_utilisateur
                    ||
                    currentUser.username
                    ||
                    "Utilisateur connecté"

                : "Utilisateur connecté";


        const w =
            window.open(
                "",
                "_blank",
                "width=1000,height=900,scrollbars=yes"
            );


        if (!w) {

            setError(
                "La fenêtre d'impression a été bloquée par le navigateur."
            );

            return;
        }


        w.document.write(`
<!DOCTYPE html>

<html lang="fr">

<head>

<meta charset="UTF-8">

<title>
    Proforma ${escapeHtml(
        proforma.numero_proforma
    )}
</title>


<style>

* {
    box-sizing: border-box;
}


html,
body {
    margin: 0;
    padding: 0;

    background: #ffffff;

    color: #111827;

    font-family:
        Arial,
        Helvetica,
        sans-serif;
}


@page {
    size: A4 portrait;

    margin: 12mm;
}


body {
    width: 100%;
}


.page {
    width: 100%;

    min-height: 100vh;

    padding: 0;
}


/* =====================================================
   HEADER
===================================================== */

.header {
    display: flex;

    justify-content: space-between;

    align-items: flex-start;

    gap: 30px;

    padding-bottom: 18px;

    border-bottom: 2px solid #111827;
}


.company {
    flex: 1;
}


.company-name {
    margin: 0 0 5px;

    font-size: 25px;

    font-weight: 800;

    letter-spacing: 0.5px;
}


.company-subtitle {
    margin: 0;

    color: #6b7280;

    font-size: 11px;
}


.document {
    min-width: 230px;

    text-align: right;
}


.document-title {
    margin: 0 0 5px;

    font-size: 26px;

    font-weight: 800;

    letter-spacing: 1px;
}


.document-number {
    margin: 0;

    font-size: 13px;

    font-weight: 700;
}


/* =====================================================
   INFORMATIONS
===================================================== */

.info-grid {

    display: grid;

    grid-template-columns:
        1fr
        1fr;

    gap: 15px;

    margin-top: 20px;

}


.info-box {

    padding: 12px;

    border: 1px solid #d1d5db;

    border-radius: 4px;
}


.info-title {

    margin-bottom: 8px;

    color: #6b7280;

    font-size: 10px;

    font-weight: 700;

    text-transform: uppercase;

    letter-spacing: 0.5px;
}


.info-main {

    margin-bottom: 4px;

    font-size: 14px;

    font-weight: 700;
}


.info-line {

    margin-top: 3px;

    color: #4b5563;

    font-size: 11px;
}


/* =====================================================
   TABLE
===================================================== */

.products {

    width: 100%;

    margin-top: 25px;

    border-collapse: collapse;

}


.products thead {

    background: #111827;

    color: #ffffff;

}


.products th {

    padding: 9px 8px;

    font-size: 10px;

    font-weight: 700;

    text-transform: uppercase;

    text-align: left;
}


.products td {

    padding: 10px 8px;

    border-bottom: 1px solid #e5e7eb;

    font-size: 11px;

    vertical-align: top;
}


.products tbody tr:nth-child(even) {

    background: #f9fafb;
}


.center {

    text-align: center !important;
}


.right {

    text-align: right !important;
}


/* =====================================================
   TOTAL
===================================================== */

.totals-wrapper {

    display: flex;

    justify-content: flex-end;

    margin-top: 20px;
}


.totals {

    width: 310px;

    border-top: 1px solid #d1d5db;
}


.total-line {

    display: flex;

    justify-content: space-between;

    gap: 30px;

    padding: 7px 0;

    border-bottom: 1px solid #e5e7eb;

    font-size: 11px;
}


.total-final {

    display: flex;

    justify-content: space-between;

    gap: 30px;

    margin-top: 4px;

    padding: 12px 0;

    border-top: 2px solid #111827;

    font-size: 16px;

    font-weight: 800;
}


/* =====================================================
   STATUT
===================================================== */

.status {

    display: inline-block;

    margin-top: 20px;

    padding: 6px 12px;

    border: 1px solid #d1d5db;

    border-radius: 20px;

    font-size: 10px;

    font-weight: 700;

    text-transform: uppercase;
}


/* =====================================================
   CONDITIONS
===================================================== */

.conditions {

    margin-top: 25px;

    padding: 12px;

    border: 1px solid #e5e7eb;

    background: #f9fafb;
}


.conditions-title {

    margin-bottom: 5px;

    font-size: 11px;

    font-weight: 700;
}


.conditions-text {

    color: #4b5563;

    font-size: 10px;

    line-height: 1.5;
}


/* =====================================================
   SIGNATURE
===================================================== */

.signature-area {

    display: grid;

    grid-template-columns:
        1fr
        1fr;

    gap: 80px;

    margin-top: 50px;
}


.signature {

    padding-top: 35px;

    border-top: 1px solid #9ca3af;

    text-align: center;

    color: #4b5563;

    font-size: 10px;
}


/* =====================================================
   FOOTER
===================================================== */

.footer {

    margin-top: 40px;

    padding-top: 10px;

    border-top: 1px solid #d1d5db;

    color: #6b7280;

    font-size: 9px;

    text-align: center;

    line-height: 1.5;
}


/* =====================================================
   PRINT
===================================================== */

@media print {

    html,
    body {

        width: 210mm;

        min-height: 297mm;

    }


    .page {

        min-height: 273mm;

    }


    .products {

        page-break-inside: auto;

    }


    .products tr {

        page-break-inside: avoid;

        page-break-after: auto;

    }


    .totals-wrapper {

        page-break-inside: avoid;

    }


    .signature-area {

        page-break-inside: avoid;

    }


    .footer {

        page-break-inside: avoid;

    }

}

</style>

</head>


<body>

<div class="page">


    <!-- =================================================
         HEADER
    ================================================= -->

    <div class="header">


        <div class="company">

            <h1 class="company-name">
                TMACKEN SYSTEM
            </h1>

            <p class="company-subtitle">
                Gestion commerciale
            </p>

        </div>


        <div class="document">

            <h2 class="document-title">
                PROFORMA
            </h2>

            <p class="document-number">
                ${escapeHtml(
                    proforma.numero_proforma
                )}
            </p>

        </div>


    </div>


    <!-- =================================================
         INFORMATIONS
    ================================================= -->

    <div class="info-grid">


        <div class="info-box">

            <div class="info-title">
                Client
            </div>


            <div class="info-main">
                ${escapeHtml(
                    clientNom
                )}
            </div>


            ${
                clientTelephone
                    ? `
                        <div class="info-line">
                            Téléphone :
                            ${escapeHtml(
                                clientTelephone
                            )}
                        </div>
                    `
                    : ""
            }


            ${
                clientEmail
                    ? `
                        <div class="info-line">
                            Email :
                            ${escapeHtml(
                                clientEmail
                            )}
                        </div>
                    `
                    : ""
            }

        </div>


        <div class="info-box">

            <div class="info-title">
                Informations
            </div>


            <div class="info-line">

                <strong>
                    Date de création :
                </strong>

                ${escapeHtml(
                    dateCreation
                )}

            </div>


            <div class="info-line">

                <strong>
                    Date de validité :
                </strong>

                ${escapeHtml(
                    dateValidite
                )}

            </div>


            <div class="info-line">

                <strong>
                    Statut :
                </strong>

                ${escapeHtml(
                    statut
                )}

            </div>


            <div class="info-line">

                <strong>
                    Préparée par :
                </strong>

                ${escapeHtml(
                    utilisateur
                )}

            </div>

        </div>

    </div>


    <!-- =================================================
         PRODUITS
    ================================================= -->

    <table class="products">


        <thead>

            <tr>

                <th>
                    Désignation
                </th>

                <th
                    class="center"
                    style="width: 70px;"
                >
                    Qté
                </th>

                <th
                    class="right"
                    style="width: 120px;"
                >
                    Prix unitaire
                </th>

                <th
                    class="right"
                    style="width: 130px;"
                >
                    Sous-total
                </th>

            </tr>

        </thead>


        <tbody>

            ${
                rows ||

                `
                    <tr>

                        <td
                            colspan="4"
                            class="center"
                        >
                            Aucun produit.
                        </td>

                    </tr>
                `
            }

        </tbody>

    </table>


    <!-- =================================================
         TOTAUX
    ================================================= -->

    <div class="totals-wrapper">

        <div class="totals">


            <div class="total-line">

                <span>
                    Total brut
                </span>

                <strong>
                    ${formatMoney(
                        totalBrut
                    )}
                </strong>

            </div>


            <div class="total-line">

                <span>

                    Rabais

                    ${
                        proforma.type_rabais ===
                        "POURCENTAGE"

                            ? `(${Number(
                                proforma.rabais ||
                                0
                            ).toFixed(2)} %)`
                            : ""
                    }

                </span>


                <strong>

                    - ${formatMoney(
                        rabaisMontant
                    )}

                </strong>

            </div>


            <div class="total-final">

                <span>
                    TOTAL
                </span>

                <span>
                    ${formatMoney(
                        totalFinal
                    )}
                </span>

            </div>

        </div>

    </div>


    <!-- =================================================
         STATUT
    ================================================= -->

    <div>

        <span class="status">

            Statut :

            ${escapeHtml(
                statut
            )}

        </span>

    </div>


    <!-- =================================================
         CONDITIONS
    ================================================= -->

    <div class="conditions">

        <div class="conditions-title">

            Conditions de la proforma

        </div>


        <div class="conditions-text">

            Cette proforma constitue une proposition commerciale.
            Les prix et conditions sont valables jusqu'à la date
            de validité indiquée ci-dessus.

        </div>

    </div>


    <!-- =================================================
         SIGNATURES
    ================================================= -->

    <div class="signature-area">


        <div class="signature">

            Signature du client

        </div>


        <div class="signature">

            Signature / cachet

        </div>


    </div>


    <!-- =================================================
         FOOTER
    ================================================= -->

    <div class="footer">

        Proforma :

        ${escapeHtml(
            proforma.numero_proforma
        )}

        ·

        Document généré le

        ${escapeHtml(
            formatDateTime(
                new Date()
            )
        )}

        <br>

        Merci pour votre confiance.

    </div>


</div>


<script>

window.onload = function() {

    setTimeout(
        function() {

            window.print();

        },
        300
    );

};

window.onafterprint = function() {

    setTimeout(
        function() {

            window.close();

        },
        300
    );

};

</script>


</body>

</html>
        `);


        w.document.close();
    };






    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="proformas-page">

                <div className="proforma-loading">

                    <Loader2
                        size={22}
                        className="spin"
                    />

                    <span>
                        Chargement des proformas...
                    </span>

                </div>

            </div>
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="proformas-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    <h1 className="page-title">
                        Proformas
                    </h1>

                    <p className="page-description">
                        Gestion des devis et propositions commerciales
                    </p>

                </div>


                <button
                    className="btn btn-primary"
                    onClick={
                        openCreateModal
                    }
                >

                    <Plus
                        size={17}
                    />

                    Nouvelle proforma

                </button>

            </div>


            {/* =================================================
                ERREUR
            ================================================= */}

            {error && (

                <div className="proforma-error">
                    {error}
                </div>

            )}


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="stats-grid">


                {/* TOTAL */}

                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Total proformas
                        </span>

                        <strong className="stat-value">
                            {
                                statistiques.total
                            }
                        </strong>

                    </div>

                    <FileText
                        size={22}
                    />

                </div>


                {/* BROUILLONS */}

                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Brouillons
                        </span>

                        <strong className="stat-value">
                            {
                                statistiques.brouillons
                            }
                        </strong>

                    </div>

                    <RefreshCw
                        size={22}
                    />

                </div>


                {/* ENVOYEES */}

                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Envoyées
                        </span>

                        <strong className="stat-value">
                            {
                                statistiques.envoyees
                            }
                        </strong>

                    </div>

                    <Send
                        size={22}
                    />

                </div>


                {/* MONTANT */}

                <div className="stat-card">

                    <div>

                        <span className="stat-label">
                            Montant total
                        </span>

                        <strong className="stat-value">

                            {
                                formatMoney(
                                    statistiques.montantTotal
                                )
                            }

                        </strong>

                    </div>

                    <FileText
                        size={22}
                    />

                </div>

            </div>


            {/* =================================================
                BARRE RECHERCHE
            ================================================= */}

            <div className="toolbar">

                <div className="proforma-search-wrapper">

                    <Search
                        size={17}
                    />

                    <input
                        type="text"
                        placeholder="Rechercher une proforma..."
                        value={search}
                        onChange={
                            e =>
                                setSearch(
                                    e.target.value
                                )
                        }
                    />

                </div>

            </div>


            {/* =================================================
                TABLEAU
            ================================================= */}

            <div className="table-container">

                {proformasFiltrees.length === 0 ? (

                    <div className="proforma-empty">

                        <FileText
                            size={35}
                        />

                        <h3>
                            Aucune proforma
                        </h3>

                        <p>
                            Commencez par créer une nouvelle proforma.
                        </p>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>
                                    N°
                                </th>

                                <th>
                                    Client
                                </th>

                                <th>
                                    Création
                                </th>

                                <th>
                                    Validité
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

                            {proformasFiltrees.map(
                                proforma => (

                                    <tr
                                        key={
                                            proforma.id_proforma
                                        }
                                    >

                                        <td>

                                            <strong>
                                                {
                                                    proforma.numero_proforma
                                                }
                                            </strong>

                                        </td>


                                        <td>

                                            <div className="proforma-client">

                                                <User
                                                    size={16}
                                                />

                                                <span>

                                                    {
                                                        getClientName(
                                                            proforma.id_client
                                                        )
                                                    }

                                                </span>

                                            </div>

                                        </td>


                                        <td>

                                            {
                                                formatDateTime(
                                                    proforma.date_creation
                                                )
                                            }

                                        </td>


                                        <td>

                                            {
                                                formatDate(
                                                    proforma.date_validite
                                                )
                                            }

                                        </td>


                                        <td>

                                            <strong>

                                                {
                                                    formatMoney(
                                                        proforma.total
                                                    )
                                                }

                                            </strong>

                                        </td>


                                        <td>

                                            <span
                                                className={
                                                    `proforma-status ${getStatusClass(
                                                        proforma.statut
                                                    )}`
                                                }
                                            >

                                                {
                                                    getStatusLabel(
                                                        proforma.statut
                                                    )
                                                }

                                            </span>

                                        </td>


                                        <td>

                                            <div className="proforma-actions">


                                                {/* VOIR */}

                                                <button
                                                    className="table-action view"
                                                    title="Voir"
                                                    onClick={() =>
                                                        openProforma(
                                                            proforma.id_proforma
                                                        )
                                                    }
                                                >

                                                    <Eye
                                                        size={16}
                                                    />

                                                </button>


                                                {/* BROUILLON → ENVOYEE */}

                                                {proforma.statut ===
                                                    "BROUILLON" && (

                                                    <button
                                                        className="table-action confirm"
                                                        title="Envoyer"
                                                        onClick={() =>
                                                            demanderChangementStatut(
                                                                proforma,
                                                                "ENVOYEE"
                                                            )
                                                        }
                                                    >

                                                        <Send
                                                            size={16}
                                                        />

                                                    </button>

                                                )}


                                                {/* ENVOYEE → ACCEPTEE */}

                                                {proforma.statut ===
                                                    "ENVOYEE" && (

                                                    <button
                                                        className="table-action confirm"
                                                        title="Accepter"
                                                        onClick={() =>
                                                            demanderChangementStatut(
                                                                proforma,
                                                                "ACCEPTEE"
                                                            )
                                                        }
                                                    >

                                                        <Check
                                                            size={16}
                                                        />

                                                    </button>

                                                )}


                                                {/* ANNULER */}

                                                {(
                                                    proforma.statut ===
                                                        "BROUILLON"
                                                    ||
                                                    proforma.statut ===
                                                        "ENVOYEE"
                                                    ||
                                                    proforma.statut ===
                                                        "ACCEPTEE"
                                                ) && (

                                                    <button
                                                        className="table-action delete"
                                                        title="Annuler"
                                                        onClick={() =>
                                                            demanderChangementStatut(
                                                                proforma,
                                                                "ANNULEE"
                                                            )
                                                        }
                                                    >

                                                        <Ban
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

                <div
                    className="modal-overlay"
                    onMouseDown={
                        e => {

                            if (
                                e.target ===
                                e.currentTarget
                            ) {

                                closeCreateModal();
                            }
                        }
                    }
                >

                    <div className="client-modal proforma-modal">


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nouvelle proforma
                                </h2>

                                <p>
                                    Ajoutez le client, les produits, la validité et le rabais.
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


                        {/* DATE VALIDITE */}

                        <div className="form-group">

                            <label className="form-label">
                                Date de validité
                            </label>

                            <input
                                type="date"
                                className="form-input"
                                value={
                                    form.date_validite
                                }
                                onChange={
                                    handleDateValiditeChange
                                }
                                disabled={
                                    creating
                                }
                            />

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
                                            onChange={
                                                e =>
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
                                            onChange={
                                                e =>
                                                    handleQuantityChange(
                                                        index,
                                                        e.target.value
                                                    )
                                            }
                                            disabled={
                                                creating
                                            }
                                        />


                                        {/* SOUS TOTAL */}

                                        <span className="proforma-line-total">

                                            {
                                                formatMoney(
                                                    (
                                                        produits.find(
                                                            p =>
                                                                p.id_produit ===
                                                                Number(
                                                                    detail.id_produit
                                                                )
                                                        )?.prix || 0
                                                    ) *
                                                    Number(
                                                        detail.quantite || 0
                                                    )
                                                )
                                            }

                                        </span>


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
                                        Appliquez une réduction à la proforma.
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
                                    Total proforma
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

                                        <FileText
                                            size={16}
                                        />

                                        Créer la proforma

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
                selectedProforma && (

                    <div
                        className="modal-overlay"
                        onMouseDown={
                            e => {

                                if (
                                    e.target ===
                                    e.currentTarget
                                ) {

                                    closeDetailModal();
                                }
                            }
                        }
                    >

                        <div className="client-modal proforma-detail-modal">


                            {/* HEADER */}

                            <div className="modal-header">

                                <div>

                                    <h2>

                                        Proforma{" "}

                                        {
                                            selectedProforma.numero_proforma
                                        }

                                    </h2>

                                    <p>
                                        Détails de la proposition commerciale
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

                            <div className="proforma-detail-top">


                                <div>

                                    <span className="detail-label">
                                        Client
                                    </span>

                                    <strong>

                                        {
                                            getClientName(
                                                selectedProforma.id_client
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span className="detail-label">
                                        Date de création
                                    </span>

                                    <strong>

                                        {
                                            formatDateTime(
                                                selectedProforma.date_creation
                                            )
                                        }

                                    </strong>

                                </div>


                                <div>

                                    <span className="detail-label">
                                        Validité
                                    </span>

                                    <strong>

                                        {
                                            formatDate(
                                                selectedProforma.date_validite
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
                                            `proforma-status ${getStatusClass(
                                                selectedProforma.statut
                                            )}`
                                        }
                                    >

                                        {
                                            getStatusLabel(
                                                selectedProforma.statut
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* PRODUITS */}

                            <div className="reservation-products-list">

                                {selectedProforma.details?.length > 0 ? (

                                    selectedProforma.details.map(
                                        detail => (

                                            <div
                                                className="reservation-product-row"
                                                key={
                                                    detail.id_detail_proforma
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

                                    <div className="proforma-empty">

                                        <Package
                                            size={30}
                                        />

                                        <p>
                                            Aucun produit dans cette proforma.
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
                                                selectedProforma.total_calcul
                                            )
                                        }

                                    </span>


                                    <span>

                                        -{" "}

                                        {
                                            selectedProforma.type_rabais ===
                                            "POURCENTAGE"

                                                ? `${Number(
                                                    selectedProforma.rabais ||
                                                    0
                                                ).toFixed(2)} %`

                                                : formatMoney(
                                                    selectedProforma.rabais ||
                                                    0
                                                )
                                        }

                                    </span>


                                    <strong>

                                        {
                                            formatMoney(
                                                selectedProforma.total
                                            )
                                        }

                                    </strong>

                                </div>

                            </div>


                            {/* =================================================
                                ACTIONS STATUT
                            ================================================= */}

                            <div className="modal-actions">


                                <button
                                    className="btn btn-secondary"
                                    onClick={() =>
                                        imprimerProforma(
                                            selectedProforma
                                        )
                                    }
                                >
                                    <Printer
                                        size={16}
                                    />

                                    Imprimer
                                </button>


                                {/* BROUILLON */}

                                {selectedProforma.statut ===
                                    "BROUILLON" && (

                                    <>

                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                demanderChangementStatut(
                                                    selectedProforma,
                                                    "ENVOYEE"
                                                )
                                            }
                                        >

                                            <Send
                                                size={16}
                                            />

                                            Envoyer

                                        </button>


                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                demanderChangementStatut(
                                                    selectedProforma,
                                                    "ANNULEE"
                                                )
                                            }
                                        >

                                            <Ban
                                                size={16}
                                            />

                                            Annuler

                                        </button>

                                    </>

                                )}


                                {/* ENVOYEE */}

                                {selectedProforma.statut ===
                                    "ENVOYEE" && (

                                    <>

                                        <button
                                            className="btn btn-primary"
                                            onClick={() =>
                                                demanderChangementStatut(
                                                    selectedProforma,
                                                    "ACCEPTEE"
                                                )
                                            }
                                        >

                                            <Check
                                                size={16}
                                            />

                                            Accepter

                                        </button>


                                        <button
                                            className="btn btn-secondary"
                                            onClick={() =>
                                                demanderChangementStatut(
                                                    selectedProforma,
                                                    "REFUSEE"
                                                )
                                            }
                                        >

                                            <XCircle
                                                size={16}
                                            />

                                            Refuser

                                        </button>


                                        <button
                                            className="btn btn-danger"
                                            onClick={() =>
                                                demanderChangementStatut(
                                                    selectedProforma,
                                                    "ANNULEE"
                                                )
                                            }
                                        >

                                            <Ban
                                                size={16}
                                            />

                                            Annuler

                                        </button>

                                    </>

                                )}


                                {/* ACCEPTEE */}

                                {selectedProforma.statut ===
                                    "ACCEPTEE" && (

                                    <button
                                        className="btn btn-danger"
                                        onClick={() =>
                                            demanderChangementStatut(
                                                selectedProforma,
                                                "ANNULEE"
                                            )
                                        }
                                    >

                                        <Ban
                                            size={16}
                                        />

                                        Annuler

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

                        </div>

                    </div>

                )}


            {/* =================================================
                MODAL CONFIRMATION
            ================================================= */}


            {/* =================================================
    MODAL PROFORMA CRÉÉE
================================================= */}

{createdProforma && (

    <div
        className="modal-overlay"
        onMouseDown={() =>
            setCreatedProforma(null)
        }
    >

        <div
            className="proforma-success-modal"
            onMouseDown={e =>
                e.stopPropagation()
            }
        >

            <div className="proforma-success-icon">

                <Check size={30} />

            </div>


            <h2>
                Proforma créée avec succès
            </h2>


            <p>
                La proforma
                <strong>
                    {" "}
                    {createdProforma.numero_proforma}
                </strong>
                {" "}
                a été enregistrée.
            </p>


            <div className="proforma-success-total">

                <span>
                    Total
                </span>

                <strong>
                    {formatMoney(
                        createdProforma.total
                    )}
                </strong>

            </div>


            <div className="modal-actions">

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        setCreatedProforma(null)
                    }
                >
                    Fermer
                </button>


                <button
                    className="btn btn-primary"
                    onClick={() =>
                        imprimerProforma(
                            createdProforma
                        )
                    }
                >

                    <Printer size={17} />

                    Imprimer

                </button>

            </div>

        </div>

    </div>

)}

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

        </div>
    );
}


export default Proformas;