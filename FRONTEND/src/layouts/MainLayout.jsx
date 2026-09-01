import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function MainLayout() {

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const ouvrirSidebar = () => {
        setSidebarOpen(true);
    };

    const fermerSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="app-layout">

            <Sidebar
                isOpen={sidebarOpen}
                onClose={fermerSidebar}
            />

            <div
                className={`sidebar-overlay ${
                    sidebarOpen ? "open" : ""
                }`}
                onClick={fermerSidebar}
            ></div>

            <div className="main-content">

                <Header
                    onMenuClick={ouvrirSidebar}
                />

                <section className="page-content">
                    <Outlet />
                </section>

            </div>

        </div>
    );
}

export default MainLayout;