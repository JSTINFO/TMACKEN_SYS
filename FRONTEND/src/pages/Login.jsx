import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, User } from "lucide-react";

import { useAuth } from "../context/AuthContext";


function Login() {

    const navigate = useNavigate();

    const {
        login,
        isAuthenticated,
        loading
    } = useAuth();


    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState("");

    const [submitting, setSubmitting] = useState(false);


    // =====================================
    // SI DÉJÀ CONNECTÉ
    // =====================================

    if (!loading && isAuthenticated) {
        return <Navigate to="/" replace />;
    }


    // =====================================
    // CONNEXION
    // =====================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");


        if (!username.trim() || !password) {

            setError(
                "Veuillez remplir tous les champs."
            );

            return;
        }


        try {

            setSubmitting(true);


            await login(
                username.trim(),
                password
            );


            navigate("/", {
                replace: true
            });


        } catch (err) {

            if (err.response?.status === 401) {

                setError(
                    "Nom utilisateur ou mot de passe incorrect."
                );

            } else {

                setError(
                    "Impossible de contacter le serveur."
                );

            }

        } finally {

            setSubmitting(false);

        }
    };


    return (

        <div className="login-page">

            <div className="login-container">


                {/* =========================
                    LOGO
                ========================== */}

                <div className="login-logo">

                    <h1>
                        TMACKEN_SYS
                    </h1>

                </div>


                {/* =========================
                    TITRE
                ========================== */}

                <div className="login-header">

                    <h2>
                        Connexion
                    </h2>

                    <p>
                        Connectez-vous à votre espace de gestion.
                    </p>

                </div>


                {/* =========================
                    ERREUR
                ========================== */}

                {error && (

                    <div className="login-error">
                        {error}
                    </div>

                )}


                {/* =========================
                    FORMULAIRE
                ========================== */}

                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >


                    {/* Username */}

                    <div className="login-form-group">

                        <label htmlFor="username">
                            Nom utilisateur
                        </label>


                        <div className="login-input-wrapper">

                            <User size={18} />

                            <input
                                id="username"
                                type="text"
                                placeholder="Votre nom utilisateur"
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                autoComplete="username"
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div className="login-form-group">

                        <label htmlFor="password">
                            Mot de passe
                        </label>


                        <div className="login-input-wrapper">

                            <LockKeyhole size={18} />

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Votre mot de passe"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                autoComplete="current-password"
                            />


                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Masquer le mot de passe"
                                        : "Afficher le mot de passe"
                                }
                            >

                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}

                            </button>

                        </div>

                    </div>


                    {/* Bouton */}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={submitting}
                    >

                        {submitting
                            ? "Connexion..."
                            : "Se connecter"
                        }

                    </button>

                </form>


                {/* =========================
                    FOOTER
                ========================== */}

                <div className="login-footer">

                    <span>
                        Lazare v1.0
                    </span>

                </div>

            </div>

        </div>
    );
}


export default Login;