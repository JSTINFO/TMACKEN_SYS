function Dashboard() {
    return (
        <div>

            {/* En-tête de page */}
            <div className="page-header">

                <div>
                    <h1 className="page-title">
                        Bonjour, Steven 👋
                    </h1>

                    {/* <p className="page-description">
                        Voici un aperçu de l'activité de TMACKEN.
                    </p> */}
                </div>

                <button className="btn btn-primary">
                    + Nouvelle vente
                </button>

            </div>


            {/* Statistiques */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-label">
                        Clients
                    </div>

                    <div className="stat-value">
                        248
                    </div>

                    <div className="stat-change success">
                        +12% ce mois
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-label">
                        Produits
                    </div>

                    <div className="stat-value">
                        126
                    </div>

                    <div className="stat-change success">
                        +8 nouveaux
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-label">
                        Stock disponible
                    </div>

                    <div className="stat-value">
                        843
                    </div>

                    <div className="stat-change warning">
                        7 stocks faibles
                    </div>
                </div>


                <div className="stat-card">
                    <div className="stat-label">
                        Ventes du mois
                    </div>

                    <div className="stat-value">
                        $12,480
                    </div>

                    <div className="stat-change success">
                        +18.5%
                    </div>
                </div>

            </div>


            {/* Contenu principal */}
            <div className="dashboard-grid">

                {/* Activité récente */}
                <div className="card">

                    <div className="section-header">

                        <div>
                            <h2>
                                Activité récente
                            </h2>

                            <p>
                                Dernières opérations effectuées
                            </p>
                        </div>

                        <button className="btn btn-secondary">
                            Voir tout
                        </button>

                    </div>


                    <div className="activity-list">

                        <div className="activity-item">

                            <div className="activity-icon">
                                V
                            </div>

                            <div className="activity-content">

                                <strong>
                                    Nouvelle vente
                                </strong>

                                <span>
                                    Vente #V-00125
                                </span>

                            </div>

                            <div className="activity-value">
                                $350
                            </div>

                        </div>


                        <div className="activity-item">

                            <div className="activity-icon">
                                C
                            </div>

                            <div className="activity-content">

                                <strong>
                                    Nouveau client
                                </strong>

                                <span>
                                    Jean Pierre
                                </span>

                            </div>

                            <div className="activity-time">
                                Il y a 20 min
                            </div>

                        </div>


                        <div className="activity-item">

                            <div className="activity-icon">
                                P
                            </div>

                            <div className="activity-content">

                                <strong>
                                    Nouveau produit
                                </strong>

                                <span>
                                    iPhone 17 Pro
                                </span>

                            </div>

                            <div className="activity-time">
                                Il y a 1 h
                            </div>

                        </div>


                        <div className="activity-item">

                            <div className="activity-icon">
                                S
                            </div>

                            <div className="activity-content">

                                <strong>
                                    Stock mis à jour
                                </strong>

                                <span>
                                    Samsung Galaxy S26
                                </span>

                            </div>

                            <div className="activity-time">
                                Il y a 2 h
                            </div>

                        </div>

                    </div>

                </div>


                {/* Stock faible */}
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

                        <div className="stock-item">

                            <div>
                                <strong>
                                    iPhone 17 Pro
                                </strong>

                                <span>
                                    Smartphone
                                </span>
                            </div>

                            <span className="badge badge-danger">
                                2 unités
                            </span>

                        </div>


                        <div className="stock-item">

                            <div>
                                <strong>
                                    Samsung S26 Ultra
                                </strong>

                                <span>
                                    Smartphone
                                </span>
                            </div>

                            <span className="badge badge-warning">
                                5 unités
                            </span>

                        </div>


                        <div className="stock-item">

                            <div>
                                <strong>
                                    AirPods Pro
                                </strong>

                                <span>
                                    Accessoire
                                </span>
                            </div>

                            <span className="badge badge-warning">
                                6 unités
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;