import { useState, useEffect, useMemo } from "react";

import {
    CreditCard,
    Banknote,
    Building2,
    FileText,
    MoreHorizontal,
    X,
    Check,
    Loader2,
    User,
    ShoppingBag,
    Coins,
    AlertCircle,
    Percent,
    Tag
} from "lucide-react";

import "./PaymentModal.css";


// ==========================================
// MODES DE PAIEMENT
// ==========================================

const MODES_PAIEMENT = [
    {
        id: "ESPECES",
        label: "Espèces",
        icon: Banknote
    },
    {
        id: "CARTE",
        label: "Carte",
        icon: CreditCard
    },
    {
        id: "VIREMENT",
        label: "Virement",
        icon: Building2
    },
    {
        id: "CHEQUE",
        label: "Chèque",
        icon: FileText
    },
    {
        id: "AUTRE",
        label: "Autre",
        icon: MoreHorizontal
    }
];


// ==========================================
// OUTIL ARRONDI
// ==========================================

const roundMoney = (value) => {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.round(
        (number + Number.EPSILON) * 100
    ) / 100;
};


// ==========================================
// MODAL PAIEMENT
// ==========================================

function PaymentModal({
    open,
    onClose,

    title = "Règlement du paiement",

    subtitle,

    clientName,

    reference,

    totalAmount = 0,

    items = [],

    // ======================================
    // RABAIS
    // ======================================

    rabaisInitial = 0,

    typeRabaisInitial = "MONTANT",

    onConfirmPayment,

    onConfirmWithoutPayment,

    loading = false
}) {

    // ==========================================
    // DÉTECTER RÉSERVATION
    // ==========================================

    const isReservation = useMemo(() => {

        if (!reference) {
            return false;
        }

        return reference
            .toLowerCase()
            .includes("réservation");

    }, [reference]);


    // ==========================================
    // ÉTATS
    // ==========================================

    const [modePaiement, setModePaiement] =
        useState("ESPECES");

    const [montant, setMontant] =
        useState("");

    const [montantRecu, setMontantRecu] =
        useState("");

    const [error, setError] =
        useState("");


    // ==========================================
    // RABAIS
    // ==========================================

    const [typeRabais, setTypeRabais] =
        useState("MONTANT");

    const [rabais, setRabais] =
        useState("");


    // ==========================================
    // TOTAL BRUT
    // ==========================================

    const totalBrut = useMemo(() => {

        if (
            !items ||
            items.length === 0
        ) {
            return roundMoney(totalAmount);
        }


        return roundMoney(
            items.reduce(
                (total, item) => {

                    const quantite =
                        Number(
                            item.quantite || 0
                        );

                    const prix =
                        Number(
                            item.prix_unitaire ??
                            item.prix ??
                            0
                        );

                    return (
                        total +
                        (
                            quantite *
                            prix
                        )
                    );

                },
                0
            )
        );

    }, [
        items,
        totalAmount
    ]);


    // ==========================================
    // INITIALISATION
    // ==========================================

    useEffect(() => {

        if (!open) {
            return;
        }


        const total =
            roundMoney(totalAmount);


        const rabaisInitialNumber =
            roundMoney(rabaisInitial);


        setModePaiement(
            "ESPECES"
        );

        setError("");


        // =================================================
        // RÉSERVATION
        // =================================================

        if (isReservation) {

            /*
             * IMPORTANT :
             *
             * Pour une réservation,
             * totalAmount est déjà le TOTAL FINAL
             * venant du backend.
             *
             * Exemple :
             *
             * Total brut  = 20 000,00
             * Rabais      = 9 999,98
             * Total final = 10 000,02
             *
             * Le modal NE doit PAS refaire :
             *
             * 10 000,02 - 9 999,98
             *
             * sinon le résultat devient faux.
             */


            let rabaisAffiche =
                rabaisInitialNumber;


            /*
             * Si le parent ne nous envoie pas le rabais,
             * on peut le retrouver :
             *
             * total brut - total final
             */

            if (
                rabaisAffiche === 0 &&
                totalBrut > total
            ) {

                rabaisAffiche =
                    roundMoney(
                        totalBrut - total
                    );

            }


            setTypeRabais(
                typeRabaisInitial ||
                "MONTANT"
            );


            setRabais(
                rabaisAffiche.toFixed(2)
            );


            /*
             * Le montant à payer est directement
             * le total final du backend.
             */

            setMontant(
                total.toFixed(2)
            );


            setMontantRecu(
                total.toFixed(2)
            );


            return;
        }


        // =================================================
        // VENTE
        // =================================================

        setTypeRabais(
            typeRabaisInitial ||
            "MONTANT"
        );


        setRabais(
            rabaisInitialNumber > 0
                ? rabaisInitialNumber.toString()
                : "0"
        );


        setMontant(
            total.toFixed(2)
        );


        setMontantRecu(
            total.toFixed(2)
        );

    }, [
        open,
        totalAmount,
        totalBrut,
        isReservation,
        rabaisInitial,
        typeRabaisInitial
    ]);


    // ==========================================
    // FORMAT MONNAIE
    // ==========================================

    const formatMoney = (value) => {

        return (
            roundMoney(value)
                .toLocaleString(
                    "fr-FR",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                ) +
            " $"
        );

    };


    // ==========================================
    // VALEUR RABAIS
    // ==========================================

    const rabaisNumber = useMemo(() => {

        const value =
            parseFloat(rabais);

        return Number.isFinite(value)
            ? value
            : 0;

    }, [rabais]);


    // ==========================================
    // TOTAL ORIGINAL
    // ==========================================

    const totalOriginal = useMemo(() => {

        /*
         * Pour une réservation,
         * le total brut vient des produits.
         */

        if (isReservation) {
            return totalBrut;
        }


        /*
         * Pour une vente,
         * si les produits sont disponibles,
         * on utilise également le brut.
         */

        if (
            items &&
            items.length > 0
        ) {
            return totalBrut;
        }


        return roundMoney(
            totalAmount
        );

    }, [
        isReservation,
        items,
        totalBrut,
        totalAmount
    ]);


    // ==========================================
    // MONTANT DU RABAIS
    // ==========================================

    const montantRabais = useMemo(() => {

        // =================================================
        // RÉSERVATION
        // =================================================

        if (isReservation) {

            /*
             * Pour une réservation,
             * le rabais est déjà enregistré.
             *
             * On l'affiche uniquement.
             */

            if (
                rabaisNumber <= 0
            ) {
                return 0;
            }


            if (
                typeRabais ===
                "POURCENTAGE"
            ) {

                return roundMoney(
                    Math.min(
                        totalBrut,
                        totalBrut *
                        rabaisNumber /
                        100
                    )
                );

            }


            return roundMoney(
                Math.min(
                    totalBrut,
                    rabaisNumber
                )
            );
        }


        // =================================================
        // VENTE
        // =================================================

        if (
            rabaisNumber <= 0
        ) {
            return 0;
        }


        if (
            typeRabais ===
            "POURCENTAGE"
        ) {

            return roundMoney(
                Math.min(
                    totalOriginal,
                    totalOriginal *
                    rabaisNumber /
                    100
                )
            );

        }


        return roundMoney(
            Math.min(
                totalOriginal,
                rabaisNumber
            )
        );

    }, [
        isReservation,
        rabaisNumber,
        typeRabais,
        totalBrut,
        totalOriginal
    ]);


    // ==========================================
    // TOTAL APRÈS RABAIS
    // ==========================================

    const totalApresRabais = useMemo(() => {

        // =================================================
        // RÉSERVATION
        // =================================================

        if (isReservation) {

            /*
             * IMPORTANT :
             *
             * totalAmount = total final backend.
             *
             * On le conserve.
             */

            return roundMoney(
                totalAmount
            );
        }


        // =================================================
        // VENTE
        // =================================================

        return roundMoney(
            Math.max(
                0,
                totalOriginal -
                montantRabais
            )
        );

    }, [
        isReservation,
        totalAmount,
        totalOriginal,
        montantRabais
    ]);


    // ==========================================
    // MONTANT À ENCAISSER
    // ==========================================

    const montantNumber = useMemo(() => {

        const value =
            parseFloat(montant);

        return Number.isFinite(value)
            ? roundMoney(value)
            : 0;

    }, [montant]);


    // ==========================================
    // MONTANT REÇU
    // ==========================================

    const montantRecuNumber = useMemo(() => {

        const value =
            parseFloat(montantRecu);

        return Number.isFinite(value)
            ? roundMoney(value)
            : 0;

    }, [montantRecu]);


    // ==========================================
    // MONNAIE
    // ==========================================

    const monnaieARendre = useMemo(() => {

        if (
            modePaiement !==
            "ESPECES"
        ) {
            return 0;
        }


        return roundMoney(
            Math.max(
                0,
                montantRecuNumber -
                montantNumber
            )
        );

    }, [
        modePaiement,
        montantRecuNumber,
        montantNumber
    ]);


    // ==========================================
    // CHANGER TYPE RABAIS
    // ==========================================

    const handleTypeRabaisChange = (
        type
    ) => {

        /*
         * Le rabais d'une réservation
         * ne peut pas être modifié
         * depuis le paiement.
         */

        if (isReservation) {
            return;
        }


        setTypeRabais(type);

        setRabais("0");


        const total =
            totalOriginal.toFixed(2);


        setMontant(total);


        if (
            modePaiement ===
            "ESPECES"
        ) {

            setMontantRecu(total);

        }


        setError("");

    };


    // ==========================================
    // CHANGER RABAIS
    // ==========================================

    const handleRabaisChange = (
        value
    ) => {

        /*
         * Réservation :
         * rabais déjà enregistré.
         */

        if (isReservation) {
            return;
        }


        if (value === "") {

            setRabais("");

            setMontant(
                totalOriginal.toFixed(2)
            );


            if (
                modePaiement ===
                "ESPECES"
            ) {

                setMontantRecu(
                    totalOriginal.toFixed(2)
                );

            }

            return;
        }


        const number =
            parseFloat(value);


        if (
            !Number.isFinite(number)
        ) {
            return;
        }


        let nouvelleValeur =
            value;


        // ======================================
        // POURCENTAGE
        // ======================================

        if (
            typeRabais ===
            "POURCENTAGE"
        ) {

            if (
                number > 100
            ) {
                nouvelleValeur = "100";
            }


            if (
                number < 0
            ) {
                nouvelleValeur = "0";
            }

        }


        // ======================================
        // MONTANT
        // ======================================

        if (
            typeRabais ===
            "MONTANT"
        ) {

            if (
                number >
                totalOriginal
            ) {

                nouvelleValeur =
                    totalOriginal.toFixed(2);

            }


            if (
                number < 0
            ) {

                nouvelleValeur = "0";

            }

        }


        setRabais(
            nouvelleValeur
        );

    };


    // ==========================================
    // APPLIQUER RABAIS
    // ==========================================

    const appliquerRabais = () => {

        /*
         * Pour une réservation,
         * rien à recalculer.
         */

        if (isReservation) {
            return;
        }


        const nouveauTotal =
            totalApresRabais.toFixed(2);


        setMontant(
            nouveauTotal
        );


        if (
            modePaiement ===
            "ESPECES"
        ) {

            setMontantRecu(
                nouveauTotal
            );

        }

    };


    // ==========================================
    // VALIDATION
    // ==========================================

    const handleSubmit = async (e) => {

        e?.preventDefault();

        setError("");


        // ======================================
        // MONTANT
        // ======================================

        if (
            montantNumber <= 0
        ) {

            setError(
                "Le montant à encaisser doit être supérieur à 0."
            );

            return;
        }


        // ======================================
        // RÉSERVATION
        // ======================================

        if (isReservation) {

            /*
             * Le montant doit être exactement
             * celui calculé par le backend.
             */

            if (
                Math.abs(
                    montantNumber -
                    totalApresRabais
                ) > 0.001
            ) {

                setError(
                    `Le montant doit être exactement ${formatMoney(
                        totalApresRabais
                    )}.`
                );

                return;
            }

        }


        // ======================================
        // ESPÈCES
        // ======================================

        if (
            modePaiement ===
            "ESPECES" &&
            montantRecuNumber <
            montantNumber
        ) {

            setError(
                "Le montant reçu est inférieur au montant à régler."
            );

            return;
        }


        // ======================================
        // RABAIS VENTE
        // ======================================

        if (
            !isReservation
        ) {

            if (
                rabaisNumber < 0
            ) {

                setError(
                    "Le rabais ne peut pas être négatif."
                );

                return;
            }


            if (
                typeRabais ===
                "POURCENTAGE" &&
                rabaisNumber > 100
            ) {

                setError(
                    "Le rabais en pourcentage ne peut pas dépasser 100 %."
                );

                return;
            }


            if (
                typeRabais ===
                "MONTANT" &&
                rabaisNumber >
                totalOriginal
            ) {

                setError(
                    "Le rabais ne peut pas être supérieur au montant de la vente."
                );

                return;
            }

        }


        // ======================================
        // API
        // ======================================

        try {

            // ==================================
            // RÉSERVATION
            // ==================================

            if (isReservation) {

                await onConfirmPayment({

                    mode_paiement:
                        modePaiement,

                    /*
                     * IMPORTANT :
                     * on envoie le total final.
                     */

                    montant:
                        roundMoney(
                            totalApresRabais
                        ),

                    montant_recu:
                        modePaiement ===
                        "ESPECES"
                            ? montantRecuNumber
                            : roundMoney(
                                totalApresRabais
                            ),

                    monnaie:
                        monnaieARendre

                });

                return;
            }


            // ==================================
            // VENTE
            // ==================================

            await onConfirmPayment({

                mode_paiement:
                    modePaiement,

                montant:
                    montantNumber,

                montant_recu:
                    modePaiement ===
                    "ESPECES"
                        ? montantRecuNumber
                        : montantNumber,

                monnaie:
                    monnaieARendre,

                rabais:
                    roundMoney(
                        montantRabais
                    ),

                type_rabais:
                    typeRabais

            });

        } catch (err) {

            console.error(
                "Erreur paiement modal:",
                err
            );


            setError(
                err?.response?.data?.detail ||
                err?.message ||
                "Une erreur est survenue lors de l'enregistrement du paiement."
            );

        }

    };


    // ==========================================
    // MODAL FERME
    // ==========================================

    if (!open) {
        return null;
    }


    // ==========================================
    // RENDU
    // ==========================================

    return (

        <div
            className="payment-overlay"
            onMouseDown={(e) => {

                if (
                    e.target ===
                    e.currentTarget &&
                    !loading
                ) {

                    onClose();

                }

            }}
        >

            <div
                className="payment-modal"
                role="dialog"
                aria-modal="true"
            >

                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="payment-modal-header">

                    <div className="payment-modal-title-group">

                        <div className="payment-icon-wrapper">

                            <CreditCard
                                size={22}
                            />

                        </div>


                        <div>

                            <h2>
                                {title}
                            </h2>


                            {subtitle && (

                                <p className="payment-subtitle">
                                    {subtitle}
                                </p>

                            )}

                        </div>

                    </div>


                    <button
                        type="button"
                        className="payment-close-btn"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Fermer"
                    >

                        <X size={18} />

                    </button>

                </div>


                {/* =====================================
                    BODY
                ====================================== */}

                <div className="payment-modal-body">

                    {/* =================================
                        RÉSUMÉ
                    ================================== */}

                    <div className="payment-summary-card">

                        <div className="payment-summary-info">

                            {reference && (

                                <span className="payment-reference-tag">
                                    {reference}
                                </span>

                            )}


                            {clientName && (

                                <div className="payment-client-info">

                                    <User size={15} />

                                    <span>
                                        {clientName}
                                    </span>

                                </div>

                            )}

                        </div>


                        <div className="payment-total-box">

                            <span className="payment-total-label">
                                Total à régler
                            </span>


                            <span className="payment-total-amount">

                                {formatMoney(
                                    totalApresRabais
                                )}

                            </span>

                        </div>

                    </div>


                    {/* =================================
                        ARTICLES
                    ================================== */}

                    {items &&
                        items.length > 0 && (

                        <div className="payment-items-preview">

                            <div className="payment-items-header">

                                <ShoppingBag
                                    size={14}
                                />

                                <span>
                                    {items.length}
                                    {" "}
                                    produit(s) concerné(s)
                                </span>

                            </div>


                            <div className="payment-items-list">

                                {items.map(
                                    (
                                        item,
                                        idx
                                    ) => {

                                        const prix =
                                            Number(
                                                item.prix_unitaire ??
                                                item.prix ??
                                                0
                                            );


                                        const quantite =
                                            Number(
                                                item.quantite ??
                                                0
                                            );


                                        const sousTotal =
                                            item.sous_total != null
                                                ? Number(
                                                    item.sous_total
                                                )
                                                : (
                                                    quantite *
                                                    prix
                                                );


                                        return (

                                            <div
                                                key={idx}
                                                className="payment-item-row"
                                            >

                                                <span className="payment-item-name">

                                                    {
                                                        item.nom_produit ||
                                                        item.nom ||
                                                        "Produit"
                                                    }

                                                </span>


                                                <span className="payment-item-qty">

                                                    {quantite}

                                                    {" × "}

                                                    {formatMoney(
                                                        prix
                                                    )}

                                                </span>


                                                <strong className="payment-item-total">

                                                    {formatMoney(
                                                        sousTotal
                                                    )}

                                                </strong>

                                            </div>

                                        );

                                    }
                                )}

                            </div>

                        </div>

                    )}


                    {/* =================================
                        RABAIS
                    ================================== */}

                    <div className="payment-section">

                        <label className="payment-label">

                            <Tag size={15} />

                            Rabais

                        </label>


                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "1fr 1fr",
                                gap: "10px"
                            }}
                        >

                            {/* MONTANT */}

                            <button
                                type="button"
                                className={`payment-mode-btn ${
                                    typeRabais ===
                                    "MONTANT"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleTypeRabaisChange(
                                        "MONTANT"
                                    )
                                }
                                disabled={
                                    loading ||
                                    isReservation
                                }
                            >

                                <Coins size={18} />

                                <span>
                                    Montant
                                </span>

                            </button>


                            {/* POURCENTAGE */}

                            <button
                                type="button"
                                className={`payment-mode-btn ${
                                    typeRabais ===
                                    "POURCENTAGE"
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    handleTypeRabaisChange(
                                        "POURCENTAGE"
                                    )
                                }
                                disabled={
                                    loading ||
                                    isReservation
                                }
                            >

                                <Percent size={18} />

                                <span>
                                    Pourcentage
                                </span>

                            </button>

                        </div>


                        {/* VALEUR */}

                        <div
                            className="payment-input-group"
                            style={{
                                marginTop: "10px"
                            }}
                        >

                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={
                                    typeRabais ===
                                    "POURCENTAGE"
                                        ? "100"
                                        : totalOriginal
                                }
                                className="payment-input"
                                value={rabais}
                                onChange={(e) =>
                                    handleRabaisChange(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    loading ||
                                    isReservation
                                }
                                placeholder={
                                    typeRabais ===
                                    "POURCENTAGE"
                                        ? "Ex : 10"
                                        : "Ex : 20"
                                }
                            />


                            <span className="payment-currency">

                                {typeRabais ===
                                "POURCENTAGE"
                                    ? "%"
                                    : "$"}

                            </span>

                        </div>


                        {/* INFO RESERVATION */}

                        {isReservation && (

                            <div
                                style={{
                                    marginTop: "8px",
                                    fontSize: "12px",
                                    opacity: 0.7
                                }}
                            >

                                Le rabais de cette réservation
                                est déjà enregistré et ne peut
                                pas être modifié ici.

                            </div>

                        )}


                        {/* RÉSUMÉ */}

                        {montantRabais > 0 && (

                            <div
                                style={{
                                    marginTop: "10px",
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "center",
                                    padding:
                                        "10px 12px",
                                    borderRadius: "8px",
                                    background:
                                        "rgba(34, 197, 94, 0.08)"
                                }}
                            >

                                <span
                                    style={{
                                        fontSize:
                                            "13px"
                                    }}
                                >

                                    Rabais appliqué

                                </span>


                                <strong
                                    style={{
                                        color:
                                            "#22c55e"
                                    }}
                                >

                                    -{" "}

                                    {formatMoney(
                                        montantRabais
                                    )}

                                </strong>

                            </div>

                        )}

                    </div>


                    {/* =================================
                        MODE PAIEMENT
                    ================================== */}

                    <div className="payment-section">

                        <label className="payment-label">

                            Mode de règlement

                        </label>


                        <div className="payment-modes-grid">

                            {MODES_PAIEMENT.map(
                                (mode) => {

                                    const Icon =
                                        mode.icon;


                                    const isSelected =
                                        modePaiement ===
                                        mode.id;


                                    return (

                                        <button
                                            key={
                                                mode.id
                                            }
                                            type="button"
                                            className={`payment-mode-btn ${
                                                isSelected
                                                    ? "active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setModePaiement(
                                                    mode.id
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        >

                                            <Icon
                                                size={18}
                                            />

                                            <span>
                                                {
                                                    mode.label
                                                }
                                            </span>

                                        </button>

                                    );

                                }
                            )}

                        </div>

                    </div>


                    {/* =================================
                        MONTANT
                    ================================== */}

                    <div className="payment-section">

                        <label
                            className="payment-label"
                            htmlFor="payment-amount-input"
                        >

                            Montant à encaisser

                        </label>


                        <div className="payment-input-group">

                            <input
                                id="payment-amount-input"
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="payment-input"
                                value={montant}
                                onChange={(e) =>
                                    setMontant(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    loading ||
                                    isReservation
                                }
                            />


                            <span className="payment-currency">
                                $
                            </span>

                        </div>


                        {isReservation && (

                            <div
                                style={{
                                    marginTop: "6px",
                                    fontSize: "12px",
                                    opacity: 0.7
                                }}
                            >

                                Le montant correspond au
                                total final de la réservation.

                            </div>

                        )}

                    </div>


                    {/* =================================
                        ESPÈCES
                    ================================== */}

                    {modePaiement ===
                        "ESPECES" && (

                        <div className="payment-cash-section">

                            <div className="payment-cash-row">

                                {/* MONTANT REÇU */}

                                <div className="payment-input-container">

                                    <label
                                        className="payment-label"
                                        htmlFor="payment-received-input"
                                    >

                                        Montant remis
                                        par le client

                                    </label>


                                    <div className="payment-input-group">

                                        <input
                                            id="payment-received-input"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            className="payment-input"
                                            value={
                                                montantRecu
                                            }
                                            onChange={(e) =>
                                                setMontantRecu(
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                loading
                                            }
                                        />


                                        <span className="payment-currency">
                                            $
                                        </span>

                                    </div>

                                </div>


                                {/* MONNAIE */}

                                <div className="payment-change-card">

                                    <div className="payment-change-header">

                                        <Coins
                                            size={15}
                                        />

                                        <span>
                                            Monnaie à rendre
                                        </span>

                                    </div>


                                    <span
                                        className={`payment-change-value ${
                                            monnaieARendre >
                                            0
                                                ? "has-change"
                                                : ""
                                        }`}
                                    >

                                        {formatMoney(
                                            monnaieARendre
                                        )}

                                    </span>

                                </div>

                            </div>


                            {/* RACCOURCIS */}

                            <div className="payment-quick-cash">

                                <span>
                                    Raccourcis :
                                </span>


                                {[
                                    montantNumber,
                                    10,
                                    20,
                                    50,
                                    100
                                ]
                                    .filter(
                                        (
                                            value,
                                            index,
                                            array
                                        ) =>
                                            value >=
                                                montantNumber &&
                                            array.indexOf(
                                                value
                                            ) === index
                                    )
                                    .slice(0, 4)
                                    .map(
                                        (value) => (

                                            <button
                                                key={value}
                                                type="button"
                                                className="payment-quick-btn"
                                                onClick={() =>
                                                    setMontantRecu(
                                                        String(
                                                            value
                                                        )
                                                    )
                                                }
                                                disabled={
                                                    loading
                                                }
                                            >

                                                {formatMoney(
                                                    value
                                                )}

                                            </button>

                                        )
                                    )}

                            </div>

                        </div>

                    )}


                    {/* =================================
                        ERREUR
                    ================================== */}

                    {error && (

                        <div className="payment-error-alert">

                            <AlertCircle
                                size={17}
                            />

                            <span>
                                {error}
                            </span>

                        </div>

                    )}

                </div>


                {/* =====================================
                    FOOTER
                ====================================== */}

                <div className="payment-modal-footer">

                    <button
                        type="button"
                        className="btn payment-btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >

                        Annuler

                    </button>


                    {onConfirmWithoutPayment && (

                        <button
                            type="button"
                            className="btn payment-btn-secondary"
                            onClick={
                                onConfirmWithoutPayment
                            }
                            disabled={
                                loading
                            }
                            title="Confirmer la réservation sans encaisser de paiement maintenant"
                        >

                            Confirmer sans encaisser

                        </button>

                    )}


                    <button
                        type="button"
                        className="btn payment-btn-confirm"
                        onClick={
                            handleSubmit
                        }
                        disabled={
                            loading ||
                            montantNumber <= 0
                        }
                    >

                        {loading ? (

                            <>

                                <Loader2
                                    size={16}
                                    className="spin"
                                />

                                <span>
                                    Enregistrement...
                                </span>

                            </>

                        ) : (

                            <>

                                <Check
                                    size={16}
                                />

                                <span>
                                    Valider le paiement
                                </span>

                            </>

                        )}

                    </button>

                </div>

            </div>

        </div>

    );
}


export default PaymentModal;