import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
    Menu,
    Bell,
    Moon,
    Sun,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";
import { getCurrentUser } from "../services/authService";


function Header({ onMenuClick }) {

    const location = useLocation();

    const { theme, toggleTheme } = useTheme();


    // =====================================================
    // UTILISATEUR CONNECTÉ
    // =====================================================

    const [currentUser, setCurrentUser] = useState(null);


    // =====================================================
    // CHARGER L'UTILISATEUR CONNECTÉ
    // =====================================================

    useEffect(() => {

        const loadCurrentUser = async () => {

            try {

                const user = await getCurrentUser();

                setCurrentUser(
                    user || null
                );

            } catch (err) {

                console.error(
                    "Impossible de récupérer l'utilisateur connecté:",
                    err
                );

                setCurrentUser(null);
            }

        };


        loadCurrentUser();

    }, []);


    // =====================================================
    // TITRES DES PAGES
    // =====================================================

    const titles = {

        "/": "Dashboard",

        "/clients": "Clients",

        "/produits": "Produits",

        "/stock": "Stock",

        "/reservations": "Réservations",

        "/ventes": "Ventes",

        "/paiements": "Paiements",

        "/rapports": "Rapports",

        "/parametres": "Paramètres",

        "/proforma": "Proforma",

    };


    const currentTitle =
        titles[location.pathname] || "TMACKEN";


    // =====================================================
    // NOM COMPLET UTILISATEUR
    // =====================================================

    const getUserName = () => {

        if (!currentUser) {

            return "Utilisateur";

        }


        const fullName =
            `${currentUser.prenom || ""} ${currentUser.nom || ""}`
                .trim();


        if (fullName) {

            return fullName;

        }


        return (
            currentUser.nom_utilisateur ||
            currentUser.username ||
            currentUser.login ||
            currentUser.email ||
            "Utilisateur"
        );

    };


    // =====================================================
    // INITIALES UTILISATEUR
    // =====================================================

    const getUserInitials = () => {

        if (!currentUser) {

            return "U";

        }


        const prenom =
            currentUser.prenom?.trim() || "";

        const nom =
            currentUser.nom?.trim() || "";


        if (prenom && nom) {

            return (
                `${prenom.charAt(0)}${nom.charAt(0)}`
            ).toUpperCase();

        }


        if (prenom) {

            return (
                prenom.substring(0, 2)
            ).toUpperCase();

        }


        if (nom) {

            return (
                nom.substring(0, 2)
            ).toUpperCase();

        }


        const username =
            currentUser.nom_utilisateur ||
            currentUser.username ||
            currentUser.login ||
            "";


        if (username) {

            return (
                username.substring(0, 2)
            ).toUpperCase();

        }


        return "U";

    };


    // =====================================================
    // RÔLE UTILISATEUR
    // =====================================================

    const getUserRole = () => {

        if (!currentUser) {

            return "Utilisateur";

        }


        return (
            currentUser.role ||
            currentUser.nom_role ||
            currentUser.role_nom ||
            currentUser.type_utilisateur ||
            "Utilisateur"
        );

    };


    // =====================================================
    // AFFICHAGE
    // =====================================================

    return (

        <header className="header">


            {/* =================================================
                LEFT
            ================================================= */}

            <div className="header-left">


                {/* Menu mobile */}

                <button
                    className="mobile-menu-button"
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Ouvrir le menu"
                >

                    <Menu size={20} />

                </button>


                {/* Titre de la page */}

                <div className="header-title">

                    {currentTitle}

                </div>


            </div>



            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="header-right">


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                {/*

                <button
                    className="header-icon-button"
                    type="button"
                    aria-label="Notifications"
                >

                    <Bell size={19} />

                    <span className="notification-badge">
                        3
                    </span>

                </button>

                */}



                {/* =================================================
                    DARK / LIGHT MODE
                ================================================= */}

                <button
                    className="header-icon-button"
                    type="button"
                    onClick={toggleTheme}
                    aria-label={
                        theme === "light"
                            ? "Activer le mode sombre"
                            : "Activer le mode clair"
                    }
                    title={
                        theme === "light"
                            ? "Mode sombre"
                            : "Mode clair"
                    }
                >

                    {theme === "light" ? (

                        <Moon size={19} />

                    ) : (

                        <Sun size={19} />

                    )}

                </button>



                {/* =================================================
                    SÉPARATEUR
                ================================================= */}

                <div className="header-divider"></div>



                {/* =================================================
                    PROFIL UTILISATEUR
                ================================================= */}

                <div className="user-profile">


                    {/* Avatar / Initiales */}

                    <div className="user-avatar">

                        {getUserInitials()}

                    </div>



                    {/* Informations utilisateur */}

                    <div className="user-info">


                        {/* Nom */}

                        <span className="user-name">

                            {getUserName()}

                        </span>



                        {/* Rôle */}

                        <span className="user-role">

                            {getUserRole()}

                        </span>


                    </div>


                </div>


            </div>


        </header>

    );

}


export default Header;