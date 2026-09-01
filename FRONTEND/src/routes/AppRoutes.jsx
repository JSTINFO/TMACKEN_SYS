import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";


import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "./ProtectedRoute";


import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Produits from "../pages/Produits";
import Stock from "../pages/Stock";
import Reservations from "../pages/Reservations";
import Ventes from "../pages/Ventes";
import Paiements from "../pages/Paiements";
import Rapports from "../pages/Rapports";
import Parametres from "../pages/Parametres";



function AppRoutes() {

    return (

        <BrowserRouter>

            <Routes>


                {/* =====================================
                    AUTHENTIFICATION
                ====================================== */}

                <Route
                    path="/login"
                    element={<Login />}
                />


                {/* =====================================
                    ROUTES PROTÉGÉES
                ====================================== */}

                <Route element={<ProtectedRoute />}>

                    <Route element={<MainLayout />}>

                        <Route
                            path="/"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/clients"
                            element={<Clients />}
                        />

                        <Route
                            path="/produits"
                            element={<Produits />}
                        />

                        <Route
                            path="/stock"
                            element={<Stock />}
                        />

                        <Route
                            path="/reservations"
                            element={<Reservations />}
                        />

                        <Route
                            path="/ventes"
                            element={<Ventes />}
                        />

                        <Route
                            path="/paiements"
                            element={<Paiements />}
                        />

                        <Route
                            path="/rapports"
                            element={<Rapports />}
                        />

                        <Route
                            path="/parametres"
                            element={<Parametres />}
                        />

                    </Route>

                </Route>


                {/* =====================================
                    ROUTE INEXISTANTE
                ====================================== */}

                <Route
                    path="*"
                    element={<NavigateToDashboard />}
                />

            </Routes>

        </BrowserRouter>
    );
}


/*
    Petite redirection pour les URLs inexistantes.
*/

function NavigateToDashboard() {

    return (
        <Navigate to="/" replace />
    );
}


export default AppRoutes;