import {
    LayoutDashboard,
    Users,
    Package,
    Boxes,
    CalendarDays,
    ShoppingCart,
    CreditCard,
    BarChart3,
    Settings,
    FileText,
    LogOut,
} from "lucide-react";

import { useState } from "react";

import {
    NavLink,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import ConfirmModal from "../components/ConfirmModal";


function Sidebar({ isOpen, onClose }) {

    const navigate = useNavigate();

    const { logout } = useAuth();


    // =====================================================
    // MODAL CONFIRMATION
    // =====================================================

    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: "warning",
        title: "",
        message: "",
        confirmText: "Confirmer",
        action: null
    });


    // =====================================================
    // FERMER LE SIDEBAR
    // =====================================================

    const handleLinkClick = () => {

        onClose();

    };


    // =====================================================
    // DEMANDER DÉCONNEXION
    // =====================================================

    const demanderLogout = () => {

        setConfirmModal({

            open: true,

            type: "warning",

            title: "Se déconnecter ?",

            message:
                "Voulez-vous vraiment vous déconnecter de votre compte ?",

            confirmText: "Se déconnecter",

            action: handleLogout

        });

    };


    // =====================================================
    // DÉCONNEXION
    // =====================================================

    const handleLogout = () => {

        logout();

        onClose();

        setConfirmModal({

            open: false,

            type: "warning",

            title: "",

            message: "",

            confirmText: "Confirmer",

            action: null

        });

        navigate("/login");

    };


    // =====================================================
    // ANNULER CONFIRMATION
    // =====================================================

    const cancelLogout = () => {

        setConfirmModal({

            open: false,

            type: "warning",

            title: "",

            message: "",

            confirmText: "Confirmer",

            action: null

        });

    };


    return (

        <aside
            className={`sidebar ${isOpen ? "open" : ""}`}
        >


            {/* =================================================
                LOGO
            ================================================= */}

            <div className="sidebar-logo">

                <h2>
                    TMACKEN_SYS
                </h2>

            </div>



            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="sidebar-nav">


                {/* Principal */}

                <div className="sidebar-nav-title">
                    Principal
                </div>


                <NavLink
                    to="/"
                    onClick={handleLinkClick}
                >

                    <LayoutDashboard size={18} />

                    <span>
                        Dashboard
                    </span>

                </NavLink>



                {/* Gestion */}

                <div className="sidebar-nav-title">
                    Gestion
                </div>


                <NavLink
                    to="/clients"
                    onClick={handleLinkClick}
                >

                    <Users size={18} />

                    <span>
                        Clients
                    </span>

                </NavLink>


                <NavLink
                    to="/produits"
                    onClick={handleLinkClick}
                >

                    <Package size={18} />

                    <span>
                        Produits
                    </span>

                </NavLink>


                <NavLink
                    to="/stock"
                    onClick={handleLinkClick}
                >

                    <Boxes size={18} />

                    <span>
                        Stock
                    </span>

                </NavLink>


                <NavLink
                    to="/reservations"
                    onClick={handleLinkClick}
                >

                    <CalendarDays size={18} />

                    <span>
                        Réservations
                    </span>

                </NavLink>


                <NavLink
                    to="/ventes"
                    onClick={handleLinkClick}
                >

                    <ShoppingCart size={18} />

                    <span>
                        Ventes
                    </span>

                </NavLink>


                <NavLink
                    to="/paiements"
                    onClick={handleLinkClick}
                >

                    <CreditCard size={18} />

                    <span>
                        Paiements
                    </span>

                </NavLink>



                {/* Analyse */}

                <div className="sidebar-nav-title">
                    Analyse
                </div>


                <NavLink
                    to="/rapports"
                    onClick={handleLinkClick}
                >

                    <BarChart3 size={18} />

                    <span>
                        Rapports
                    </span>

                </NavLink>


                <NavLink
                    to="/proforma"
                    onClick={handleLinkClick}
                >

                    <FileText size={18} />

                    <span>
                        Proforma
                    </span>

                </NavLink>



                {/* Système */}

                <div className="sidebar-nav-title">
                    Système
                </div>


                <NavLink
                    to="/parametres"
                    onClick={handleLinkClick}
                >

                    <Settings size={18} />

                    <span>
                        Paramètres
                    </span>

                </NavLink>


            </nav>



            {/* =================================================
                DÉCONNEXION
            ================================================= */}

            <div className="sidebar-logout-container">

                <button
                    type="button"
                    className="sidebar-logout"
                    onClick={demanderLogout}
                >

                    <LogOut size={18} />

                    <span>
                        Déconnexion
                    </span>

                </button>

            </div>



            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="sidebar-footer">

                <span>
                    tmacken_sys v1.0
                </span>

            </div>



            {/* =================================================
                MODAL CONFIRMATION
            ================================================= */}

            <ConfirmModal

                open={
                    confirmModal.open
                }

                type={
                    confirmModal.type
                }

                title={
                    confirmModal.title
                }

                message={
                    confirmModal.message
                }

                confirmText={
                    confirmModal.confirmText
                }

                cancelText="Annuler"

                onConfirm={
                    confirmModal.action
                }

                onCancel={
                    cancelLogout
                }

            />


        </aside>

    );

}


export default Sidebar;