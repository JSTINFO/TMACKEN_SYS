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

import { NavLink } from "react-router-dom";


function Sidebar({ isOpen, onClose }) {

    const handleLinkClick = () => {
        onClose();
    };


    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>

            {/* =========================
                LOGO
            ========================== */}

            <div className="sidebar-logo">
                <h2>LAZARE</h2>
            </div>


            {/* =========================
                NAVIGATION
            ========================== */}

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
                    <span>Dashboard</span>
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
                    <span>Clients</span>
                </NavLink>


                <NavLink
                    to="/produits"
                    onClick={handleLinkClick}
                >
                    <Package size={18} />
                    <span>Produits</span>
                </NavLink>


                <NavLink
                    to="/stock"
                    onClick={handleLinkClick}
                >
                    <Boxes size={18} />
                    <span>Stock</span>
                </NavLink>


                <NavLink
                    to="/reservations"
                    onClick={handleLinkClick}
                >
                    <CalendarDays size={18} />
                    <span>Réservations</span>
                </NavLink>


                <NavLink
                    to="/ventes"
                    onClick={handleLinkClick}
                >
                    <ShoppingCart size={18} />
                    <span>Ventes</span>
                </NavLink>


                <NavLink
                    to="/paiements"
                    onClick={handleLinkClick}
                >
                    <CreditCard size={18} />
                    <span>Paiements</span>
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
                    <span>Rapports</span>
                </NavLink>


                
                <NavLink
                    to="/proforma"
                    onClick={handleLinkClick}
                >
                 <FileText size={18} />
                    <span>Proforma</span>
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
                    <span>Paramètres</span>
                </NavLink>

            </nav>


{/* 
            <Button
                    to="/login"
                    onClick={handleLinkClick}
                >
                    <LogOut size={18} />
                    <span>Logout</span>
                </Button> */}


            {/* =========================
                FOOTER
            ========================== */}

            <div className="sidebar-footer">
                <span>Lazare v1.0</span>
            </div>

        </aside>
    );
}


export default Sidebar;