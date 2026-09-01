import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Package,
    AlertTriangle,
    CheckCircle2,
    XCircle
} from "lucide-react";

import {
    getProduits,
    createProduit,
    updateProduit,
    deleteProduit
} from "../services/produitService";

import ConfirmModal from "../components/ConfirmModal";


function Produits() {

    // =====================================================
    // PRODUITS
    // =====================================================

    const [produits, setProduits] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    // =====================================================
    // MODAL PRODUIT
    // =====================================================

    const [showModal, setShowModal] = useState(false);

    const [editingProduit, setEditingProduit] = useState(null);

    const [saving, setSaving] = useState(false);


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


    const [confirmLoading, setConfirmLoading] =
        useState(false);


    // =====================================================
    // FORMULAIRE
    // =====================================================

    const emptyForm = {

        nom: "",

        description: "",

        prix: "",

        seuil_alerte: "0",

        statut: true

    };


    const [form, setForm] = useState(emptyForm);


    // =====================================================
    // CHARGER PRODUITS
    // =====================================================

    const loadProduits = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getProduits();

            setProduits(data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Impossible de charger les produits."
            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadProduits();

    }, []);


    // =====================================================
    // RECHERCHE
    // =====================================================

    const filteredProduits = produits.filter(
        (produit) => {

            const value = search
                .toLowerCase()
                .trim();


            if (!value) {

                return true;

            }


            return (

                produit.nom
                    ?.toLowerCase()
                    .includes(value)

                ||

                produit.description
                    ?.toLowerCase()
                    .includes(value)

            );

        }
    );


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const totalProduits = produits.length;

    const produitsActifs =
        produits.filter(
            (produit) => produit.statut
        ).length;

    const produitsInactifs =
        produits.filter(
            (produit) => !produit.statut
        ).length;


    // =====================================================
    // FORMULAIRE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    const handleStatusChange = (event) => {

        setForm((previous) => ({

            ...previous,

            statut: event.target.checked

        }));

    };


    // =====================================================
    // OUVRIR CRÉATION
    // =====================================================

    const openCreateModal = () => {

        setEditingProduit(null);

        setForm(emptyForm);

        setError("");

        setShowModal(true);

    };


    // =====================================================
    // OUVRIR MODIFICATION
    // =====================================================

    const openEditModal = (produit) => {

        setEditingProduit(produit);

        setForm({

            nom: produit.nom || "",

            description:
                produit.description || "",

            prix:
                produit.prix ?? "",

            seuil_alerte:
                produit.seuil_alerte ?? 0,

            statut:
                produit.statut

        });

        setError("");

        setShowModal(true);

    };


    // =====================================================
    // FERMER MODAL PRODUIT
    // =====================================================

    const closeModal = () => {

        if (saving) {

            return;

        }


        setShowModal(false);

        setEditingProduit(null);

        setForm(emptyForm);

        setError("");

    };


    // =====================================================
    // FERMER CONFIRMATION
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
    // VALIDATION
    // =====================================================

    const validateForm = () => {

        if (!form.nom.trim()) {

            setError(
                "Le nom du produit est obligatoire."
            );

            return false;

        }


        if (
            form.prix === "" ||
            Number(form.prix) < 0
        ) {

            setError(
                "Le prix doit être supérieur ou égal à 0."
            );

            return false;

        }


        if (
            form.seuil_alerte === "" ||
            Number(form.seuil_alerte) < 0 ||
            !Number.isInteger(
                Number(form.seuil_alerte)
            )
        ) {

            setError(
                "Le seuil d'alerte doit être un nombre entier positif."
            );

            return false;

        }


        return true;

    };


    // =====================================================
    // SOUMISSION
    // =====================================================

    const handleSubmit = (event) => {

        event.preventDefault();

        setError("");


        if (!validateForm()) {

            return;

        }


        const data = {

            nom: form.nom.trim(),

            description:
                form.description.trim() || null,

            prix: Number(form.prix),

            seuil_alerte:
                Number(form.seuil_alerte),

            statut:
                Boolean(form.statut)

        };


        // =================================================
        // MODIFICATION
        // =================================================

        if (editingProduit) {

            setConfirmModal({

                open: true,

                type: "info",

                title: "Modifier ce produit ?",

                message:
                    `Voulez-vous enregistrer les modifications apportées à « ${editingProduit.nom} » ?`,

                confirmText: "Modifier",

                action: async () => {

                    try {

                        setConfirmLoading(true);

                        setError("");


                        const updatedProduit =
                            await updateProduit(

                                editingProduit.id_produit,

                                data

                            );


                        setProduits(
                            (previous) =>

                                previous.map(
                                    (produit) =>

                                        produit.id_produit ===
                                        editingProduit.id_produit

                                            ? updatedProduit

                                            : produit
                                )
                        );


                        setShowModal(false);

                        setEditingProduit(null);

                        setForm(emptyForm);

                        closeConfirmModal();


                    } catch (err) {

                        console.error(err);

                        setError(

                            err.response?.data?.detail ||

                            "Impossible de modifier le produit."

                        );

                        closeConfirmModal();

                    } finally {

                        setConfirmLoading(false);

                    }

                }

            });


            return;

        }


        // =================================================
        // CRÉATION
        // =================================================

        setConfirmModal({

            open: true,

            type: "success",

            title: "Créer ce produit ?",

            message:
                `Voulez-vous créer le produit « ${form.nom.trim()} » ?`,

            confirmText: "Créer",

            action: async () => {

                try {

                    setConfirmLoading(true);

                    setError("");


                    const newProduit =
                        await createProduit(data);


                    setProduits(
                        (previous) => [

                            ...previous,

                            newProduit

                        ]
                    );


                    setShowModal(false);

                    setEditingProduit(null);

                    setForm(emptyForm);

                    closeConfirmModal();


                } catch (err) {

                    console.error(err);

                    setError(

                        err.response?.data?.detail ||

                        "Impossible de créer le produit."

                    );

                    closeConfirmModal();

                } finally {

                    setConfirmLoading(false);

                }

            }

        });

    };


    // =====================================================
    // SUPPRESSION
    // =====================================================

    const handleDelete = (produit) => {

        setError("");


        setConfirmModal({

            open: true,

            type: "warning",

            title: "Supprimer ce produit ?",

            message:
                `Vous êtes sur le point de supprimer « ${produit.nom} ». Cette action est irréversible.`,

            confirmText: "Supprimer",

            action: async () => {

                try {

                    setConfirmLoading(true);

                    setError("");


                    await deleteProduit(
                        produit.id_produit
                    );


                    setProduits(
                        (previous) =>

                            previous.filter(
                                (item) =>

                                    item.id_produit !==
                                    produit.id_produit
                            )
                    );


                    closeConfirmModal();


                } catch (err) {

                    console.error(err);

                    setError(

                        err.response?.data?.detail ||

                        "Impossible de supprimer le produit."

                    );


                    closeConfirmModal();

                } finally {

                    setConfirmLoading(false);

                }

            }

        });

    };


    // =====================================================
    // FORMAT PRIX
    // =====================================================

    const formatPrix = (prix) => {

        const number = Number(prix);


        if (Number.isNaN(number)) {

            return "—";

        }


        return number.toLocaleString(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

    };


    // =====================================================
    // RENDU
    // =====================================================

    return (

        <div className="products-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    {/* <h1 className="page-title">
                        Produits
                    </h1>

                    <p className="page-description">
                        Gérez les produits de TMACKEN.
                    </p> */}

                </div>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateModal}
                >

                    <Plus size={17} />

                    Nouveau produit

                </button>

            </div>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="stats-grid products-stats">


                <div className="stat-card">

                    <div className="stat-label">
                        Total produits
                    </div>

                    <div className="stat-value">
                        {totalProduits}
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-label">
                        Produits actifs
                    </div>

                    <div className="stat-value">
                        {produitsActifs}
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-label">
                        Produits inactifs
                    </div>

                    <div className="stat-value">
                        {produitsInactifs}
                    </div>

                </div>


            </div>


            {/* =================================================
                TOOLBAR
            ================================================= */}

            <div className="toolbar products-toolbar">


                <div className="products-search">

                    <div className="products-search-wrapper">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadProduits}
                    disabled={loading}
                >

                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "spin"
                                : ""
                        }
                    />

                    Actualiser

                </button>

            </div>


            {/* =================================================
                ERREUR
            ================================================= */}

            {error && !showModal && (

                <div className="products-error">

                    {error}

                </div>

            )}


            {/* =================================================
                TABLEAU
            ================================================= */}

            <div className="table-container">


                {loading ? (

                    <div className="products-loading">

                        Chargement des produits...

                    </div>

                ) : filteredProduits.length === 0 ? (

                    <div className="products-empty">

                        <Package size={35} />

                        <h3>
                            Aucun produit
                        </h3>

                        <p>
                            Aucun produit ne correspond
                            à votre recherche.
                        </p>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Produit</th>

                                <th>Description</th>

                                <th>Prix</th>

                                <th>Seuil d'alerte</th>

                                <th>Statut</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredProduits.map(
                                (produit) => (

                                    <tr
                                        key={
                                            produit.id_produit
                                        }
                                    >

                                        <td>
                                            #{produit.id_produit}
                                        </td>


                                        <td>

                                            <strong>
                                                {produit.nom}
                                            </strong>

                                        </td>


                                        <td>

                                            {produit.description ||
                                                "—"}

                                        </td>


                                        <td>

                                            <strong>
                                                {formatPrix(
                                                    produit.prix
                                                )}
                                            </strong>

                                        </td>


                                        <td>

                                            {produit.seuil_alerte}

                                        </td>


                                        <td>

                                            {produit.statut ? (

                                                <span className="status-badge active">

                                                    <CheckCircle2
                                                        size={14}
                                                    />

                                                    Actif

                                                </span>

                                            ) : (

                                                <span className="status-badge inactive">

                                                    <XCircle
                                                        size={14}
                                                    />

                                                    Inactif

                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            <div className="product-actions">


                                                <button
                                                    type="button"
                                                    className="table-action edit"
                                                    onClick={() =>
                                                        openEditModal(
                                                            produit
                                                        )
                                                    }
                                                    title="Modifier"
                                                >

                                                    <Pencil
                                                        size={16}
                                                    />

                                                </button>


                                                <button
                                                    type="button"
                                                    className="table-action delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            produit
                                                        )
                                                    }
                                                    title="Supprimer"
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                </button>


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
                MODAL PRODUIT
            ================================================= */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div className="client-modal product-modal">


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingProduit
                                        ? "Modifier le produit"
                                        : "Nouveau produit"}

                                </h2>

                                <p>

                                    {editingProduit
                                        ? "Modifiez les informations du produit."
                                        : "Ajoutez un nouveau produit."}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Fermer"
                            >

                                ×

                            </button>

                        </div>


                        {/* ERREUR */}

                        {error && (

                            <div className="products-error modal-error">

                                {error}

                            </div>

                        )}


                        {/* FORMULAIRE */}

                        <form
                            className="form-grid"
                            onSubmit={handleSubmit}
                        >


                            {/* NOM */}

                            <div className="form-group full">

                                <label className="form-label">

                                    Nom du produit *

                                </label>

                                <input
                                    className="form-input"
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    placeholder="Ex : iPhone 17 Pro Max"
                                />

                            </div>


                            {/* DESCRIPTION */}

                            <div className="form-group full">

                                <label className="form-label">

                                    Description

                                </label>

                                <textarea
                                    className="form-input form-textarea"
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Description du produit..."
                                    rows="4"
                                />

                            </div>


                            {/* PRIX */}

                            <div className="form-group">

                                <label className="form-label">

                                    Prix *

                                </label>

                                <input
                                    className="form-input"
                                    type="number"
                                    name="prix"
                                    value={form.prix}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                />

                            </div>


                            {/* SEUIL */}

                            <div className="form-group">

                                <label className="form-label">

                                    Seuil d'alerte

                                </label>

                                <input
                                    className="form-input"
                                    type="number"
                                    name="seuil_alerte"
                                    value={form.seuil_alerte}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    step="1"
                                />

                            </div>


                            {/* STATUT */}

                            <div className="form-group full">

                                <label className="product-status-control">

                                    <input
                                        type="checkbox"
                                        checked={
                                            form.statut
                                        }
                                        onChange={
                                            handleStatusChange
                                        }
                                    />

                                    <span>
                                        Produit actif
                                    </span>

                                </label>

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                    disabled={saving}
                                >

                                    Annuler

                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >

                                    {editingProduit
                                        ? "Enregistrer"
                                        : "Créer le produit"}

                                </button>

                            </div>

                        </form>

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


export default Produits;