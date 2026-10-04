import { useEffect, useState } from "react";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

import { getDashboard } from "../services/dashboardService";

import { useSettings } from "../context/SettingsContext";

function Dashboard() {
    
    const TooltipVentes = ({ active, payload, label }) => {

    if (!active || !payload || !payload.length) {
        return null;
    }

    const valeur = payload[0]?.value || 0;

    return (
        <div className="dashboard-tooltip">

            <div className="dashboard-tooltip-month">
                {label}
            </div>

            <div className="dashboard-tooltip-label">
                Ventes
            </div>

            <div className="dashboard-tooltip-value">
                {formatMoney(valeur)}
            </div>

        </div>
    );
};

    const { formatMoney, currentCurrency } = useSettings();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [periodeVentes, setPeriodeVentes] = useState(6);
    const [periodeReservations, setPeriodeReservations] = useState(6);


    // =========================================================
    // CHARGEMENT DU DASHBOARD
    // =========================================================

    useEffect(() => {

        const chargerDashboard = async () => {

            try {

                setLoading(true);

                const data = await getDashboard();

                setDashboard(data);

                setError(null);

            } catch (err) {

                console.error(
                    "Erreur chargement dashboard :",
                    err
                );

                setError(
                    "Impossible de charger les données du dashboard."
                );

            } finally {

                setLoading(false);

            }
        };


        chargerDashboard();

    }, []);


    // =========================================================
    // CHARGEMENT
    // =========================================================

    if (loading) {

        return (
            <div className="dashboard-loading">
                Chargement du dashboard...
            </div>
        );

    }


    // =========================================================
    // ERREUR
    // =========================================================

    if (error) {

        return (
            <div className="dashboard-error">
                {error}
            </div>
        );

    }


    if (!dashboard) {
        return null;
    }


    // =========================================================
    // DONNÉES
    // =========================================================

  const clients = dashboard.clients || {};

const produits = dashboard.produits || {};

const stock = dashboard.stock || {};

const ventes = dashboard.ventes || {};

const ventesParMois =
    dashboard.ventes_par_mois || [];

const reservationsParMois =
    dashboard.reservations_par_mois || [];

const paiementsParMode =
    dashboard.paiements_par_mode || [];

const activites =
    dashboard.activites_recentes || [];

const produitsFaibles =
    stock.produits_faibles || [];


    // =========================================================
// DONNÉES GRAPHIQUES
// =========================================================

const nomsMois = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc"
];


const graphiqueVentes = ventesParMois.map((item) => ({
    annee: Number(item.annee),
    moisNumero: Number(item.mois),
    mois:
        nomsMois[Number(item.mois) - 1] ||
        `${item.mois}/${item.annee}`,
    ventes: Number(item.total) || 0
}));


const construirePeriodeVentes = () => {

    if (graphiqueVentes.length === 0) {
        return [];
    }

    // On prend le dernier mois disponible dans les données
    const dernier =
        graphiqueVentes[graphiqueVentes.length - 1];

    const resultat = [];

    let annee = dernier.annee;
    let mois = dernier.moisNumero;

    for (let i = periodeVentes - 1; i >= 0; i--) {

        let moisCible = mois - i;
        let anneeCible = annee;

        while (moisCible <= 0) {
            moisCible += 12;
            anneeCible--;
        }

        const donneesMois = graphiqueVentes.find(
            (item) =>
                item.annee === anneeCible &&
                item.moisNumero === moisCible
        );

        resultat.push({
            mois:
                nomsMois[moisCible - 1] ||
                `${moisCible}/${anneeCible}`,

            ventes: donneesMois
                ? donneesMois.ventes
                : 0
        });
    }

    return resultat;
};


const graphiqueVentesFiltre =
    construirePeriodeVentes();

    const graphiqueReservations =
        reservationsParMois.map((item) => ({
            annee: Number(item.annee),

            moisNumero: Number(item.mois),

            mois:
                nomsMois[Number(item.mois) - 1] ||
                `${item.mois}/${item.annee}`,

            reservations:
                Number(item.total) || 0
        }));




        const construirePeriodeReservations = () => {

    if (graphiqueReservations.length === 0) {
        return [];
    }

    const dernier =
        graphiqueReservations[
            graphiqueReservations.length - 1
        ];

    const resultat = [];

    let annee = dernier.annee;
    let mois = dernier.moisNumero;

    for (
        let i = periodeReservations - 1;
        i >= 0;
        i--
    ) {

        let moisCible = mois - i;
        let anneeCible = annee;

        while (moisCible <= 0) {

            moisCible += 12;
            anneeCible--;

        }

        const donneesMois =
            graphiqueReservations.find(
                (item) =>
                    item.annee === anneeCible &&
                    item.moisNumero === moisCible
            );

        resultat.push({

            mois:
                nomsMois[moisCible - 1] ||
                `${moisCible}/${anneeCible}`,

            reservations:
                donneesMois
                    ? donneesMois.reservations
                    : 0

        });
    }

    return resultat;
};


