import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

import {
    getPaiementsDetails,
    createPaiement,
} from "../services/paiementService";

import {
    getVentes,
    getVente,
} from "../services/venteService";

import {
    getReservations,
    getReservation,
} from "../services/reservationService";

import { getClients } from "../services/clientService";
import { getCurrentUser } from "../services/authService";

import "./Paiements.css";

import { useSettings } from "../context/SettingsContext";


function Paiements() {

    const { formatMoney, currentCurrency } = useSettings();
    // =========================================================
    // DONNEES
    // =========================================================
    const [paiements, setPaiements] = useState([]);
    const [ventes, setVentes] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [clients, setClients] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // =========================================================
    // FORMULAIRE
    // =========================================================
    const [type, setType] = useState("VENTE");
    const [reference, setReference] = useState("");
    const [montant, setMontant] = useState("");
    const [modePaiement, setModePaiement] = useState("ESPECES");

    const [total, setTotal] = useState(0);
    const [totalPaye, setTotalPaye] = useState(0);
    const [resteAPayer, setResteAPayer] = useState(0);

    // =========================================================
    // FILTRES HISTORIQUE
    // =========================================================
    const [recherche, setRecherche] = useState("");
    const [periode, setPeriode] = useState("TOUS");
    const [dateJour, setDateJour] = useState("");
    const [mois, setMois] = useState("");
    const [annee, setAnnee] = useState("");
    const [filtreType, setFiltreType] = useState("TOUS");
    const [filtreMode, setFiltreMode] = useState("TOUS");

    // =========================================================
    // ETAT
    // =========================================================
    const [loading, setLoading] = useState(false);
    const [loadingMontant, setLoadingMontant] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [transactionDetail, setTransactionDetail] = useState(null);
    const [loadingDetail, setLoadingDetail] = useState(false);
    const [openPrintMenu, setOpenPrintMenu] = useState(null);

    // =========================================================
    // ERREUR FASTAPI -> TEXTE
    // =========================================================
    const getErrorMessage = (err, fallback) => {
        const detail = err?.response?.data?.detail;

        if (typeof detail === "string") {
            return detail;
        }

        if (Array.isArray(detail)) {
            return detail
                .map((item) => item?.msg || "Erreur de validation.")
                .join(" | ");
        }

        if (detail && typeof detail === "object") {
            return detail.msg || JSON.stringify(detail);
        }

        return err?.message || fallback;
    };

    // =========================================================
    // FORMAT MONTANT
    // =========================================================
    // const formatMontant = (value) => {
    //     return Number(value || 0).toLocaleString("fr-FR", {
    //         minimumFractionDigits: 2,
    //         maximumFractionDigits: 2,
    //     });
    // };
    const formatMontant = formatMoney;

    // =========================================================
    // FORMAT DATE
    // =========================================================
    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "—";
        }

        return parsed.toLocaleString("fr-FR", {
            dateStyle: "short",
            timeStyle: "short",
        });
    };

    // =========================================================
    // DETAIL / IMPRESSION D'UNE TRANSACTION
    // =========================================================
    const getClientName = (idClient) => {
        const client = clients.find(
            (item) => Number(item.id_client) === Number(idClient)
        );

        if (!client) {
            return "Client non renseigné";
        }

        const nom = `${client.prenom || ""} ${client.nom || ""}`.trim();
        return nom || `Client #${idClient}`;
    };

    const getUserName = (idUtilisateur) => {
        if (
            currentUser &&
            Number(currentUser.id_utilisateur) === Number(idUtilisateur)
        ) {
            const nom = `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim();
            return (
                nom ||
                currentUser.nom_utilisateur ||
                currentUser.username ||
                `Utilisateur #${idUtilisateur}`
            );
        }

        return idUtilisateur
            ? `Utilisateur #${idUtilisateur}`
            : "Utilisateur non renseigné";
    };

    const construireDetailTransaction = async (paiement) => {
        const estVente =
            paiement.id_vente !== null &&
            paiement.id_vente !== undefined;

        const referenceId = Number(
            estVente ? paiement.id_vente : paiement.id_reservation
        );

        // IMPORTANT : la liste /ventes ne contient pas les détails produits.
        // Pour une transaction, on doit donc toujours récupérer la ressource
        // complète via /ventes/{id} ou /reservations/{id}.
        let source = null;

        try {
            source = estVente
                ? await getVente(referenceId)
                : await getReservation(referenceId);
        } catch (error) {
            source = estVente
                ? ventes.find((item) => Number(item.id_vente) === referenceId)
                : reservations.find(
                    (item) => Number(item.id_reservation) === referenceId
                );

            if (!source) {
                throw error;
            }
        }

        const details = Array.isArray(source?.details)
            ? source.details
            : Array.isArray(source?.detail)
                ? source.detail
                : [];

        const paiementsReference = getPaiementsReference(
            referenceId,
            estVente ? "VENTE" : "RESERVATION"
        );

        // Le paiement affiché peut ne pas encore être présent dans le state
        // après une création. On le rajoute uniquement s'il manque.
        const paiementsComplets = paiementsReference.some(
            (item) => Number(item.id_paiement) === Number(paiement.id_paiement)
        )
            ? paiementsReference
            : [...paiementsReference, paiement];

        const totalPaye = paiementsComplets.reduce(
            (sum, item) => sum + Number(item.montant || 0),
            0
        );

        const total = getTotalReference(
            source,
            estVente ? "VENTE" : "RESERVATION"
        );

        // total_calcul est le prix brut calculé à partir des détails.
        const sousTotal = Number(
            source?.total_calcul ??
            source?.sous_total ??
            details.reduce(
                (sum, item) =>
                    sum +
                    Number(item.prix_unitaire || item.prix || 0) *
                    Number(item.quantite || 0),
                0
            )
        );

        const client =
            source?.client ||
            clients.find(
                (item) => Number(item.id_client) === Number(source?.id_client)
            ) ||
            null;

        const idUtilisateur =
            paiement.id_utilisateur ?? source?.id_utilisateur ?? null;

        return {
            paiement,
            type: estVente ? "VENTE" : "RESERVATION",
            reference: referenceId,
            source,
            client,
            details,
            sousTotal,
            rabais: Number(source?.rabais || 0),
            typeRabais: source?.type_rabais || "MONTANT",
            total,
            totalPaye,
            reste: Math.max(0, total - totalPaye),
            idUtilisateur,
            utilisateurNom: getUserName(idUtilisateur),
        };
    };

    const handleVoirTransaction = async (paiement) => {
        try { setLoadingDetail(true); setError(""); setTransactionDetail(await construireDetailTransaction(paiement)); }
        catch (err) { console.error(err); setError(getErrorMessage(err, "Impossible de charger le contenu de la transaction.")); }
        finally { setLoadingDetail(false); }
    };

    const togglePrintMenu = (menuId) => {
        setOpenPrintMenu((current) => (current === menuId ? null : menuId));
    };

    const imprimerTransaction = async (paiement, format = "A4") => {
        // Impression dans une fenêtre dédiée : la modal de l'application
        // n'est jamais imprimée. Cela évite les pages vides.
        setOpenPrintMenu(null);

        const printWindow = window.open(
            "",
            "_blank",
            "width=800,height=900,scrollbars=yes"
        );

        if (!printWindow) {
            setError(
                "Le navigateur a bloqué la fenêtre d'impression. Autorise les fenêtres pop-up pour cette application."
            );
            return;
        }

        try {
            const d = await construireDetailTransaction(paiement);

            const escapeHtml = (value) =>
                String(value ?? "")
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

            const clientNom = d.client
                ? `${d.client.prenom || ""} ${d.client.nom || ""}`.trim()
                : (
                    d.source?.nom_client ||
                    d.source?.client_nom ||
                    "Client non renseigné"
                );

            const lignes = d.details.length
                ? d.details.map((item) => {
                    const q = Number(item.quantite || 0);
                    const prix = Number(
                        item.prix_unitaire || item.prix || 0
                    );
                    const nom =
                        item.produit?.nom ||
                        item.nom_produit ||
                        item.nom ||
                        `Produit #${item.id_produit}`;

                    return `
                        <tr>
                            <td>${escapeHtml(nom)}</td>
                            <td>${q}</td>
                            <td>${formatMontant(prix)}</td>
                            <td>${formatMontant(q * prix)}</td>
                        </tr>
                    `;
                }).join("")
                : `
                    <tr>
                        <td colspan="4" class="empty">
                            Aucun détail produit disponible.
                        </td>
                    </tr>
                `;

            const rabaisReel = Math.max(
                0,
                Number(d.sousTotal || 0) - Number(d.total || 0)
            );

            const thermal = format === "THERMAL";

            printWindow.document.open();
            printWindow.document.write(`
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <title>Transaction #${escapeHtml(d.paiement.id_paiement)}</title>

                    <style>
                        * { box-sizing: border-box; }

                        html, body {
                            margin: 0;
                            padding: 0;
                            background: #fff;
                            color: #000;
                            font-family: Arial, Helvetica, sans-serif;
                        }

                        ${thermal ? `
                            /*
                             * IMPORTANT : Chrome ne respecte pas 80mm auto
                             * pour la taille d'une page d'impression.
                             * On donne donc une hauteur provisoire qui sera
                             * remplacée par la hauteur réelle du ticket avant print().
                             */
                            @page {
                                size: 80mm 120mm;
                                margin: 0 !important;
                            }

                            html, body {
                                width: 80mm !important;
                                min-width: 80mm !important;
                                max-width: 80mm !important;
                                margin: 0 !important;
                                padding: 0 !important;
                                background: #fff !important;
                            }

                            .receipt {
                                width: 72mm;
                                max-width: 72mm;
                                margin: 0 auto;
                                padding: 3mm 0;
                                font-size: 9px;
                                line-height: 1.25;
                            }

                            .header h1 { font-size: 15px; }
                            .header p { font-size: 9px; }

                            .info-row {
                                display: flex;
                                justify-content: space-between;
                                gap: 3mm;
                                margin: 1.2mm 0;
                            }

                            .info-row strong {
                                text-align: right;
                                overflow-wrap: anywhere;
                            }

                            h2 { font-size: 10px; margin: 3mm 0 2mm; }

                            table { font-size: 8.5px; }

                            th, td { padding: 1.4mm 0.6mm; }

                            th:first-child, td:first-child {
                                width: 43%;
                                text-align: left;
                            }

                            th:nth-child(2), td:nth-child(2) {
                                width: 12%;
                                text-align: center;
                            }

                            th:nth-child(3), td:nth-child(3),
                            th:nth-child(4), td:nth-child(4) {
                                width: 22.5%;
                                text-align: right;
                            }

                            .total { font-size: 11px; }
                            .footer { font-size: 8px; }
                        ` : `
                            @page {
                                size: A4;
                                margin: 10mm;
                            }

                            .receipt {
                                width: 180mm;
                                max-width: 180mm;
                                margin: 0 auto;
                                font-size: 11pt;
                            }

                            .header h1 { font-size: 20pt; }

                            .info {
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 5mm;
                            }

                            .info-row {
                                display: flex;
                                flex-direction: column;
                                gap: 1mm;
                            }

                            h2 { font-size: 13pt; }

                            th, td { padding: 3mm 2mm; }

                            .totals {
                                width: 80mm;
                                margin-left: auto;
                            }

                            .footer { font-size: 9pt; }
                        `}

                        .receipt { background: #fff; }

                        .header {
                            text-align: center;
                            border-bottom: 1px dashed #000;
                            padding-bottom: 3mm;
                            margin-bottom: 3mm;
                        }

                        .header h1 {
                            margin: 0 0 2mm;
                            font-weight: 700;
                        }

                        .header p { margin: 1mm 0; }

                        .info { margin-bottom: 3mm; }

                        h2 {
                            padding-bottom: 2mm;
                            border-bottom: 1px dashed #000;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            table-layout: fixed;
                        }

                        th, td {
                            border-bottom: 1px dashed #aaa;
                            vertical-align: top;
                            overflow-wrap: anywhere;
                        }

                        .empty { text-align: center !important; }

                        .totals { width: 100%; margin-top: 3mm; }

                        .totals-row {
                            display: flex;
                            justify-content: space-between;
                            gap: 3mm;
                            padding: 1.3mm 0;
                        }

                        .total {
                            border-top: 1px solid #000;
                            border-bottom: 1px solid #000;
                            margin: 1mm 0;
                            padding: 2mm 0;
                            font-weight: 700;
                        }

                        .remaining {
                            border-top: 1px dashed #000;
                            margin-top: 1mm;
                            padding-top: 2mm;
                        }

                        .footer {
                            text-align: center;
                            border-top: 1px dashed #000;
                            margin-top: 4mm;
                            padding-top: 3mm;
                        }

                        .footer p { margin: 1mm 0; }

                        tr, .header, .info, .totals, .footer {
                            break-inside: avoid;
                            page-break-inside: avoid;
                        }
                    </style>
                </head>

                <body>
                    <main class="receipt">
                        <header class="header">
                            <h1>LAZARE</h1>
                            <p>REÇU DE PAIEMENT</p>
                            <p>
                                ${d.type === "VENTE" ? "Vente" : "Réservation"}
                                #${escapeHtml(d.reference)}
                            </p>
                            <p>Transaction #${escapeHtml(d.paiement.id_paiement)}</p>
                        </header>

                        <section class="info">
                            <div class="info-row">
                                <span>Date</span>
                                <strong>${escapeHtml(formatDate(d.paiement.date_paiement))}</strong>
                            </div>
                            <div class="info-row">
                                <span>Caissier</span>
                                <strong>${escapeHtml(d.utilisateurNom)}</strong>
                            </div>
                            <div class="info-row">
                                <span>Client</span>
                                <strong>${escapeHtml(clientNom)}</strong>
                            </div>
                            <div class="info-row">
                                <span>Mode</span>
                                <strong>${escapeHtml(d.paiement.mode_paiement)}</strong>
                            </div>
                            <div class="info-row">
                                <span>Statut</span>
                                <strong>${escapeHtml(d.source?.statut || "—")}</strong>
                            </div>
                        </section>

                        <section>
                            <h2>Contenu de la transaction</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produit</th>
                                        <th>Qté</th>
                                        <th>Prix</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>${lignes}</tbody>
                            </table>
                        </section>

                        <section class="totals">
                            <div class="totals-row">
                                <span>Prix brut</span>
                                <strong>${formatMontant(d.sousTotal)}</strong>
                            </div>
                            <div class="totals-row">
                                <span>Rabais</span>
                                <strong>- ${formatMontant(rabaisReel)}</strong>
                            </div>
                            <div class="totals-row total">
                                <span>TOTAL À PAYER</span>
                                <strong>${formatMontant(d.total)}</strong>
                            </div>
                            <div class="totals-row">
                                <span>Total payé</span>
                                <strong>${formatMontant(d.totalPaye)}</strong>
                            </div>
                            <div class="totals-row remaining">
                                <span>Reste</span>
                                <strong>${formatMontant(d.reste)}</strong>
                            </div>
                        </section>

                        <footer class="footer">
                            <p>Merci pour votre confiance !</p>
                            <p>Nous vous remercions pour votre achat.</p>
                            <p>Conservez ce reçu comme preuve de paiement.</p>
                        </footer>
                    </main>
                </body>
                </html>
            `);

            printWindow.document.close();

            /*
             * TICKET THERMIQUE 80 MM
             * ---------------------
             * La largeur physique est toujours 80 mm.
             * Le contenu utilise 72 mm (marge utile d'une imprimante 80 mm).
             * La hauteur est calculée après rendu afin d'éviter qu'un ticket
             * thermique soit transformé en page A4/Letter ou en plusieurs pages.
             */
            const lancerImpression = async () => {
                try {
                    if (thermal) {
                        // Laisser le navigateur terminer le rendu du contenu.
                        await new Promise((resolve) => setTimeout(resolve, 350));

                        const receipt = printWindow.document.querySelector(".receipt");
                        const style = printWindow.document.querySelector("style");

                        if (!receipt || !style) {
                            throw new Error("Impossible de mesurer le ticket thermique.");
                        }

                        // Mesure en pixels puis conversion CSS px -> mm à 96 DPI.
                        const hauteurPx = Math.ceil(
                            Math.max(
                                receipt.scrollHeight,
                                receipt.getBoundingClientRect().height
                            )
                        );

                        // Quelques millimètres de sécurité pour éviter une coupure
                        // de la dernière ligne par l'imprimante.
                        const hauteurMm = Math.max(45, Math.ceil((hauteurPx * 25.4) / 96 + 3));

                        style.textContent += `
                            @media print {
                                @page {
                                    size: 80mm ${hauteurMm}mm !important;
                                    margin: 0 !important;
                                }

                                html, body {
                                    width: 80mm !important;
                                    min-width: 80mm !important;
                                    max-width: 80mm !important;
                                    height: ${hauteurMm}mm !important;
                                    min-height: ${hauteurMm}mm !important;
                                    margin: 0 !important;
                                    padding: 0 !important;
                                    overflow: visible !important;
                                }

                                .receipt {
                                    width: 72mm !important;
                                    max-width: 72mm !important;
                                    min-width: 72mm !important;
                                    margin: 0 auto !important;
                                    padding: 3mm 0 !important;
                                }
                            }
                        `;

                        // Forcer un reflow après l'injection de la taille exacte.
                        void printWindow.document.body.offsetHeight;
                    }

                    printWindow.focus();
                    printWindow.print();
                } catch (printError) {
                    console.error(printError);
                    try { printWindow.close(); } catch (_) {}
                    setError(
                        printError?.message ||
                        "Impossible de préparer le ticket thermique."
                    );
                }
            };

            lancerImpression();

            printWindow.addEventListener("afterprint", () => {
                setTimeout(() => {
                    try { printWindow.close(); } catch (_) {}
                }, 300);
            });
        } catch (err) {
            console.error(err);
            printWindow.close();
            setError(
                getErrorMessage(
                    err,
                    "Impossible de préparer l'impression."
                )
            );
        }
    };

    const telechargerPDF = async (paiement) => {
        setOpenPrintMenu(null);
        try {
            const d = await construireDetailTransaction(paiement);
            const doc = new jsPDF({ unit: "mm", format: "a4" });
            const w = doc.internal.pageSize.getWidth(), m = 15; let y = 18;
            doc.setFontSize(18); doc.setFont(undefined, "bold"); doc.text("RECU DE PAIEMENT", w / 2, y, { align: "center" }); y += 10;
            doc.setFontSize(10); doc.setFont(undefined, "normal");
            doc.text(`Transaction #${d.paiement.id_paiement}`, m, y); doc.text(`Date : ${formatDate(d.paiement.date_paiement)}`, w - m, y, { align: "right" }); y += 7;
            doc.text(`Type : ${d.type === "VENTE" ? "Vente" : "Reservation"}`, m, y); doc.text(`Reference : #${d.reference}`, w - m, y, { align: "right" }); y += 7;
            doc.text(`Caissier : ${d.utilisateurNom}`, m, y); y += 7;
            const clientNom = d.client ? `${d.client.prenom || ""} ${d.client.nom || ""}`.trim() : (d.source?.nom_client || d.source?.client_nom || "Client non renseigne");
            doc.setFont(undefined, "bold"); doc.text("Client", m, y); doc.setFont(undefined, "normal"); doc.text(clientNom || "Client non renseigne", m + 20, y); y += 7;
            doc.text(`Mode : ${d.paiement.mode_paiement}`, m, y); doc.text(`Statut : ${d.source?.statut || "-"}`, w - m, y, { align: "right" }); y += 10;
            doc.setFont(undefined, "bold"); doc.text("Produit", m, y); doc.text("Qte", 115, y, { align: "right" }); doc.text("Prix", 145, y, { align: "right" }); doc.text("Total", w - m, y, { align: "right" }); y += 6; doc.setFont(undefined, "normal");
            for (const item of d.details) {
                if (y > 270) { doc.addPage(); y = 18; }
                const nom = item.produit?.nom || item.nom_produit || item.nom || `Produit #${item.id_produit}`; const q = Number(item.quantite || 0); const prix = Number(item.prix_unitaire || item.prix || 0);
                doc.text(String(nom).slice(0, 55), m, y); doc.text(String(q), 115, y, { align: "right" }); doc.text(formatMontant(prix), 145, y, { align: "right" }); doc.text(formatMontant(q * prix), w - m, y, { align: "right" }); y += 6;
            }
            y += 5; doc.line(m, y, w - m, y); y += 8;
            doc.text("Prix brut", 125, y, { align: "right" }); doc.text(formatMontant(d.sousTotal), w - m, y, { align: "right" }); y += 6;
            doc.text("Rabais", 125, y, { align: "right" }); doc.text(`-${formatMontant(Math.max(0, d.sousTotal - d.total))}`, w - m, y, { align: "right" }); y += 7;
            doc.setFont(undefined, "bold"); doc.text("TOTAL A PAYER", 125, y, { align: "right" }); doc.text(formatMontant(d.total), w - m, y, { align: "right" }); y += 7;
            doc.text("Total paye", 125, y, { align: "right" }); doc.text(formatMontant(d.totalPaye), w - m, y, { align: "right" }); y += 7;
            doc.text("Reste", 125, y, { align: "right" }); doc.text(formatMontant(d.reste), w - m, y, { align: "right" }); y += 9;
            doc.setFont(undefined, "normal"); doc.text(`Paiement #${d.paiement.id_paiement} : ${d.paiement.mode_paiement}`, m, y); y += 12; doc.setFontSize(9); doc.text("Merci pour votre confiance !", w / 2, y, { align: "center" }); y += 5; doc.text("Nous vous remercions pour votre achat.", w / 2, y, { align: "center" });
            doc.save(`paiement-${d.paiement.id_paiement}.pdf`);
        } catch (err) { console.error(err); setError(getErrorMessage(err, "Impossible de générer le PDF.")); }
    };

    // =========================================================
    // CHARGER TOUTES LES DONNEES
    // =========================================================
    const chargerDonnees = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                paiementsData,
                ventesData,
                reservationsData,
                clientsData,
                userData,
            ] = await Promise.all([
                getPaiementsDetails(),
                getVentes(),
                getReservations(),
                getClients(),
                getCurrentUser(),
            ]);

            setPaiements(Array.isArray(paiementsData) ? paiementsData : []);
            setVentes(Array.isArray(ventesData) ? ventesData : []);
            setReservations(
                Array.isArray(reservationsData)
                    ? reservationsData
                    : []
            );
            setClients(Array.isArray(clientsData) ? clientsData : []);
            setCurrentUser(userData || null);
        } catch (err) {
            console.error(err);
            setError(
                getErrorMessage(
                    err,
                    "Impossible de charger les données."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
    }, []);

    // =========================================================
    // PAIEMENTS D'UNE REFERENCE
    // =========================================================
    const getPaiementsReference = (referenceId, paymentType) => {
        const id = Number(referenceId);

        return paiements.filter((paiement) => {
            if (paymentType === "VENTE") {
                return Number(paiement.id_vente) === id;
            }

            return Number(paiement.id_reservation) === id;
        });
    };

    // =========================================================
    // TOTAL D'UNE REFERENCE
    // =========================================================
    const getTotalReference = (item, paymentType) => {
        if (!item) {
            return 0;
        }

        return Number(
            item.total ??
            item.total_final ??
            item.total_calcul ??
            0
        );
    };

    // =========================================================
    // CHARGER LE MONTANT
    // =========================================================
    const chargerMontant = async (id, paymentType) => {
        if (!id) {
            setTotal(0);
            setTotalPaye(0);
            setResteAPayer(0);
            setMontant("");
            return;
        }

        try {
            setLoadingMontant(true);
            setError("");
            setMessage("");

            let item;

            if (paymentType === "VENTE") {
                item = ventes.find(
                    (vente) =>
                        Number(vente.id_vente) === Number(id)
                );

                if (!item) {
                    item = await getVente(Number(id));
                }
            } else {
                item = reservations.find(
                    (reservation) =>
                        Number(reservation.id_reservation) === Number(id)
                );

                if (
                    !item ||
                    item.total === undefined
                ) {
                    item = await getReservation(Number(id));
                }
            }

            if (!item) {
                throw new Error("Référence introuvable.");
            }

            const totalReference = getTotalReference(
                item,
                paymentType
            );

            const paiementsReference =
                getPaiementsReference(id, paymentType);

            const dejaPaye = paiementsReference.reduce(
                (sum, paiement) =>
                    sum + Number(paiement.montant || 0),
                0
            );

            const reste = Math.max(
                0,
                totalReference - dejaPaye
            );

            setTotal(totalReference);
            setTotalPaye(dejaPaye);
            setResteAPayer(reste);
            setMontant(
                reste > 0
                    ? reste.toFixed(2)
                    : ""
            );
        } catch (err) {
            console.error(err);

            setTotal(0);
            setTotalPaye(0);
            setResteAPayer(0);
            setMontant("");

            setError(
                getErrorMessage(
                    err,
                    "Impossible de récupérer le montant."
                )
            );
        } finally {
            setLoadingMontant(false);
        }
    };

    // =========================================================
    // CHANGEMENT TYPE
    // =========================================================
    const handleTypeChange = (value) => {
        setType(value);
        setReference("");
        setTotal(0);
        setTotalPaye(0);
        setResteAPayer(0);
        setMontant("");
        setMessage("");
        setError("");
    };

    // =========================================================
    // SELECTION REFERENCE
    // =========================================================
    const handleReferenceChange = async (event) => {
        const value = event.target.value;

        setReference(value);

        await chargerMontant(
            value,
            type
        );
    };

    // =========================================================
    // SOUMISSION PAIEMENT
    // =========================================================
    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        if (!reference) {
            setError(
                type === "VENTE"
                    ? "Veuillez sélectionner une vente."
                    : "Veuillez sélectionner une réservation."
            );
            return;
        }

        if (resteAPayer <= 0) {
            setError(
                "Aucun montant ne reste à payer."
            );
            return;
        }

        const montantNumerique =
            Number(montant);

        if (
            !Number.isFinite(montantNumerique) ||
            montantNumerique <= 0
        ) {
            setError(
                "Veuillez saisir un montant valide."
            );
            return;
        }

        if (
            montantNumerique > resteAPayer + 0.000001
        ) {
            setError(
                `Le montant ne peut pas dépasser ${formatMontant(
                    resteAPayer
                )}.`
            );
            return;
        }

        const paiementData =
            type === "VENTE"
                ? {
                    montant: montantNumerique,
                    mode_paiement: modePaiement,
                    id_vente: Number(reference),
                    id_reservation: null,
                }
                : {
                    montant: montantNumerique,
                    mode_paiement: modePaiement,
                    id_vente: null,
                    id_reservation: Number(reference),
                };

        try {
            setLoading(true);

            await createPaiement(
                paiementData
            );

            setMessage(
                type === "VENTE"
                    ? "Paiement de la vente enregistré avec succès."
                    : "Paiement de la réservation enregistré avec succès."
            );

            await chargerDonnees();

            await chargerMontant(
                reference,
                type
            );
        } catch (err) {
            console.error(err);

            setError(
                getErrorMessage(
                    err,
                    "Impossible d'enregistrer le paiement."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // FILTRES HISTORIQUE
    // =========================================================
    const paiementsFiltres = useMemo(() => {
        const query = recherche
            .trim()
            .toLowerCase();

        return paiements.filter((paiement) => {
            const estVente =
                paiement.id_vente !== null &&
                paiement.id_vente !== undefined;

            const typePaiement =
                estVente
                    ? "VENTE"
                    : "RESERVATION";

            if (
                filtreType !== "TOUS" &&
                filtreType !== typePaiement
            ) {
                return false;
            }

            if (
                filtreMode !== "TOUS" &&
                paiement.mode_paiement !== filtreMode
            ) {
                return false;
            }

            if (query) {
                const reference = estVente
                    ? paiement.id_vente
                    : paiement.id_reservation;

                const texte = [
                    paiement.id_paiement,
                    reference,
                    paiement.mode_paiement,
                    typePaiement,
                ]
                    .join(" ")
                    .toLowerCase();

                if (!texte.includes(query)) {
                    return false;
                }
            }

            if (!paiement.date_paiement) {
                return periode === "TOUS";
            }

            const date = new Date(
                paiement.date_paiement
            );

            if (Number.isNaN(date.getTime())) {
                return false;
            }

            if (periode === "JOUR" && dateJour) {
                const valeur =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}-${String(
                        date.getDate()
                    ).padStart(2, "0")}`;

                if (valeur !== dateJour) {
                    return false;
                }
            }

            if (periode === "MOIS" && mois) {
                const valeur =
                    `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;

                if (valeur !== mois) {
                    return false;
                }
            }

            if (periode === "ANNEE" && annee) {
                if (
                    String(date.getFullYear()) !==
                    String(annee)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [
        paiements,
        recherche,
        periode,
        dateJour,
        mois,
        annee,
        filtreType,
        filtreMode,
    ]);

    // =========================================================
    // TOTAL HISTORIQUE FILTRE
    // =========================================================
    const montantTotalFiltre =
        paiementsFiltres.reduce(
            (sum, paiement) =>
                sum +
                Number(
                    paiement.montant || 0
                ),
            0
        );

    // =========================================================
    // RESET FILTRES
    // =========================================================
    const resetFiltres = () => {
        setRecherche("");
        setPeriode("TOUS");
        setDateJour("");
        setMois("");
        setAnnee("");
        setFiltreType("TOUS");
        setFiltreMode("TOUS");
    };

    // =========================================================
    // RENDU
    // =========================================================
    return (
        <div className="paiements-page">

            <div className="page-header">
                {/* <div>
                    <h1>Paiements</h1>
                    <p>
                        Gestion centralisée des paiements
                        des ventes et réservations
                    </p>
                </div> */}

                <button
                    type="button"
                    className="btn-refresh"
                    onClick={chargerDonnees}
                    disabled={loading}
                >
                    Actualiser
                </button>
            </div>

            {message && (
                <div className="alert alert-success">
                    {message}
                </div>
            )}

            {error && (
                <div className="alert alert-error">
                    {error}
                </div>
            )}

            {/* =================================================
                FORMULAIRE
            ================================================== */}
            {/* <div className="paiement-form-card">

                <div className="card-title">
                    <div>
                        <h2>Enregistrer un paiement</h2>
                        <p>
                            Le paiement validé déclenche
                            automatiquement les opérations
                            métier correspondantes.
                        </p>
                    </div>
                </div>

                <form
                    className="payment-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-grid">

                        <div className="form-group">
                            <label>Type de paiement</label>

                            <select
                                value={type}
                                onChange={(event) =>
                                    handleTypeChange(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                            >
                                <option value="VENTE">
                                    Vente
                                </option>
                                <option value="RESERVATION">
                                    Réservation
                                </option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>
                                {type === "VENTE"
                                    ? "Vente"
                                    : "Réservation"}
                            </label>

                            <select
                                value={reference}
                                onChange={
                                    handleReferenceChange
                                }
                                disabled={loading}
                                required
                            >
                                <option value="">
                                    Sélectionner
                                </option>

                                {type === "VENTE"
                                    ? ventes
                                        .filter(
                                            (vente) =>
                                                vente.statut ===
                                                "EN_COURS"
                                        )
                                        .map((vente) => (
                                            <option
                                                key={
                                                    vente.id_vente
                                                }
                                                value={
                                                    vente.id_vente
                                                }
                                            >
                                                Vente #
                                                {vente.id_vente}
                                                {" — "}
                                                {formatMontant(
                                                    vente.total
                                                )}
                                            </option>
                                        ))
                                    : reservations
                                        .filter(
                                            (reservation) =>
                                                reservation.statut ===
                                                "EN_ATTENTE"
                                        )
                                        .map(
                                            (
                                                reservation
                                            ) => (
                                                <option
                                                    key={
                                                        reservation.id_reservation
                                                    }
                                                    value={
                                                        reservation.id_reservation
                                                    }
                                                >
                                                    Réservation #
                                                    {
                                                        reservation.id_reservation
                                                    }
                                                    {" — "}
                                                    {
                                                        reservation.statut
                                                    }
                                                </option>
                                            )
                                        )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Montant</label>

                            <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={montant}
                                onChange={(event) =>
                                    setMontant(
                                        event.target.value
                                    )
                                }
                                disabled={
                                    loadingMontant ||
                                    loading ||
                                    resteAPayer <= 0
                                }
                                required
                            />

                            {loadingMontant && (
                                <small>
                                    Calcul du montant...
                                </small>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Mode de paiement</label>

                            <select
                                value={modePaiement}
                                onChange={(event) =>
                                    setModePaiement(
                                        event.target.value
                                    )
                                }
                                disabled={loading}
                            >
                                <option value="ESPECES">
                                    Espèces
                                </option>
                                <option value="CARTE">
                                    Carte
                                </option>
                                <option value="VIREMENT">
                                    Virement
                                </option>
                                <option value="CHEQUE">
                                    Chèque
                                </option>
                                <option value="AUTRE">
                                    Autre
                                </option>
                            </select>
                        </div>

                    </div>

                    {(reference || total > 0) && (
                        <div className="paiement-summary">

                            <div className="summary-item">
                                <span>Total</span>
                                <strong>
                                    {formatMontant(total)}
                                </strong>
                            </div>

                            <div className="summary-item">
                                <span>Déjà payé</span>
                                <strong>
                                    {formatMontant(
                                        totalPaye
                                    )}
                                </strong>
                            </div>

                            <div className="summary-item highlight">
                                <span>Reste à payer</span>
                                <strong>
                                    {formatMontant(
                                        resteAPayer
                                    )}
                                </strong>
                            </div>

                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={
                            loading ||
                            loadingMontant ||
                            !reference ||
                            resteAPayer <= 0
                        }
                    >
                        {loading
                            ? "Enregistrement..."
                            : "Enregistrer le paiement"}
                    </button>

                </form>
            </div> */}

            {/* =================================================
                HISTORIQUE
            ================================================== */}
            <div className="paiements-table-card">

                <div className="table-header">
                    <div>
                        <h2>Historique des paiements</h2>
                        <p>
                            {paiementsFiltres.length}
                            {" "}paiement(s) affiché(s)
                        </p>
                    </div>

                    <strong className="filtered-total">
                        Total affiché :
                        {" "}
                        {formatMontant(
                            montantTotalFiltre
                        )}
                    </strong>
                </div>

                <div className="payment-filters">

                    <div className="filter-group search-filter">
                        <label>Recherche</label>
                        <input
                            type="text"
                            value={recherche}
                            onChange={(event) =>
                                setRecherche(
                                    event.target.value
                                )
                            }
                            placeholder="ID, référence, mode..."
                        />
                    </div>

                    <div className="filter-group">
                        <label>Période</label>
                        <select
                            value={periode}
                            onChange={(event) =>
                                setPeriode(
                                    event.target.value
                                )
                            }
                        >
                            <option value="TOUS">
                                Toutes les dates
                            </option>
                            <option value="JOUR">
                                Jour
                            </option>
                            <option value="MOIS">
                                Mois
                            </option>
                            <option value="ANNEE">
                                Année
                            </option>
                        </select>
                    </div>

                    {periode === "JOUR" && (
                        <div className="filter-group">
                            <label>Jour</label>
                            <input
                                type="date"
                                value={dateJour}
                                onChange={(event) =>
                                    setDateJour(
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    )}

                    {periode === "MOIS" && (
                        <div className="filter-group">
                            <label>Mois</label>
                            <input
                                type="month"
                                value={mois}
                                onChange={(event) =>
                                    setMois(
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    )}

                    {periode === "ANNEE" && (
                        <div className="filter-group">
                            <label>Année</label>
                            <input
                                type="number"
                                min="2000"
                                max="2100"
                                value={annee}
                                onChange={(event) =>
                                    setAnnee(
                                        event.target.value
                                    )
                                }
                                placeholder="2026"
                            />
                        </div>
                    )}

                    <div className="filter-group">
                        <label>Type</label>
                        <select
                            value={filtreType}
                            onChange={(event) =>
                                setFiltreType(
                                    event.target.value
                                )
                            }
                        >
                            <option value="TOUS">
                                Tous
                            </option>
                            <option value="VENTE">
                                Vente
                            </option>
                            <option value="RESERVATION">
                                Réservation
                            </option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Mode</label>
                        <select
                            value={filtreMode}
                            onChange={(event) =>
                                setFiltreMode(
                                    event.target.value
                                )
                            }
                        >
                            <option value="TOUS">
                                Tous
                            </option>
                            <option value="ESPECES">
                                Espèces
                            </option>
                            <option value="CARTE">
                                Carte
                            </option>
                            <option value="VIREMENT">
                                Virement
                            </option>
                            <option value="CHEQUE">
                                Chèque
                            </option>
                            <option value="AUTRE">
                                Autre
                            </option>
                        </select>
                    </div>

                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={resetFiltres}
                    >
                        Réinitialiser
                    </button>

                </div>

                {loading && paiements.length === 0 ? (
                    <div className="empty-state">
                        Chargement des paiements...
                    </div>
                ) : paiementsFiltres.length === 0 ? (
                    <div className="empty-state">
                        Aucun paiement ne correspond
                        aux filtres.
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="paiements-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Date</th>
                                    <th>Type</th>
                                    <th>Référence</th>
                                    <th>Montant</th>
                                    <th>Mode</th>
                                    <th>Total</th>
                                    <th>Déjà payé</th>
                                    <th>Reste</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {paiementsFiltres.map(
                                    (paiement) => {
                                        const estVente =
                                            paiement.id_vente !== null &&
                                            paiement.id_vente !== undefined;

                                        const referenceId =
                                            estVente
                                                ? paiement.id_vente
                                                : paiement.id_reservation;

                                        const paiementsReference =
                                            getPaiementsReference(
                                                referenceId,
                                                estVente
                                                    ? "VENTE"
                                                    : "RESERVATION"
                                            );

                                        const totalPayeLigne =
                                            paiementsReference.reduce(
                                                (sum, item) =>
                                                    sum +
                                                    Number(
                                                        item.montant || 0
                                                    ),
                                                0
                                            );

                                        const source =
                                            estVente
                                                ? ventes.find(
                                                    (vente) =>
                                                        Number(
                                                            vente.id_vente
                                                        ) ===
                                                        Number(
                                                            referenceId
                                                        )
                                                )
                                                : reservations.find(
                                                    (reservation) =>
                                                        Number(
                                                            reservation.id_reservation
                                                        ) ===
                                                        Number(
                                                            referenceId
                                                        )
                                                );

                                        const totalLigne =
                                            getTotalReference(
                                                source,
                                                estVente
                                                    ? "VENTE"
                                                    : "RESERVATION"
                                            );

                                        const resteLigne =
                                            Math.max(
                                                0,
                                                totalLigne -
                                                totalPayeLigne
                                            );

                                        const statut =
                                            source?.statut ||
                                            "—";

                                        return (
                                            <tr
                                                key={
                                                    paiement.id_paiement
                                                }
                                            >
                                                <td>
                                                    #
                                                    {
                                                        paiement.id_paiement
                                                    }
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        paiement.date_paiement
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            estVente
                                                                ? "badge badge-sale"
                                                                : "badge badge-reservation"
                                                        }
                                                    >
                                                        {estVente
                                                            ? "Vente"
                                                            : "Réservation"}
                                                    </span>
                                                </td>

                                                <td>
                                                    #
                                                    {referenceId}
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatMontant(
                                                            paiement.montant
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    {
                                                        paiement.mode_paiement
                                                    }
                                                </td>

                                                <td>
                                                    {formatMontant(
                                                        totalLigne
                                                    )}
                                                </td>

                                                <td>
                                                    {formatMontant(
                                                        totalPayeLigne
                                                    )}
                                                </td>

                                                <td>
                                                    {formatMontant(
                                                        resteLigne
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={
                                                            `status status-${String(
                                                                statut
                                                            )
                                                                .toLowerCase()
                                                                .replace(
                                                                    /_/g,
                                                                    "-"
                                                                )}`
                                                        }
                                                    >
                                                        {statut}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="transaction-actions">
                                                        <button type="button" className="btn-icon" title="Voir" onClick={() => handleVoirTransaction(paiement)} disabled={loadingDetail}>👁️</button>
                                                        <div className="print-menu-wrap">
                                                            <button
                                                                type="button"
                                                                className="btn-icon print-main-button"
                                                                title="Options d'impression"
                                                                onClick={() => togglePrintMenu(`table-${paiement.id_paiement}`)}
                                                            >
                                                                🖨️ <span>Impression</span> ▾
                                                            </button>
                                                            {openPrintMenu === `table-${paiement.id_paiement}` && (
                                                                <div className="print-menu">
                                                                    <button type="button" onClick={() => imprimerTransaction(paiement, "THERMAL")}>🧾 Ticket thermique 80 mm</button>
                                                                    <button type="button" onClick={() => imprimerTransaction(paiement, "A4")}>📄 Document A4</button>
                                                                    <button type="button" onClick={() => telechargerPDF(paiement)}>📥 Télécharger PDF</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )}
                            </tbody>

                        </table>
                    </div>
                )}

            </div>

            {transactionDetail && (
                <div
                    className="transaction-modal-overlay"
                    onClick={() => {
                        setOpenPrintMenu(null);
                        setTransactionDetail(null);
                    }}
                >
                    <div
                        className="transaction-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="transaction-modal-header">
                            <div>
                                <h2>
                                    Transaction #{transactionDetail.paiement.id_paiement}
                                </h2>
                                <p>
                                    {transactionDetail.type === "VENTE"
                                        ? "Vente"
                                        : "Réservation"} #{transactionDetail.reference}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => {
                                    setOpenPrintMenu(null);
                                    setTransactionDetail(null);
                                }}
                            >
                                ×
                            </button>
                        </div>

                        <div className="transaction-detail-grid">
                            <div>
                                <span>Date et heure</span>
                                <strong>
                                    {formatDate(
                                        transactionDetail.paiement.date_paiement
                                    )}
                                </strong>
                            </div>

                            <div>
                                <span>Mode de paiement</span>
                                <strong>
                                    {transactionDetail.paiement.mode_paiement || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Client</span>
                                <strong>
                                    {transactionDetail.client
                                        ? `${transactionDetail.client.prenom || ""} ${transactionDetail.client.nom || ""}`.trim()
                                        : "Client non renseigné"}
                                </strong>
                            </div>

                            <div>
                                <span>Caissier</span>
                                <strong>
                                    {transactionDetail.utilisateurNom}
                                </strong>
                            </div>

                            <div>
                                <span>Statut</span>
                                <strong>
                                    {transactionDetail.source?.statut || "—"}
                                </strong>
                            </div>

                            <div>
                                <span>Référence</span>
                                <strong>
                                    {transactionDetail.type === "VENTE"
                                        ? `Vente #${transactionDetail.reference}`
                                        : `Réservation #${transactionDetail.reference}`}
                                </strong>
                            </div>
                        </div>

                        <div className="transaction-items">
                            <h3>Produits de la transaction</h3>

                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Produit</th>
                                        <th>Qté</th>
                                        <th>Prix unitaire</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {transactionDetail.details.length ? (
                                        transactionDetail.details.map((item, index) => {
                                            const q = Number(item.quantite || 0);
                                            const prix = Number(
                                                item.prix_unitaire || item.prix || 0
                                            );
                                            const nom =
                                                item.produit?.nom ||
                                                item.nom_produit ||
                                                item.nom ||
                                                `Produit #${item.id_produit}`;

                                            return (
                                                <tr
                                                    key={
                                                        item.id_detail_vente ||
                                                        item.id_detail_reservation ||
                                                        `${item.id_produit}-${index}`
                                                    }
                                                >
                                                    <td>{index + 1}</td>
                                                    <td>{nom}</td>
                                                    <td>{q}</td>
                                                    <td>{formatMontant(prix)}</td>
                                                    <td>{formatMontant(q * prix)}</td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5">
                                                Aucun détail produit disponible.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="transaction-totals">
                            <div>
                                <span>Prix brut</span>
                                <strong>
                                    {formatMontant(transactionDetail.sousTotal)}
                                </strong>
                            </div>

                            <div>
                                <span>Rabais</span>
                                <strong>
                                    - {formatMontant(
                                        Math.max(
                                            0,
                                            transactionDetail.sousTotal -
                                                transactionDetail.total
                                        )
                                    )}
                                </strong>
                            </div>

                            <div className="transaction-total-final">
                                <span>Total à payer</span>
                                <strong>
                                    {formatMontant(transactionDetail.total)}
                                </strong>
                            </div>

                            <div>
                                <span>Total payé</span>
                                <strong>
                                    {formatMontant(transactionDetail.totalPaye)}
                                </strong>
                            </div>

                            <div className="remaining">
                                <span>Reste</span>
                                <strong>
                                    {formatMontant(transactionDetail.reste)}
                                </strong>
                            </div>
                        </div>

                        <div className="transaction-modal-actions">
                            <div className="print-menu-wrap">
                                <button
                                    type="button"
                                    className="btn-primary print-main-button"
                                    onClick={() => togglePrintMenu("modal")}
                                >
                                    🖨️ Impression ▾
                                </button>

                                {openPrintMenu === "modal" && (
                                    <div className="print-menu print-menu-modal">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                imprimerTransaction(
                                                    transactionDetail.paiement,
                                                    "THERMAL"
                                                )
                                            }
                                        >
                                            🧾 Ticket thermique 80 mm
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                imprimerTransaction(
                                                    transactionDetail.paiement,
                                                    "A4"
                                                )
                                            }
                                        >
                                            📄 Document A4
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                telechargerPDF(
                                                    transactionDetail.paiement
                                                )
                                            }
                                        >
                                            📥 Télécharger PDF
                                        </button>
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => {
                                    setOpenPrintMenu(null);
                                    setTransactionDetail(null);
                                }}
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Paiements;
