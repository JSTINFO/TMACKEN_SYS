import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function ProtectedRoute() {

    const {
        isAuthenticated,
        loading
    } = useAuth();

    const location = useLocation();


    // =====================================
    // VÉRIFICATION DE LA SESSION
    // =====================================

    if (loading) {

        return (
            <div className="auth-loading">
                Vérification de la session...
            </div>
        );
    }


    // =====================================
    // UTILISATEUR NON CONNECTÉ
    // =====================================

    if (!isAuthenticated) {

        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location
                }}
            />
        );
    }


    // =====================================
    // UTILISATEUR CONNECTÉ
    // =====================================

    return <Outlet />;
}


export default ProtectedRoute;