const graphiqueReservationsFiltre =
    construirePeriodeReservations();

        

const graphiquePaiements =
    paiementsParMode.map((item) => ({
        mode: item.mode,
        total: Number(item.total) || 0
    }));


    

const totalPaiements =
    graphiquePaiements.reduce(
        (total, paiement) =>
            total + paiement.total,
        0
    );
    // =========================================================
    // FORMATAGE MONNAIE
    // =========================================================

    const formaterMontant = (montant) => {

        return new Intl.NumberFormat(
            "fr-FR",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ).format(montant || 0);

    };


    // =========================================================
    // FORMATAGE DATE
    // =========================================================

    const formaterDate = (date) => {

        if (!date) {
            return "";
        }

        const maintenant = new Date();

        const dateActivite = new Date(date);

        const difference =
            maintenant.getTime()
            - dateActivite.getTime();

        const minutes =
            Math.floor(
                difference / (1000 * 60)
            );

        if (minutes < 1) {
            return "À l'instant";
        }

        if (minutes < 60) {
            return `Il y a ${minutes} min`;
        }

        const heures =
            Math.floor(minutes / 60);

        if (heures < 24) {
            return `Il y a ${heures} h`;
        }

        const jours =
            Math.floor(heures / 24);

        if (jours === 1) {
            return "Hier";
        }

        return `Il y a ${jours} jours`;

    };


    // =========================================================
    // ICÔNE ACTIVITÉ
    // =========================================================

    const getActivityIcon = (type) => {

        if (type === "vente") {
            return "V";
        }

        if (type === "reservation") {
            return "R";
        }

        return "•";

    };


    const getPaymentColor = (mode) => {

    const couleurs = {
        ESPECES: "var(--primary)",
        CARTE: "#3B82F6",
        VIREMENT: "var(--warning)",
        CHEQUE: "#8B5CF6",
        AUTRE: "var(--text-secondary)"
    };

    return couleurs[mode] || "var(--text-secondary)";
};
    return (

        <div>

            {/* =================================================
                EN-TÊTE
            ================================================= */}

            <div className="page-header">

                <div>

                    {/* <h1 className="page-title">
                        Bonjour, Steven 👋
                    </h1> */}

                </div>

{/* 
                <button className="btn btn-primary">
                    + Nouvelle vente
                </button> */}

            </div>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="stats-grid">


                {/* CLIENTS */}

                <div className="stat-card">

                    <div className="stat-label">
                        Clients
                    </div>

                    <div className="stat-value">
                        {clients.total}
                    </div>

                    <div className="stat-change success">
                        Clients enregistrés
                    </div>

                </div>


                {/* PRODUITS */}

                <div className="stat-card">

                    <div className="stat-label">
                        Produits
                    </div>

                    <div className="stat-value">
                        {produits.total}
                    </div>

                    <div className="stat-change success">
                        Produits enregistrés
                    </div>

                </div>


                {/* STOCK */}

                <div className="stat-card">

                    <div className="stat-label">
                        Stock disponible
                    </div>

                    <div className="stat-value">
                        {stock.disponible}
                    </div>

                    <div
                        className={
                            stock.stocks_faibles > 0
                                ? "stat-change warning"
                                : "stat-change success"
                        }
                    >
                        {stock.stocks_faibles} stock
                        {stock.stocks_faibles > 1 ? "s" : ""} faible
                        {stock.stocks_faibles > 1 ? "s" : ""}
                    </div>

                </div>


                {/* VENTES */}
{/* 
                <div className="stat-card">

                    <div className="stat-label">
                        Ventes du mois
                    </div>

                    <div className="stat-value">
                        ${formaterMontant(ventes.du_mois)}
                    </div>

                    <div className="stat-change success">
                        Total du mois
                    </div>

                </div> */}

            </div>



            {/* =================================================
    GRAPHIQUES
================================================= */}

<div className="dashboard-charts">


    {/* =================================================
        ÉVOLUTION DES VENTES
    ================================================= */}

    <div className="card dashboard-chart-card">

        <div className="section-header">

           <div>
    <h2>
        Évolution des ventes
    </h2>

    <p>
        Chiffre des ventes par mois
    </p>
</div>

<div className="sales-period-selector">

    <button
        className={periodeVentes === 3 ? "active" : ""}
        onClick={() => setPeriodeVentes(3)}
    >
        3M
    </button>

    <button
        className={periodeVentes === 6 ? "active" : ""}
        onClick={() => setPeriodeVentes(6)}
    >
        6M
    </button>

    <button
        className={periodeVentes === 12 ? "active" : ""}
        onClick={() => setPeriodeVentes(12)}
    >
        12M
    </button>

</div>
        </div>


        <div className="dashboard-chart">

            {graphiqueVentes.length === 0 ? (

                <div className="empty-state">
                    Aucune donnée de vente disponible.
                </div>

            ) : (

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                    <AreaChart
    data={graphiqueVentesFiltre}
    margin={{
        top: 15,
        right: 20,
        left: 10,
        bottom: 5
    }}
>

    <defs>

        <linearGradient
            id="ventesGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
        >

            <stop
                offset="0%"
                stopColor="var(--primary)"
                stopOpacity={0.35}
            />

            <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity={0.02}
            />

                </linearGradient>

            </defs>


            <CartesianGrid
                strokeDasharray="3 3"
                opacity={0.18}
            />


            <XAxis
                dataKey="mois"
                tickLine={false}
                axisLine={false}
            />


            <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                    value >= 1000
                        ? `${Math.round(value / 1000)}k`
                        : value
                }
            />


            <Tooltip
                content={<TooltipVentes />}
            />


            <Area
                type="monotone"
                dataKey="ventes"
                stroke="var(--primary)"
                strokeWidth={3}
                fill="url(#ventesGradient)"
                dot={{
                    r: 4,
                    fill: "var(--primary)",
                    strokeWidth: 2
                }}
                activeDot={{
                    r: 7,
                    strokeWidth: 3
                }}
            />

        </AreaChart>

                </ResponsiveContainer>

            )}

        </div>

    </div>



    {/* =================================================
        RÉSERVATIONS
    ================================================= */}

    <div className="card dashboard-chart-card">

        <div className="section-header">
