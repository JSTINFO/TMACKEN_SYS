import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";

import "./Parametre.css";

function Parametre() {
    const { theme, toggleTheme } = useTheme();

    const {
        currency,
        setCurrency,
        currencies,
    } = useSettings();

    return (
        <div className="parametres-page">

            {/* HEADER */}
            <div className="page-header">
                {/* <div>
                    <h1 className="page-title">Paramètres</h1>

                    <p className="page-description">
                        Configurez les préférences générales de votre système.
                    </p>
                </div> */}
            </div>

            {/* APPARENCE */}
            <section className="settings-card">

                <div className="settings-card-header">
                    <div>
                        <h2>Apparence</h2>

                        <p>
                            Personnalisez l'apparence de l'application.
                        </p>
                    </div>
                </div>

                <div className="settings-option">

                    <div className="settings-option-info">
                        <h3>Thème</h3>

                        <p>
                            Choisissez entre le thème clair et le thème sombre.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="settings-toggle"
                        onClick={toggleTheme}
                    >
                        {theme === "light" ? "☀️ Clair" : "🌙 Sombre"}
                    </button>

                </div>

            </section>


            {/* DEVISE */}
            <section className="settings-card">

                <div className="settings-card-header">
                    <div>
                        <h2>Devise</h2>

                        <p>
                            Choisissez la devise utilisée pour l'affichage
                            des montants dans le système.
                        </p>
                    </div>
                </div>

                <div className="settings-option">

                    <div className="settings-option-info">
                        <h3>Devise principale</h3>

                        <p>
                            Cette préférence sera utilisée dans les ventes,
                            proformas, rapports et autres montants.
                        </p>
                    </div>

                    <select
                        className="settings-select"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                    >
                        {Object.values(currencies).map((item) => (
                            <option
                                key={item.code}
                                value={item.code}
                            >
                                {item.code} — {item.name} ({item.symbol})
                            </option>
                        ))}
                    </select>

                </div>

            </section>

        </div>
    );
}

export default Parametre;