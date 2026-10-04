import { useEffect, useState } from "react";

import {
    ResponsiveContainer,
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

    const { formatMoney, currentCurrency } = useSettings();

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


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


const graphiqueVentes =
    ventesParMois.map((item) => ({
        mois:
            nomsMois[item.mois - 1] ||
            `${item.mois}/${item.annee}`,

        ventes: Number(item.total) || 0
    }));


const graphiqueReservations =
    reservationsParMois.map((item) => ({
        mois:
            nomsMois[item.mois - 1] ||
            `${item.mois}/${item.annee}`,

        reservations:
            Number(item.total) || 0
    }));


const graphiquePaiements =
    paiementsParMode.map((item) => ({
        mode: item.mode,
        total: Number(item.total) || 0
    }));

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

                    <LineChart
                        data={graphiqueVentes}
                        margin={{
                            top: 15,
                            right: 20,
                            left: 10,
                            bottom: 5
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            opacity={0.25}
                        />

                        <XAxis
                            dataKey="mois"
                        />

                        <YAxis
                            tickFormatter={(value) =>
                                value.toLocaleString("fr-FR")
                            }
                        />

                        <Tooltip
                            formatter={(value) =>
                                formatMoney(value)
                            }
                        />

                        <Line
                            type="monotone"
                            dataKey="ventes"
                            name="Ventes"
                            stroke="var(--primary)"
                            strokeWidth={3}
                            dot={{
                                r: 4
                            }}
                            activeDot={{
                                r: 7
                            }}
                        />

                    </LineChart>

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

                    <BarChart
                        data={graphiqueReservations}
                        margin={{
                            top: 15,
                            right: 20,
                            left: 10,
                            bottom: 5
                        }}
                    >

                        <CartesianGrid
                            strokeDasharray="3 3"
                            opacity={0.25}
                        />

                        <XAxis
                            dataKey="mois"
                        />

                        <YAxis />

                        <Tooltip />

                        <Bar
                            dataKey="reservations"
                            name="Réservations"
                            fill="var(--primary)"
                            radius={[
                                5,
                                5,
                                0,
                                0
                            ]}
                        />

                    </BarChart>

                </ResponsiveContainer>

            )}

        </div>

    </div>



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


        <div className="dashboard-chart">

            {graphiquePaiements.length === 0 ? (

                <div className="empty-state">
                    Aucun paiement enregistré.
                </div>

            ) : (

                <ResponsiveContainer
                    width="100%"
                    height={320}
                >

                    <PieChart>

                        <Pie
                            data={graphiquePaiements}
                            dataKey="total"
                            nameKey="mode"
                            cx="50%"
                            cy="50%"
                            outerRadius={105}
                            innerRadius={55}
                            paddingAngle={3}
                            label
                        >

                            {graphiquePaiements.map(
                                (entry, index) => (

                                    <Cell
                                        key={`cell-${index}`}
                                        fill={
                                            [
                                                "var(--primary)",
                                                "var(--success)",
                                                "var(--warning)",
                                                "var(--danger)",
                                                "var(--text-secondary)"
                                            ][
                                                index %
                                                5
                                            ]
                                        }
                                    />

                                )
                            )}

                        </Pie>


                        <Tooltip
                            formatter={(value) =>
                                formatMoney(value)
                            }
                        />


                        <Legend />

                    </PieChart>

                </ResponsiveContainer>

            )}

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