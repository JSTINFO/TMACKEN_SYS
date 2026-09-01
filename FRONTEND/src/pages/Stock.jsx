import { useEffect, useMemo, useState } from "react";

import {
    Search,
    RefreshCw,
    Package,
    AlertTriangle,
    ArrowDownToLine,
    ArrowUpFromLine,
    History,
    Plus,
    XCircle
} from "lucide-react";

import {
    getStocks,
    getAlertesStock
} from "../services/stockService";

import {
    getMouvementsStock,
    createMouvementStock
} from "../services/mouvementStockService";

import { getProduits } from "../services/produitService";

import ConfirmModal from "../components/ConfirmModal";


function Stock() {

    // =====================================================
    // DONNÉES
    // =====================================================

    const [stocks, setStocks] = useState([]);

    const [alertes, setAlertes] = useState([]);

    const [mouvements, setMouvements] = useState([]);

    const [produits, setProduits] = useState([]);


    // =====================================================
    // ÉTATS
    // =====================================================

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");

    const [showMovementModal, setShowMovementModal] =
        useState(false);

    const [saving, setSaving] = useState(false);


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
    // FORMULAIRE MOUVEMENT
    // =====================================================

    const emptyForm = {

        id_produit: "",

        type_mouvement: "ENTREE",

        quantite: "",

        motif: ""

    };


    const [form, setForm] = useState(emptyForm);


    // =====================================================
    // CHARGEMENT
    // =====================================================

    const loadData = async () => {

        try {

            setLoading(true);

            setError("");


            const [
                stocksData,
                alertesData,
                mouvementsData,
                produitsData
            ] = await Promise.all([

                getStocks(),

                getAlertesStock(),

                getMouvementsStock(),

                getProduits()

            ]);


            setStocks(stocksData);

            setAlertes(alertesData);

            setMouvements(mouvementsData);

            setProduits(produitsData);


        } catch (err) {

            console.error(err);

            setError(

                err.response?.data?.detail ||

                "Impossible de charger les données du stock."

            );

        } finally {

            setLoading(false);

        }

    };


    useEffect(() => {

        loadData();

    }, []);


    // =====================================================
    // PRODUITS INDEXÉS
    // =====================================================

    const produitsMap = useMemo(() => {

        const map = {};

        produits.forEach((produit) => {

            map[produit.id_produit] = produit;

        });

        return map;

    }, [produits]);


    // =====================================================
    // RECHERCHE
    // =====================================================

    const filteredStocks = stocks.filter(
        (stock) => {

            const produit =
                produitsMap[stock.id_produit];


            const value =
                search.toLowerCase().trim();


            if (!value) {

                return true;

            }


            return (

                produit?.nom
                    ?.toLowerCase()
                    .includes(value)

                ||

                String(stock.id_produit)
                    .includes(value)

            );

        }
    );


    // =====================================================
    // STATISTIQUES
    // =====================================================

    const totalProduits = stocks.length;

    const stocksFaibles = alertes.filter(
        (alerte) =>
            alerte.quantite > 0
    ).length;

    const ruptures = alertes.filter(
        (alerte) =>
            alerte.quantite === 0
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


    // =====================================================
    // OUVRIR MOUVEMENT
    // =====================================================

    const openMovementModal = () => {

        setForm(emptyForm);

        setError("");

        setShowMovementModal(true);

    };


    // =====================================================
    // FERMER MOUVEMENT
    // =====================================================

    const closeMovementModal = () => {

        if (saving) {

            return;

        }


        setShowMovementModal(false);

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
    // SOUMISSION MOUVEMENT
    // =====================================================

    const handleSubmitMovement = (event) => {

        event.preventDefault();

        setError("");


        if (!form.id_produit) {

            setError(
                "Veuillez sélectionner un produit."
            );

            return;

        }


        if (
            !form.quantite ||
            Number(form.quantite) <= 0
        ) {

            setError(
                "La quantité doit être supérieure à 0."
            );

            return;

        }


        const produit =
            produitsMap[Number(form.id_produit)];


        if (!produit) {

            setError(
                "Produit introuvable."
            );

            return;

        }


        const data = {

            id_produit:
                Number(form.id_produit),

            type_mouvement:
                form.type_mouvement,

            quantite:
                Number(form.quantite),

            motif:
                form.motif.trim() || null

        };


        const typeLabel =
            form.type_mouvement === "ENTREE"
                ? "entrée"
                : "sortie";


        setConfirmModal({

            open: true,

            type:
                form.type_mouvement === "ENTREE"
                    ? "success"
                    : "warning",

            title:
                "Confirmer le mouvement ?",

            message:
                `Vous êtes sur le point d'enregistrer une ${typeLabel} de ${form.quantite} unité(s) pour « ${produit.nom} ».`,

            confirmText:
                "Confirmer",

            action: async () => {

                try {

                    setConfirmLoading(true);

                    setError("");


                    await createMouvementStock(
                        data
                    );


                    await loadData();


                    setShowMovementModal(false);

                    setForm(emptyForm);

                    closeConfirmModal();


                } catch (err) {

                    console.error(err);


                    setError(

                        err.response?.data?.detail ||

                        "Impossible d'enregistrer le mouvement."

                    );


                    closeConfirmModal();

                } finally {

                    setConfirmLoading(false);

                }

            }

        });

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {

            return "—";

        }


        return new Date(date).toLocaleString(
            "fr-FR"
        );

    };


    // =====================================================
    // NOM PRODUIT
    // =====================================================

    const getProduitNom = (idProduit) => {

        return (
            produitsMap[idProduit]?.nom ||
            `Produit #${idProduit}`
        );

    };


    // =====================================================
    // RENDU
    // =====================================================

    return (

        <div className="stock-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>

                    {/* <h1 className="page-title">
                        Stock
                    </h1>

                    <p className="page-description">
                        Suivez les quantités et les mouvements
                        de stock.
                    </p> */}

                </div>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openMovementModal}
                >

                    <Plus size={17} />

                    Nouveau mouvement

                </button>

            </div>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="stats-grid stock-stats">


                <div className="stat-card">

                    <div className="stat-label">
                        Produits en stock
                    </div>

                    <div className="stat-value">
                        {totalProduits}
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-label">
                        Stock faible
                    </div>

                    <div className="stat-value">
                        {stocksFaibles}
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-label">
                        Ruptures
                    </div>

                    <div className="stat-value">
                        {ruptures}
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-label">
                        Mouvements
                    </div>

                    <div className="stat-value">
                        {mouvements.length}
                    </div>

                </div>

            </div>


            {/* =================================================
                BARRE OUTILS
            ================================================= */}

            <div className="toolbar stock-toolbar">


                <div className="stock-search">

                    <div className="stock-search-wrapper">

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
                    onClick={loadData}
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

            {error && !showMovementModal && (

                <div className="stock-error">

                    {error}

                </div>

            )}


            {/* =================================================
                ALERTES
            ================================================= */}

            {alertes.length > 0 && (

                <div className="stock-alerts-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Alertes de stock
                            </h2>

                            <p>
                                Produits dont la quantité
                                est inférieure ou égale
                                au seuil configuré.
                            </p>

                        </div>

                        <AlertTriangle
                            size={20}
                        />

                    </div>


                    <div className="stock-alerts-grid">

                        {alertes.map(
                            (alerte) => (

                                <div
                                    className={
                                        alerte.quantite === 0
                                            ? "stock-alert danger"
                                            : "stock-alert warning"
                                    }
                                    key={
                                        alerte.id_stock
                                    }
                                >

                                    <div>

                                        <strong>
                                            {alerte.nom_produit}
                                        </strong>

                                        <span>
                                            {alerte.quantite}
                                            {" "}
                                            / seuil{" "}
                                            {alerte.seuil_alerte}
                                        </span>

                                    </div>


                                    {alerte.quantite === 0 ? (

                                        <XCircle size={20} />

                                    ) : (

                                        <AlertTriangle size={20} />

                                    )}

                                </div>

                            )
                        )}

                    </div>

                </div>

            )}


            {/* =================================================
                STOCK
            ================================================= */}

            <div className="table-container stock-table-container">


                <div className="section-heading stock-table-heading">

                    <div>

                        <h2>
                            État du stock
                        </h2>

                        <p>
                            Quantités actuellement disponibles.
                        </p>

                    </div>

                </div>


                {loading ? (

                    <div className="stock-loading">

                        Chargement du stock...

                    </div>

                ) : filteredStocks.length === 0 ? (

                    <div className="stock-empty">

                        <Package size={36} />

                        <h3>
                            Aucun stock
                        </h3>

                        <p>
                            Aucun produit avec un stock
                            enregistré.
                        </p>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Produit</th>

                                <th>Quantité</th>

                                <th>Seuil</th>

                                <th>État</th>

                                <th>Mise à jour</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredStocks.map(
                                (stock) => {

                                    const produit =
                                        produitsMap[
                                            stock.id_produit
                                        ];


                                    const seuil =
                                        produit?.seuil_alerte ??
                                        0;


                                    const quantite =
                                        stock.quantite;


                                    let status;


                                    if (
                                        quantite === 0
                                    ) {

                                        status = (
                                            <span className="stock-status danger">
                                                <XCircle size={14} />
                                                Rupture
                                            </span>
                                        );

                                    } else if (
                                        quantite <= seuil
                                    ) {

                                        status = (
                                            <span className="stock-status warning">
                                                <AlertTriangle size={14} />
                                                Stock faible
                                            </span>
                                        );

                                    } else {

                                        status = (
                                            <span className="stock-status success">
                                                <Package size={14} />
                                                Normal
                                            </span>
                                        );

                                    }


                                    return (

                                        <tr
                                            key={
                                                stock.id_stock
                                            }
                                        >

                                            <td>
                                                #{stock.id_stock}
                                            </td>

                                            <td>

                                                <strong>

                                                    {produit?.nom ||
                                                        `Produit #${stock.id_produit}`}

                                                </strong>

                                            </td>

                                            <td>

                                                <strong>
                                                    {quantite}
                                                </strong>

                                            </td>

                                            <td>

                                                {seuil}

                                            </td>

                                            <td>

                                                {status}

                                            </td>

                                            <td>

                                                {formatDate(
                                                    stock.date_mise_a_jour
                                                )}

                                            </td>

                                        </tr>

                                    );

                                }
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* =================================================
                HISTORIQUE
            ================================================= */}

            <div className="table-container movements-container">


                <div className="section-heading stock-table-heading">

                    <div>

                        <h2>
                            Historique des mouvements
                        </h2>

                        <p>
                            Dernières entrées et sorties.
                        </p>

                    </div>

                    <History size={20} />

                </div>


                {mouvements.length === 0 ? (

                    <div className="stock-empty">

                        <History size={34} />

                        <h3>
                            Aucun mouvement
                        </h3>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Produit</th>

                                <th>Type</th>

                                <th>Quantité</th>

                                <th>Motif</th>

                                <th>Date</th>

                            </tr>

                        </thead>


                        <tbody>

                            {mouvements.map(
                                (mouvement) => (

                                    <tr
                                        key={
                                            mouvement.id_mouvement
                                        }
                                    >

                                        <td>
                                            #{mouvement.id_mouvement}
                                        </td>

                                        <td>

                                            {getProduitNom(
                                                mouvement.id_produit
                                            )}

                                        </td>

                                        <td>

                                            {mouvement.type_mouvement ===
                                            "ENTREE" ? (

                                                <span className="movement-type entry">

                                                    <ArrowDownToLine
                                                        size={14}
                                                    />

                                                    Entrée

                                                </span>

                                            ) : (

                                                <span className="movement-type exit">

                                                    <ArrowUpFromLine
                                                        size={14}
                                                    />

                                                    Sortie

                                                </span>

                                            )}

                                        </td>

                                        <td>

                                            <strong>
                                                {mouvement.quantite}
                                            </strong>

                                        </td>

                                        <td>

                                            {mouvement.motif ||
                                                "—"}

                                        </td>

                                        <td>

                                            {formatDate(
                                                mouvement.date_mouvement
                                            )}

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* =================================================
                MODAL MOUVEMENT
            ================================================= */}

            {showMovementModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {

                            closeMovementModal();

                        }

                    }}
                >

                    <div className="client-modal stock-movement-modal">


                        <div className="modal-header">

                            <div>

                                <h2>
                                    Nouveau mouvement
                                </h2>

                                <p>
                                    Enregistrez une entrée
                                    ou une sortie de stock.
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    closeMovementModal
                                }
                                disabled={saving}
                            >

                                ×

                            </button>

                        </div>


                        {error && (

                            <div className="stock-error modal-error">

                                {error}

                            </div>

                        )}


                        <form
                            className="form-grid"
                            onSubmit={
                                handleSubmitMovement
                            }
                        >


                            {/* PRODUIT */}

                            <div className="form-group full">

                                <label className="form-label">

                                    Produit *

                                </label>

                                <select
                                    className="form-input"
                                    name="id_produit"
                                    value={
                                        form.id_produit
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="">
                                        Sélectionner un produit
                                    </option>

                                    {produits.map(
                                        (produit) => (

                                            <option
                                                key={
                                                    produit.id_produit
                                                }
                                                value={
                                                    produit.id_produit
                                                }
                                            >

                                                {produit.nom}

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* TYPE */}

                            <div className="form-group">

                                <label className="form-label">

                                    Type *

                                </label>

                                <select
                                    className="form-input"
                                    name="type_mouvement"
                                    value={
                                        form.type_mouvement
                                    }
                                    onChange={
                                        handleChange
                                    }
                                >

                                    <option value="ENTREE">
                                        Entrée
                                    </option>

                                    <option value="SORTIE">
                                        Sortie
                                    </option>

                                </select>

                            </div>


                            {/* QUANTITÉ */}

                            <div className="form-group">

                                <label className="form-label">

                                    Quantité *

                                </label>

                                <input
                                    className="form-input"
                                    type="number"
                                    name="quantite"
                                    value={
                                        form.quantite
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    min="1"
                                    step="1"
                                    placeholder="Ex : 10"
                                />

                            </div>


                            {/* MOTIF */}

                            <div className="form-group full">

                                <label className="form-label">

                                    Motif

                                </label>

                                <textarea
                                    className="form-input form-textarea"
                                    name="motif"
                                    value={
                                        form.motif
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Ex : Réapprovisionnement, vente, correction..."
                                    rows="3"
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={
                                        closeMovementModal
                                    }
                                >

                                    Annuler

                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                >

                                    Continuer

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


export default Stock;