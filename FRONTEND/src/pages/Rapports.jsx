import { useEffect, useMemo, useState } from "react";
import { CalendarDays, RefreshCw, Search, Printer, FileText, X, Eye, Filter, DollarSign, ShoppingCart, CreditCard } from "lucide-react";
import { getPaiementsDetails } from "../services/paiementService";
import { getVentes } from "../services/venteService";
import { getReservations } from "../services/reservationService";
import { getClients } from "../services/clientService";
import { getCurrentUser } from "../services/authService";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { getMyEntreprise } from "../services/entrepriseService";
import { getParametres } from "../services/parametreService";
import "./Rapports.css";

function Rapport() {
    const { formatMoney } = useSettings();

    const localDate = (d = new Date()) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    };

    const [paiements, setPaiements] = useState([]);
    const [ventes, setVentes] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [clients, setClients] = useState([]);
    const [utilisateurs, setUtilisateurs] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [periode, setPeriode] = useState("AUJOURD_HUI");
    const [dateDebut, setDateDebut] = useState(localDate());
    const [dateFin, setDateFin] = useState(localDate());
    const [type, setType] = useState("TOUS");
    const [mode, setMode] = useState("TOUS");
    const [statut, setStatut] = useState("TOUS");
    const [recherche, setRecherche] = useState("");
    const [printOpen, setPrintOpen] = useState(false);
    const [printFormat, setPrintFormat] = useState("A4");
    const [detail, setDetail] = useState(null);

    const [entreprise, setEntreprise] = useState({ nom:"LAZARE_SYS", adresse:"", telephone:"", email:"", site_web:"", logo:null });
    const [receiptSettings, setReceiptSettings] = useState({ afficher_logo:true, afficher_adresse:true, afficher_telephone:true, afficher_email:true, format_ticket:"80mm" });

    const chargerDonnees = async () => {
        try {
            setLoading(true);
            setError("");
            const [p, v, r, c, u, me] = await Promise.all([
                getPaiementsDetails(),
                getVentes(),
                getReservations(),
                getClients(),
                api.get("/utilisateurs/").then(response => response.data).catch(() => []),
                getCurrentUser().catch(() => null)
            ]);
            setPaiements(Array.isArray(p) ? p : []);
            setVentes(Array.isArray(v) ? v : []);
            setReservations(Array.isArray(r) ? r : []);
            setClients(Array.isArray(c) ? c : []);
            setUtilisateurs(Array.isArray(u) ? u : []);
            setCurrentUser(me || null);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || err.message || "Impossible de charger les données.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chargerDonnees();
        const loadSettings = async () => {
            try {
                const [e, p] = await Promise.all([getMyEntreprise().catch(() => null), getParametres().catch(() => null)]);
                const param = Array.isArray(p) ? p[0] : p;
                const logo = e?.logo ? new URL(e.logo, api.defaults.baseURL).href : null;
                setEntreprise({ nom:e?.nom || "LAZARE_SYS", adresse:e?.adresse || "", telephone:e?.telephone || "", email:e?.email || "", site_web:e?.site_web || "", logo });
                setReceiptSettings({ afficher_logo:param?.afficher_logo ?? true, afficher_adresse:param?.afficher_adresse ?? true, afficher_telephone:param?.afficher_telephone ?? true, afficher_email:param?.afficher_email ?? true, format_ticket:param?.format_ticket || "80mm" });
            } catch (err) { console.error("Erreur chargement entreprise/paramètres :", err); }
        };
        loadSettings();
    }, []);

    const clientsMap = useMemo(() => Object.fromEntries(clients.map(c => [c.id_client, c])), [clients]);
    const ventesMap = useMemo(() => Object.fromEntries(ventes.map(v => [v.id_vente, v])), [ventes]);
    const reservationsMap = useMemo(() => Object.fromEntries(reservations.map(r => [r.id_reservation, r])), [reservations]);
    const utilisateursMap = useMemo(() => Object.fromEntries(utilisateurs.map(u => [u.id_utilisateur, u])), [utilisateurs]);

    const money = formatMoney;
    const dateText = (v) => v ? new Date(v).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
    const dateOnly = (v) => v ? new Date(v).toLocaleDateString("fr-FR") : "—";

    const clientName = (id) => {
        const c = clientsMap[id];
        if (!c) return id ? `Client #${id}` : "Client non renseigné";
        return `${c.nom || ""} ${c.prenom || ""}`.trim() || `Client #${id}`;
    };

    const utilisateurName = (item, id) => {
        const utilisateur =
            item?.utilisateur ||
            item?.user ||
            item?.utilisateur_info ||
            item?.user_info ||
            (id != null ? utilisateursMap[id] : null);

        if (utilisateur && typeof utilisateur === "object") {
            const nomComplet = `${utilisateur.prenom || utilisateur.first_name || ""} ${utilisateur.nom || utilisateur.last_name || ""}`.trim();
            if (nomComplet) return nomComplet;

            const identifiant =
                utilisateur.nom_utilisateur ||
                utilisateur.username ||
                utilisateur.login ||
                utilisateur.email;

            if (identifiant) return identifiant;
        }

        const nomDirect =
            item?.nom_utilisateur ||
            item?.username ||
            item?.user_name ||
            item?.utilisateur_nom ||
            item?.nom_utilisateur_complet;

        if (nomDirect) return nomDirect;

        if (currentUser && id != null && Number(currentUser.id_utilisateur) === Number(id)) {
            const nomComplet = `${currentUser.prenom || ""} ${currentUser.nom || ""}`.trim();
            if (nomComplet) return nomComplet;
            return currentUser.nom_utilisateur || currentUser.username || "Utilisateur connecté";
        }

        return id ? `Utilisateur #${id}` : "Utilisateur non renseigné";
    };

    const txType = (p) => p.id_vente != null ? "VENTE" : p.id_reservation != null ? "RESERVATION" : "AUTRE";
    const txData = (p) => txType(p) === "VENTE" ? ventesMap[p.id_vente] || {} : txType(p) === "RESERVATION" ? reservationsMap[p.id_reservation] || {} : {};
    const txRef = (p) => txType(p) === "VENTE" ? `Vente #${p.id_vente}` : txType(p) === "RESERVATION" ? `Réservation #${p.id_reservation}` : `Paiement #${p.id_paiement || "—"}`;
    const txStatus = (p) => txData(p).statut || (txType(p) === "VENTE" ? "PAYEE" : txType(p) === "RESERVATION" ? "CONFIRMEE" : "ENREGISTRE");

    // Tous les statuts réellement présents dans les données sont proposés dans le filtre.
    // Les statuts connus gardent leur libellé actuel ; les nouveaux statuts du backend sont ajoutés automatiquement.
    const statutLabels = {
        PAYEE: "Payée",
        CONFIRMEE: "Confirmée",
        EN_ATTENTE: "En attente",
        EN_COURS: "En cours",
        ANNULEE: "Annulée",
        TERMINEE: "Terminée",
        ENREGISTRE: "Enregistré",
    };

    const formatStatut = (value) => {
        const key = String(value || "").trim().toUpperCase();
        if (statutLabels[key]) return statutLabels[key];
        return key
            ? key
                .toLowerCase()
                .split("_")
                .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ")
            : "—";
    };

    const statutsDisponibles = useMemo(() => {
        const found = new Set(["PAYEE", "CONFIRMEE", "EN_ATTENTE", "ANNULEE"]);

        [...ventes, ...reservations, ...paiements].forEach(item => {
            if (item?.statut) found.add(String(item.statut).trim().toUpperCase());
        });

        const ordre = [
            "PAYEE",
            "CONFIRMEE",
            "EN_ATTENTE",
            "EN_COURS",
            "TERMINEE",
            "ANNULEE",
            "ENREGISTRE",
        ];

        return Array.from(found).sort((a, b) => {
            const ia = ordre.indexOf(a);
            const ib = ordre.indexOf(b);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return a.localeCompare(b, "fr");
        });
    }, [ventes, reservations, paiements]);

    const preset = (value) => {
        const now = new Date();
        let start = new Date(now);
        let end = new Date(now);
        const day = now.getDay();
        const monday = day === 0 ? 6 : day - 1;

        if (value === "HIER") { start.setDate(now.getDate() - 1); end.setDate(now.getDate() - 1); }
        if (value === "CETTE_SEMAINE") start.setDate(now.getDate() - monday);
        if (value === "SEMAINE_PRECEDENTE") { start.setDate(now.getDate() - monday - 7); end.setDate(now.getDate() - monday - 1); }
        if (value === "CE_MOIS") start = new Date(now.getFullYear(), now.getMonth(), 1);
        if (value === "MOIS_PRECEDENT") { start = new Date(now.getFullYear(), now.getMonth() - 1, 1); end = new Date(now.getFullYear(), now.getMonth(), 0); }
        if (value === "CETTE_ANNEE") start = new Date(now.getFullYear(), 0, 1);
        if (value === "ANNEE_PRECEDENTE") { start = new Date(now.getFullYear() - 1, 0, 1); end = new Date(now.getFullYear() - 1, 11, 31); }
        if (value === "7_JOURS") start.setDate(now.getDate() - 6);
        if (value === "30_JOURS") start.setDate(now.getDate() - 29);

        setDateDebut(localDate(start));
        setDateFin(localDate(end));
    };

    const changePeriode = (v) => { setPeriode(v); if (v !== "PERSONNALISEE") preset(v); };

    const transactions = useMemo(() => {
        const start = new Date(`${dateDebut}T00:00:00`);
        const end = new Date(`${dateFin}T23:59:59.999`);
        const q = recherche.trim().toLowerCase();

        // Les paiements restent la source principale des encaissements.
        // On ajoute ensuite les ventes/réservations qui n'ont encore aucun paiement
        // afin que leurs statuts (EN_ATTENTE, ANNULEE, EN_COURS, etc.) ne disparaissent jamais.
        const paymentTransactions = paiements.map(p => {
            const d = txData(p);
            const date = p.date_paiement ? new Date(p.date_paiement) : null;
            return {
                ...p,
                _source: "PAIEMENT",
                date,
                typeTransaction: txType(p),
                reference: txRef(p),
                statutTransaction: txStatus(p),
                data: d,
                client: clientName(d.id_client ?? p.id_client)
            };
        });

        const paymentSaleIds = new Set(
            paiements
                .filter(p => p.id_vente != null)
                .map(p => Number(p.id_vente))
        );

        const paymentReservationIds = new Set(
            paiements
                .filter(p => p.id_reservation != null)
                .map(p => Number(p.id_reservation))
        );

        const extractDate = (item, typeItem) => {
            const value = typeItem === "VENTE"
                ? (item.date_vente || item.created_at || item.date_creation || item.date)
                : (item.date_reservation || item.created_at || item.date_creation || item.date);
            return value ? new Date(value) : null;
        };

        const noPaymentTransactions = [
            ...ventes
                .filter(v => !paymentSaleIds.has(Number(v.id_vente)))
                .map(v => ({
                    ...v,
                    id_paiement: `VENTE-${v.id_vente}`,
                    _source: "TRANSACTION",
                    date: extractDate(v, "VENTE"),
                    typeTransaction: "VENTE",
                    reference: `Vente #${v.id_vente}`,
                    statutTransaction: v.statut || "EN_ATTENTE",
                    data: v,
                    client: clientName(v.id_client),
                    mode_paiement: "—",
                    montant: 0,
                    id_utilisateur: v.id_utilisateur ?? null
                })),
            ...reservations
                .filter(r => !paymentReservationIds.has(Number(r.id_reservation)))
                .map(r => ({
                    ...r,
                    id_paiement: `RESERVATION-${r.id_reservation}`,
                    _source: "TRANSACTION",
                    date: extractDate(r, "RESERVATION"),
                    typeTransaction: "RESERVATION",
                    reference: `Réservation #${r.id_reservation}`,
                    statutTransaction: r.statut || "EN_ATTENTE",
                    data: r,
                    client: clientName(r.id_client),
                    mode_paiement: "—",
                    montant: 0,
                    id_utilisateur: r.id_utilisateur ?? null
                }))
        ];

        return [...paymentTransactions, ...noPaymentTransactions]
            .filter(t => {
                if (!t.date || Number.isNaN(t.date.getTime()) || t.date < start || t.date > end) return false;
                if (type !== "TOUS" && t.typeTransaction !== type) return false;
                if (mode !== "TOUS" && t.mode_paiement !== mode) return false;
                if (statut !== "TOUS" && t.statutTransaction !== statut) return false;
                if (q && ![t.reference, t.client, t.mode_paiement, t.statutTransaction, t.id_utilisateur].join(" ").toLowerCase().includes(q)) return false;
                return true;
            })
            .sort((a, b) => b.date - a.date);
    }, [paiements, ventes, reservations, ventesMap, reservationsMap, clientsMap, utilisateursMap, currentUser, dateDebut, dateFin, type, mode, statut, recherche]);

    const stats = useMemo(() => {
        const sum = (arr) => arr.reduce((s, x) => s + Number(x.montant || 0), 0);
        return {
            count: transactions.length,
            total: sum(transactions),
            ventes: transactions.filter(t => t.typeTransaction === "VENTE").length,
            reservations: transactions.filter(t => t.typeTransaction === "RESERVATION").length,
            especes: sum(transactions.filter(t => t.mode_paiement === "ESPECES")),
            carte: sum(transactions.filter(t => t.mode_paiement === "CARTE")),
            virement: sum(transactions.filter(t => t.mode_paiement === "VIREMENT")),
            cheque: sum(transactions.filter(t => t.mode_paiement === "CHEQUE"))
        };
    }, [transactions]);

    const reset = () => {
        setPeriode("AUJOURD_HUI");
        preset("AUJOURD_HUI");
        setType("TOUS"); setMode("TOUS"); setStatut("TOUS"); setRecherche("");
    };

    const escapeHtml = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    const imprimer = (format) => {
        setPrintOpen(false);
        const w = window.open("", "_blank", "width=1000,height=900,scrollbars=yes");
        if (!w) { setError("La fenêtre d'impression a été bloquée par le navigateur."); return; }
        const thermal = format === "THERMIQUE";
        const ticketWidth = receiptSettings.format_ticket === "58mm" ? "58mm" : "80mm";
        const receiptWidth = receiptSettings.format_ticket === "58mm" ? "50mm" : "72mm";
        const companyContact = [
            receiptSettings.afficher_adresse ? entreprise.adresse : null,
            receiptSettings.afficher_telephone ? entreprise.telephone : null,
            receiptSettings.afficher_email ? entreprise.email : null,
            entreprise.site_web
        ].filter(Boolean).map(v => `<div>${escapeHtml(v)}</div>`).join("");
        const logoHtml = receiptSettings.afficher_logo && entreprise.logo
            ? `<img class="company-logo" src="${escapeHtml(entreprise.logo)}" alt="Logo" />`
            : "";
        const rows = transactions.map(t => `<tr><td>${dateText(t.date)}</td><td>${escapeHtml(t.reference)}</td><td>${t.typeTransaction}</td><td>${escapeHtml(t.client)}</td><td>${escapeHtml(t.mode_paiement || "—")}</td><td class="right">${money(t.montant)}</td><td>${escapeHtml(t.statutTransaction)}</td></tr>`).join("");
        w.document.write(`<!doctype html><html lang="fr"><head><meta charset="UTF-8"><title>Inventaire des transactions</title><style>
        *{box-sizing:border-box} @page{size:${thermal ? `${ticketWidth} 120mm` : "A4 portrait"};margin:${thermal ? "0" : "12mm"}} html,body{margin:0;padding:0;background:#fff;color:#111;font-family:Arial,sans-serif}.report{width:${thermal ? receiptWidth : "100%"};margin:${thermal ? "0 auto" : "0"};font-size:${thermal ? "9px" : "11px"}}.center{text-align:center}.right{text-align:right}h1{margin:0 0 3px;font-size:${thermal ? "16px" : "24px"}}h2{margin:0 0 10px;font-size:${thermal ? "11px" : "16px"}}.company{text-align:center;font-weight:bold;margin-bottom:8px}.company-logo{display:block;max-width:45mm;max-height:20mm;width:auto;height:auto;margin:0 auto 5px;object-fit:contain}.meta{border-top:1px dashed #222;border-bottom:1px dashed #222;padding:7px 0;margin:8px 0;line-height:1.55}.summary{display:grid;grid-template-columns:repeat(${thermal ? 2 : 4},1fr);gap:6px;margin:10px 0}.box{border:1px solid #ccc;padding:6px}.box span{display:block;font-size:9px;color:#555}.box strong{display:block;margin-top:2px}table{width:100%;border-collapse:collapse}th,td{padding:${thermal ? "4px 2px" : "7px 5px"};border-bottom:1px solid #ddd;text-align:left;vertical-align:top}th{border-top:1px solid #222;border-bottom:1px solid #222}.total{display:flex;justify-content:space-between;border-top:2px solid #111;margin-top:10px;padding-top:8px;font-weight:bold;font-size:${thermal ? "11px" : "14px"}}.footer{text-align:center;border-top:1px dashed #222;margin-top:15px;padding-top:9px}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><main class="report"><div class="company">${logoHtml}<h1>${escapeHtml(entreprise.nom)}</h1>${companyContact}<div>INVENTAIRE DES TRANSACTIONS</div></div><div class="meta"><div><b>Période :</b> ${escapeHtml(dateDebut)} → ${escapeHtml(dateFin)}</div><div><b>Type :</b> ${escapeHtml(type)}</div><div><b>Mode :</b> ${escapeHtml(mode)}</div><div><b>Statut :</b> ${escapeHtml(statut)}</div><div><b>Généré le :</b> ${dateText(new Date())}</div></div><div class="summary"><div class="box"><span>Transactions</span><strong>${stats.count}</strong></div><div class="box"><span>Ventes</span><strong>${stats.ventes}</strong></div><div class="box"><span>Réservations</span><strong>${stats.reservations}</strong></div><div class="box"><span>Encaissé</span><strong>${money(stats.total)}</strong></div></div><table><thead><tr><th>Date</th><th>Réf.</th><th>Type</th><th>Client</th><th>Mode</th><th>Montant</th><th>Statut</th></tr></thead><tbody>${rows || `<tr><td colspan="7" class="center">Aucune transaction.</td></tr>`}</tbody></table><div class="total"><span>TOTAL ENCAISSÉ</span><span>${money(stats.total)}</span></div><div class="footer"><b>Merci pour votre confiance !</b><br>Rapport généré par ${escapeHtml(entreprise.nom)}.</div></main><script>window.onload=()=>setTimeout(()=>{${thermal ? `const r=document.querySelector('.report'),s=document.querySelector('style');const h=Math.max(60,Math.ceil((r.scrollHeight||r.getBoundingClientRect().height)*25.4/96+4));s.textContent+=\`@media print{@page{size:${ticketWidth} \${h}mm!important;margin:0!important}html,body{width:${ticketWidth}!important;min-width:${ticketWidth}!important;margin:0!important;padding:0!important}.report{width:${receiptWidth}!important;margin:0 auto!important}}\`;` : ""}const images=Array.from(document.images);Promise.all(images.map(img=>img.complete?Promise.resolve():new Promise(resolve=>{img.onload=resolve;img.onerror=resolve;}))).then(()=>{window.focus();window.print();});},500)</script></body></html>`);
        w.document.close();
    };

    return <div className="rapports-page">
        {/* <div className="rapports-header"><div><h1>Rapports</h1><p>Inventaire des transactions et encaissements</p></div><div className="rapports-header-actions"><button className="rapport-btn secondary" onClick={chargerDonnees}><RefreshCw size={16}/> Actualiser</button><button className="rapport-btn primary" onClick={() => setPrintOpen(true)}><Printer size={16}/> Imprimer l'inventaire</button></div></div> */}
        {error && <div className="rapport-error">{error}</div>}
        <section className="rapport-filter-card"><div className="filter-title"><Filter size={18}/><div><h2>Filtres du rapport</h2><span>Choisissez la période et les critères de l'inventaire.</span></div></div><div className="rapport-filters">
            <div className="filter-field"><label>Période</label><select value={periode} onChange={e=>changePeriode(e.target.value)}><option value="AUJOURD_HUI">Aujourd'hui</option><option value="HIER">Hier</option><option value="CETTE_SEMAINE">Cette semaine</option><option value="SEMAINE_PRECEDENTE">Semaine précédente</option><option value="CE_MOIS">Ce mois</option><option value="MOIS_PRECEDENT">Mois précédent</option><option value="CETTE_ANNEE">Cette année</option><option value="ANNEE_PRECEDENTE">Année précédente</option><option value="7_JOURS">7 derniers jours</option><option value="30_JOURS">30 derniers jours</option><option value="PERSONNALISEE">Période personnalisée</option></select></div>
            <div className="filter-field"><label>Date début</label><div className="date-input"><CalendarDays size={15}/><input type="date" value={dateDebut} onChange={e=>{setPeriode("PERSONNALISEE");setDateDebut(e.target.value)}}/></div></div>
            <div className="filter-field"><label>Date fin</label><div className="date-input"><CalendarDays size={15}/><input type="date" value={dateFin} onChange={e=>{setPeriode("PERSONNALISEE");setDateFin(e.target.value)}}/></div></div>
            <div className="filter-field"><label>Type</label><select value={type} onChange={e=>setType(e.target.value)}><option value="TOUS">Toutes</option><option value="VENTE">Ventes</option><option value="RESERVATION">Réservations</option><option value="AUTRE">Autres</option></select></div>
            <div className="filter-field"><label>Mode de paiement</label><select value={mode} onChange={e=>setMode(e.target.value)}><option value="TOUS">Tous</option><option value="ESPECES">Espèces</option><option value="CARTE">Carte</option><option value="VIREMENT">Virement</option><option value="CHEQUE">Chèque</option><option value="AUTRE">Autre</option></select></div>
            <div className="filter-field"><label>Statut</label><select value={statut} onChange={e=>setStatut(e.target.value)}><option value="TOUS">Tous</option>{statutsDisponibles.map(value => <option key={value} value={value}>{formatStatut(value)}</option>)}</select></div>
            <div className="filter-field search-field"><label>Recherche</label><div className="date-input"><Search size={15}/><input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Référence, client, mode..."/></div></div><div className="filter-field"><label>&nbsp;</label><button className="rapport-btn secondary full" onClick={reset}>Réinitialiser</button></div>
        </div></section>
        <section className="rapport-stats"><div className="rapport-stat-card"><div className="stat-icon blue"><FileText size={19}/></div><div><span>Transactions</span><strong>{stats.count}</strong></div></div><div className="rapport-stat-card"><div className="stat-icon green"><DollarSign size={19}/></div><div><span>Total encaissé</span><strong>{money(stats.total)}</strong></div></div><div className="rapport-stat-card"><div className="stat-icon orange"><ShoppingCart size={19}/></div><div><span>Ventes</span><strong>{stats.ventes}</strong></div></div><div className="rapport-stat-card"><div className="stat-icon purple"><CreditCard size={19}/></div><div><span>Réservations</span><strong>{stats.reservations}</strong></div></div></section>
        <section className="payment-breakdown"><div><span>Espèces</span><strong>{money(stats.especes)}</strong></div><div><span>Carte</span><strong>{money(stats.carte)}</strong></div><div><span>Virement</span><strong>{money(stats.virement)}</strong></div><div><span>Chèque</span><strong>{money(stats.cheque)}</strong></div></section>
        <section className="rapport-table-card"><div className="rapport-table-header"><div><h2>Inventaire des transactions</h2><p>{dateDebut} → {dateFin} · {transactions.length} transaction(s)</p></div><button className="rapport-btn primary" onClick={()=>setPrintOpen(true)}><Printer size={16}/> Imprimer</button></div><div className="table-wrapper"><table className="rapport-table"><thead><tr><th>Date</th><th>Type</th><th>Référence</th><th>Client</th><th>Caissier</th><th>Mode</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead><tbody>{loading?<tr><td colSpan="9" className="empty-row">Chargement...</td></tr>:transactions.length===0?<tr><td colSpan="9" className="empty-row">Aucune transaction pour les critères sélectionnés.</td></tr>:transactions.map(t=><tr key={t.id_paiement}><td>{dateText(t.date)}</td><td><span className={`type-badge ${t.typeTransaction.toLowerCase()}`}>{t.typeTransaction}</span></td><td className="reference-cell">{t.reference}</td><td>{t.client}</td><td>{t.utilisateur || utilisateurName(t, t.id_utilisateur)}</td><td>{t.mode_paiement||"—"}</td><td className="amount-cell">{money(t.montant)}</td><td><span className={`status-badge ${t.statutTransaction.toLowerCase()}`}>{t.statutTransaction}</span></td><td><button className="table-view-btn" onClick={()=>setDetail(t)}><Eye size={15}/></button></td></tr>)}</tbody></table></div></section>
        {printOpen && <div className="rapport-modal-overlay" onMouseDown={()=>setPrintOpen(false)}><div className="rapport-print-modal" onMouseDown={e=>e.stopPropagation()}><div className="rapport-modal-header"><div><h2>Imprimer l'inventaire</h2><p>Choisissez le format.</p></div><button onClick={()=>setPrintOpen(false)}><X size={20}/></button></div><div className="print-options"><button className={`print-option ${printFormat==="A4"?"active":""}`} onClick={()=>setPrintFormat("A4")}><FileText size={24}/><div><strong>Document A4</strong><span>Rapport complet</span></div></button><button className={`print-option ${printFormat==="THERMIQUE"?"active":""}`} onClick={()=>setPrintFormat("THERMIQUE")}><Printer size={24}/><div><strong>Ticket thermique {receiptSettings.format_ticket === "58mm" ? "58 mm" : "80 mm"}</strong><span>Format compact POS</span></div></button></div><div className="rapport-modal-actions"><button className="rapport-btn secondary" onClick={()=>setPrintOpen(false)}>Annuler</button><button className="rapport-btn primary" onClick={()=>imprimer(printFormat)}><Printer size={16}/> Imprimer</button></div></div></div>}
        {detail && <div className="rapport-modal-overlay" onMouseDown={()=>setDetail(null)}><div className="rapport-detail-modal" onMouseDown={e=>e.stopPropagation()}><div className="rapport-modal-header"><div><h2>{detail.reference}</h2><p>{dateText(detail.date)}</p></div><button onClick={()=>setDetail(null)}><X size={20}/></button></div><div className="detail-grid"><div><span>Type</span><strong>{detail.typeTransaction}</strong></div><div><span>Client</span><strong>{detail.client}</strong></div><div><span>Mode</span><strong>{detail.mode_paiement||"—"}</strong></div><div><span>Utilisateur</span><strong>{detail.utilisateur || utilisateurName(detail, detail.id_utilisateur)}</strong></div><div><span>Montant</span><strong>{money(detail.montant)}</strong></div><div><span>Statut</span><strong>{detail.statutTransaction}</strong></div></div><div className="rapport-modal-actions"><button className="rapport-btn secondary" onClick={()=>setDetail(null)}>Fermer</button></div></div></div>}
    </div>;
}

export default Rapport;