<div>

    <h2>
        Réservations
    </h2>

    <p>
        Nombre de réservations par mois
    </p>

</div>


<div className="sales-period-selector">

    <button
        className={
            periodeReservations === 3
                ? "active"
                : ""
        }
        onClick={() =>
            setPeriodeReservations(3)
        }
    >
        3M
    </button>


    <button
        className={
            periodeReservations === 6
                ? "active"
                : ""
        }
        onClick={() =>
            setPeriodeReservations(6)
        }
    >
        6M
    </button>


    <button
        className={
            periodeReservations === 12
                ? "active"
                : ""
        }
        onClick={() =>
            setPeriodeReservations(12)
        }
    >
        12M
    </button>

</div>

        </div>


        <div className="dashboard-chart">

            {graphiqueReservations.length === 0 ? (

                <div className="empty-state">
                    Aucune réservation disponible.
                </div>

            ) : (

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                            <AreaChart
                    data={graphiqueReservationsFiltre}
                    margin={{
                        top: 15,
                        right: 20,
                        left: 10,
                        bottom: 5
                    }}
                >

                    <defs>

                        <linearGradient
                            id="reservationsGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >

                            <stop
                                offset="0%"
                                stopColor="var(--primary)"
                                stopOpacity={0.30}
                            />

                            <stop
                                offset="100%"
                                stopColor="var(--primary)"
                                stopOpacity={0.02}
                            />

                        </linearGradient>

                    </defs>


                    <CartesianGrid
                        strokeDasharray="3 3"
                        opacity={0.18}
                    />


                    <XAxis
                        dataKey="mois"
                        tickLine={false}
                        axisLine={false}
                    />


                    <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                    />


                    <Tooltip
                        formatter={(value) => [
                            `${value} réservation${value > 1 ? "s" : ""}`,
                            "Total"
                        ]}
                    />


                    <Area
                        type="monotone"
                        dataKey="reservations"
                        name="Réservations"
                        stroke="var(--primary)"
                        strokeWidth={3}
                        fill="url(#reservationsGradient)"
                        dot={{
                            r: 4,
                            fill: "var(--primary)",
                            strokeWidth: 2
                        }}
                        activeDot={{
                            r: 7,
                            strokeWidth: 3
                        }}
                    />

                </AreaChart>

                </ResponsiveContainer>

            )}

        </div>

    </div>



    {/* =================================================
        PAIEMENTS
    ================================================= */}

  {/* =================================================
    PAIEMENTS
================================================= */}

