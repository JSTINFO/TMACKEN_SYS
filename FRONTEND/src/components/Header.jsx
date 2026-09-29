import { useLocation } from "react-router-dom";
import {
    Menu,
    Bell,
    Moon,
    Sun,
} from "lucide-react";

import { useTheme } from "../context/ThemeContext";


function Header({ onMenuClick }) {

    const location = useLocation();

    const { theme, toggleTheme } = useTheme();


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


    return (
        <header className="header">

            {/* =========================
                LEFT
            ========================== */}

            <div className="header-left">

                <button
                    className="mobile-menu-button"
                    type="button"
                    onClick={onMenuClick}
                    aria-label="Ouvrir le menu"
                >
                    <Menu size={20} />
                </button>


                <div className="header-title">
                    {currentTitle}
                </div>

            </div>


            {/* =========================
                RIGHT
            ========================== */}

            <div className="header-right">


                {/* Notifications */}

                {/* <button
                    className="header-icon-button"
                    type="button"
                    aria-label="Notifications"
                >

                    <Bell size={19} />

                    <span className="notification-badge">
                        3
                    </span>

                </button> */}


                {/* Dark / Light Mode */}

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


                {/* Séparateur */}

                <div className="header-divider"></div>


                {/* Profil */}

                <div className="user-profile">

                    <div className="user-avatar">
                        SJ
                    </div>


                    <div className="user-info">

                        <span className="user-name">
                            Steven Jean
                        </span>

                        <span className="user-role">
                            Administrateur
                        </span>

                    </div>

                </div>

            </div>

        </header>
    );
}


export default Header;