<div className="card dashboard-chart-card dashboard-payment-chart">

    <div className="section-header">

        <div>

            <h2>
                Répartition des paiements
            </h2>

            <p>
                Montant par mode de paiement
            </p>

        </div>

    </div>


    <div className="payment-chart-layout">

        {/* =================================================
            DONUT
        ================================================= */}

        <div className="payment-donut">

            <ResponsiveContainer
                width="100%"
                height={300}
            >

                <PieChart>

                    <Pie
                        data={graphiquePaiements}
                        dataKey="total"
                        nameKey="mode"
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={105}
                        paddingAngle={3}
                        stroke="var(--bg-primary)"
                        strokeWidth={2}
                    >

                        {graphiquePaiements.map(
                            (entry, index) => (
                        <Cell
                            key={`payment-cell-${index}`}
                            fill={getPaymentColor(entry.mode)}
                        />

                            )
                        )}

                    </Pie>


                    <Tooltip
                        formatter={(value) =>
                            formatMoney(value)
                        }
                    />

                </PieChart>

            </ResponsiveContainer>


            <div className="payment-donut-center">

                <span>
                    Total
                </span>

                <strong>
                    {formatMoney(totalPaiements)}
                </strong>

            </div>

        </div>


        {/* =================================================
            DÉTAILS DES PAIEMENTS
        ================================================= */}

        <div className="payment-details">

            {graphiquePaiements.map(
                (paiement, index) => {

                    const pourcentage =
                        totalPaiements > 0
                            ? (
                                paiement.total /
                                totalPaiements
                            ) * 100
                            : 0;

                   const couleur =
    getPaymentColor(paiement.mode);

                    return (

                        <div
                            className="payment-detail-item"
                            key={paiement.mode}
                        >

                            <div className="payment-detail-header">

                                <div className="payment-detail-name">

                                    <span
                                        className="payment-dot"
                                        style={{
                                            background:
                                                couleur
                                        }}
                                    />

                                    <span>
                                        {paiement.mode}
                                    </span>

                                </div>


                                <strong>
                                    {formatMoney(
                                        paiement.total
                                    )}
                                </strong>

                            </div>


                            <div className="payment-progress">

                                <div
                                    className="payment-progress-bar"
                                    style={{
                                        width:
                                            `${pourcentage}%`,
                                        background:
                                            couleur
                                    }}
                                />

                            </div>


                            <span className="payment-percentage">
                                {pourcentage.toFixed(1)} %
                            </span>

                        </div>

                    );

                }
            )}

        </div>

    </div>

</div>
</div>


            {/* =================================================
                CONTENU PRINCIPAL
            ================================================= */}

            <div className="dashboard-grid">


                {/* =================================================
                    ACTIVITÉ RÉCENTE
                ================================================= */}

                <div className="card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Activité récente
                            </h2>

                            <p>
                                Dernières ventes et réservations
                            </p>

                        </div>


                        {/* <button className="btn btn-secondary">
                            Voir tout
                        </button> */}

                    </div>


                    <div className="activity-list">

                        {activites.length === 0 ? (

                            <div className="empty-state">
                                Aucune activité récente.
                            </div>

                        ) : (

                            activites.map(
                                (activite, index) => (

                                    <div
                                        className="activity-item"
                                        key={`${activite.type}-${activite.description}-${index}`}
                                    >

                                        <div className="activity-icon">

                                            {getActivityIcon(
                                                activite.type
                                            )}

                                        </div>


                                        <div className="activity-content">

                                            <strong>
                                                {activite.titre}
                                            </strong>

                                            <span>
                                                {activite.description}
                                            </span>

                                        </div>


                                        {activite.type === "vente" ? (

                                            <div className="activity-value">

                                                
                                                {formaterMontant(
                                                    activite.valeur
                                                )}

                                                {currentCurrency.symbol}

                                            </div>

                                        ) : (

                                            <div className="activity-time">

                                                {formaterDate(
                                                    activite.date
                                                )}

                                            </div>

                                        )}

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* =================================================
                    STOCK FAIBLE
                ================================================= */}

                <div className="card">

                    <div className="section-header">

                        <div>

                            <h2>
                                Stock faible
                            </h2>

                            <p>
                                Produits nécessitant une attention
                            </p>

                        </div>

                    </div>


                    <div className="low-stock-list">

                        {produitsFaibles.length === 0 ? (

                            <div className="empty-state">
                                Aucun produit en stock faible.
                            </div>

                        ) : (

                            produitsFaibles.map(
                                (produit) => (

                                    <div
                                        className="stock-item"
                                        key={produit.id_produit}
                                    >

                                        <div>

                                            <strong>
                                                {produit.nom}
                                            </strong>

                                            <span>
                                                {produit.description ||
                                                    "Produit"}
                                            </span>

                                        </div>


                                        <span
                                            className={
                                                produit.quantite <= 
                                                produit.seuil_alerte /2
                                                    ? "badge badge-danger"
                                                    : "badge badge-warning"
                                            }
                                        >
                                            {produit.quantite} unités
                                        </span>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

}


export default Dashboard;