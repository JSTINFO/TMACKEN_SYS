import { useEffect, useRef, useState } from "react";



import { useSettings } from "../context/SettingsContext";



import { useTheme } from "../context/ThemeContext";

import { useAuth } from "../context/AuthContext";

import {

    updatePassword

} from "../services/authService";

import {
    getParametres,
    updateParametre,
} from "../services/parametreService";







import "./Parametre.css";





import {

    getMyEntreprise,

    updateMyEntreprise,

    uploadEntrepriseLogo,

} from "../services/entrepriseService";









function Parametre() {


    const { theme, toggleTheme } = useTheme();


          const handleSaveProfile = async () => {



    try {



        const updatedUser = await updateUser({



            nom: profile.nom,



            prenom: profile.prenom,



            username: profile.username



        });





        setProfile({



            nom: updatedUser.nom,



            prenom: updatedUser.prenom,



            username: updatedUser.username



        });





        alert("Profil enregistré avec succès.");



    } catch (error) {



        console.error(

            "Erreur lors de la modification du profil :",

            error

        );





        const message =

            error.response?.data?.detail ||

            "Impossible d'enregistrer le profil.";



        alert(message);

    }

};









const handleSavePassword = async () => {



    if (!password.actuel) {



        alert(

            "Veuillez saisir votre mot de passe actuel."

        );



        return;

    }





    if (!password.nouveau) {



        alert(

            "Veuillez saisir un nouveau mot de passe."

        );



        return;

    }





    if (

        password.nouveau !==

        password.confirmation

    ) {



        alert(

            "La confirmation du mot de passe ne correspond pas."

        );



        return;

    }





    try {



        const result = await updatePassword(

            password.actuel,

            password.nouveau

        );





        alert(result.message);





        setPassword({

            actuel: "",

            nouveau: "",

            confirmation: ""

        });





    } catch (error) {



        console.error(

            "Erreur modification mot de passe :",

            error

        );





        alert(

            error.response?.data?.detail ||

            "Impossible de modifier le mot de passe."

        );

    }

};







    const {



        currency,



        setCurrency,



        currencies,



    } = useSettings();



    const { user, updateUser } = useAuth();













    // =========================================================



    // PROFIL



    // =========================================================







    const [profile, setProfile] = useState({

        prenom: "",

        nom: "",

        username: "",

    });



    useEffect(() => {

        if (!user) return;

        setProfile({

            prenom: user.prenom || "",

            nom: user.nom || "",

            username: user.username || "",

        });

    }, [user]);





    useEffect(() => {

    if (!user?.entreprise) return;



    setCompany({

        nom: user.entreprise.nom || "",

        adresse: user.entreprise.adresse || "",

        telephone: user.entreprise.telephone || "",

        email: user.entreprise.email || "",

        site_web: user.entreprise.site_web || "",

    });

}, [user]);







    // =========================================================



    // SECURITE



    // =========================================================







    const [password, setPassword] = useState({



        actuel: "",



        nouveau: "",



        confirmation: "",



    });







    // =========================================================



    // ENTREPRISE



    // =========================================================





const [company, setCompany] = useState({

    nom: "",

    adresse: "",

    telephone: "",

    email: "",

    site_web: "",

});





useEffect(() => {

    const loadEntreprise = async () => {

        try {

            setCompanyLoading(true);



            const data = await getMyEntreprise();



            setCompany({

                nom: data.nom || "",

                adresse: data.adresse || "",

                telephone: data.telephone || "",

                email: data.email || "",

                site_web: data.site_web || "",

            });



            if (data.logo) {

                setLogo({

                    file: null,

                    preview: `http://127.0.0.1:8000${data.logo}`,

                });

            }



        } catch (error) {

            console.error(

                "Erreur lors du chargement de l'entreprise :",

                error

            );

        } finally {

            setCompanyLoading(false);

        }

    };



    if (user) {

        loadEntreprise();

    }

}, [user]);



    // =========================================================



    // LOGO



    // =========================================================







    const [logo, setLogo] = useState(null);



    const [companyLoading, setCompanyLoading] = useState(false);

    const [companySaving, setCompanySaving] = useState(false);



    const logoInputRef = useRef(null);





const [parametreId, setParametreId] = useState(null);

const [documentsSaving, setDocumentsSaving] =
    useState(false);

    // =========================================================



    // DOCUMENTS



    // =========================================================







    const [documents, setDocuments] = useState({



        afficherLogo: true,



        afficherAdresse: true,



        afficherTelephone: true,



        afficherEmail: true,



        message:



            "Merci pour votre confiance !",



        formatTicket: "80mm",



    });



useEffect(() => {

    const loadParametres = async () => {

        try {

            const data = await getParametres();

            if (!Array.isArray(data) || data.length === 0) {
                return;
            }

            const parametre = data[0];

            setParametreId(parametre.id_parametre);

            setDocuments({
                afficherLogo:
                    parametre.afficher_logo ?? true,

                afficherAdresse:
                    parametre.afficher_adresse ?? true,

                afficherTelephone:
                    parametre.afficher_telephone ?? true,

                afficherEmail:
                    parametre.afficher_email ?? true,

                message:
                    parametre.message_recu ??
                    "Merci pour votre confiance !",

                formatTicket:
                    parametre.format_ticket ??
                    "80mm",
            });

        } catch (error) {

            console.error(
                "Erreur lors du chargement des paramètres :",
                error
            );

            alert(
                "Impossible de charger les paramètres des reçus."
            );
        }

    };

    loadParametres();

}, []);



    // =========================================================



    // HANDLERS



    // =========================================================







    const handleProfileChange = (event) => {



        const { name, value } = event.target;







        setProfile((prev) => ({



            ...prev,



            [name]: value,



        }));



    };







    const handlePasswordChange = (event) => {



        const { name, value } = event.target;







        setPassword((prev) => ({



            ...prev,



            [name]: value,



        }));



    };







    const handleCompanyChange = (event) => {



        const { name, value } = event.target;







        setCompany((prev) => ({



            ...prev,



            [name]: value,



        }));



    };







    const handleDocumentChange = (event) => {



        const { name, value, type, checked } = event.target;







        setDocuments((prev) => ({



            ...prev,



            [name]: type === "checkbox" ? checked : value,



        }));



    };





const handleSaveDocuments = async () => {

    if (!parametreId) {

        alert(
            "Impossible d'identifier les paramètres du système."
        );

        return;
    }

    try {

        setDocumentsSaving(true);

        const updated = await updateParametre(
            parametreId,
            {
                afficher_logo:
                    documents.afficherLogo,

                afficher_adresse:
                    documents.afficherAdresse,

                afficher_telephone:
                    documents.afficherTelephone,

                afficher_email:
                    documents.afficherEmail,

                message_recu:
                    documents.message || null,

                format_ticket:
                    documents.formatTicket,
            }
        );

        setDocuments({
            afficherLogo:
                updated.afficher_logo ?? true,

            afficherAdresse:
                updated.afficher_adresse ?? true,

            afficherTelephone:
                updated.afficher_telephone ?? true,

            afficherEmail:
                updated.afficher_email ?? true,

            message:
                updated.message_recu ??
                "Merci pour votre confiance !",

            formatTicket:
                updated.format_ticket ??
                "80mm",
        });

        alert(
            "Les paramètres des reçus ont été enregistrés."
        );

    } catch (error) {

        console.error(
            "Erreur lors de l'enregistrement des paramètres :",
            error
        );

        const message =
            error?.response?.data?.detail ||
            "Impossible d'enregistrer les paramètres.";

        alert(message);

    } finally {

        setDocumentsSaving(false);

    }
};




       const handleLogoChange = (event) => {

    const file = event.target.files?.[0];



    if (!file) {

        return;

    }



    const allowedTypes = [

        "image/png",

        "image/jpeg",

        "image/webp",

    ];



    if (!allowedTypes.includes(file.type)) {

        alert("Veuillez choisir une image PNG, JPG ou WEBP.");

        return;

    }



    const maxSize = 5 * 1024 * 1024;



    if (file.size > maxSize) {

        alert("Le logo ne doit pas dépasser 5 MB.");

        return;

    }



    const preview = URL.createObjectURL(file);



    setLogo({

        file,

        preview,

    });

};







const handleSaveCompany = async () => {

    try {

        setCompanySaving(true);



        // ==========================================

        // 1. Enregistrer les informations

        // ==========================================



        const updatedCompany = await updateMyEntreprise({

            nom: company.nom,

            adresse: company.adresse,

            telephone: company.telephone,

            email: company.email || null,

            site_web: company.site_web || null,

        });



        setCompany({

            nom: updatedCompany.nom || "",

            adresse: updatedCompany.adresse || "",

            telephone: updatedCompany.telephone || "",

            email: updatedCompany.email || "",

            site_web: updatedCompany.site_web || "",

        });



        // ==========================================

        // 2. Envoyer le logo s'il y en a un nouveau

        // ==========================================



        if (logo?.file) {

            const result = await uploadEntrepriseLogo(

                logo.file

            );



            if (result.logo) {

                setLogo({

                    file: null,

                    preview: `http://127.0.0.1:8000${result.logo}`,

                });

            }

        }



        alert("Les informations de l'entreprise ont été enregistrées.");



    } catch (error) {

        console.error(

            "Erreur lors de l'enregistrement de l'entreprise :",

            error

        );



        const message =

            error?.response?.data?.detail ||

            "Impossible d'enregistrer les informations de l'entreprise.";



        alert(message);



    } finally {

        setCompanySaving(false);

    }

};













            return (

        <div className="parametres-page">

            {/* =====================================================



                HEADER



            ====================================================== */}







            <div className="page-header">



                <div>



                    <h1 className="page-title">



                        Paramètres



                    </h1>







                    <p className="page-description">



                        Configurez votre profil, votre entreprise



                        et les préférences générales du système.



                    </p>



                </div>



            </div>











            {/* =====================================================



                APPARENCE



            ====================================================== */}







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



                            Choisissez entre le thème clair



                            et le thème sombre.



                        </p>



                    </div>







                    <button



                        type="button"



                        className="settings-toggle"



                        onClick={toggleTheme}



                    >



                        {theme === "light"



                            ? "☀️ Clair"



                            : "🌙 Sombre"}



                    </button>







                </div>







            </section>











            {/* =====================================================



                DEVISE



            ====================================================== */}







            <section className="settings-card">







                <div className="settings-card-header">



                    <div>



                        <h2>Devise</h2>







                        <p>



                            Choisissez la devise utilisée pour



                            l'affichage des montants.



                        </p>



                    </div>



                </div>







                <div className="settings-option">







                    <div className="settings-option-info">



                        <h3>Devise principale</h3>







                        <p>



                            Cette préférence sera utilisée dans



                            les ventes, proformas, rapports,



                            paiements et autres montants.



                        </p>



                    </div>







                    <select



                        className="settings-select"



                        value={currency}



                        onChange={(e) =>



                            setCurrency(e.target.value)



                        }



                    >



                        {Object.values(currencies).map((item) => (



                            <option



                                key={item.code}



                                value={item.code}



                            >



                                {item.code} — {item.name} (



                                {item.symbol})



                            </option>



                        ))}



                    </select>







                </div>







            </section>











                        {/* =====================================================

                MON PROFIL

            ====================================================== */}



            <section className="settings-card">



                <div className="settings-card-header">

                    <div>

                        <h2>Mon profil</h2>

                        <p>Gérez les informations de votre compte utilisateur.</p>

                    </div>

                </div>



                <div className="settings-form-grid">



                    <div className="form-group">

                        <label>Prénom</label>

                        <input type="text" name="prenom" className="form-input" value={profile.prenom} onChange={handleProfileChange} placeholder="Votre prénom" />

                    </div>



                    <div className="form-group">

                        <label>Nom</label>

                        <input type="text" name="nom" className="form-input" value={profile.nom} onChange={handleProfileChange} placeholder="Votre nom" />

                    </div>



                    <div className="form-group">

                        <label>Nom d'utilisateur</label>

                        <input type="text" name="username" className="form-input" value={profile.username} onChange={handleProfileChange} placeholder="Nom d'utilisateur" />

                    </div>



                    <div className="form-group">

                        <label>Statut</label>

                        <input type="text" className="form-input" value={user?.statut ? "Actif" : "Inactif"} readOnly />

                    </div>



                    <div className="form-group">

                        <label>Rôle</label>

                        <input type="text" className="form-input" value={user?.role || ""} readOnly />

                    </div>



                </div>



                <div className="settings-actions">

                   <button

                        type="button"

                        className="btn-primary"

                        onClick={handleSaveProfile}

                    >

                        Enregistrer le profil

                    </button>

                </div>



            </section>





{/* =====================================================



                SECURITE



            ====================================================== */}







            <section className="settings-card">







                <div className="settings-card-header">



                    <div>



                        <h2>Sécurité</h2>







                        <p>



                            Modifiez le mot de passe de votre compte.



                        </p>



                    </div>



                </div>







                <div className="settings-form-grid">







                    <div className="form-group settings-full-width">



                        <label>Mot de passe actuel</label>







                        <input



                            type="password"



                            name="actuel"



                            className="form-input"



                            value={password.actuel}



                            onChange={handlePasswordChange}



                            placeholder="Mot de passe actuel"



                        />



                    </div>







                    <div className="form-group">



                        <label>Nouveau mot de passe</label>







                        <input



                            type="password"



                            name="nouveau"



                            className="form-input"



                            value={password.nouveau}



                            onChange={handlePasswordChange}



                            placeholder="Nouveau mot de passe"



                        />



                    </div>







                    <div className="form-group">



                        <label>Confirmer le mot de passe</label>







                        <input



                            type="password"



                            name="confirmation"



                            className="form-input"



                            value={password.confirmation}



                            onChange={handlePasswordChange}



                            placeholder="Confirmer le mot de passe"



                        />



                    </div>







                </div>







                <div className="settings-actions">







                <button

                    type="button"

                    className="btn-primary"

                    onClick={handleSavePassword}

                >

                    Modifier le mot de passe

                </button>







                </div>







            </section>











            {/* =====================================================



                ENTREPRISE



            ====================================================== */}







            <section className="settings-card">







                <div className="settings-card-header">



                    <div>



                        <h2>Entreprise</h2>







                        <p>



                            Informations utilisées dans les reçus,



                            proformas et documents.



                        </p>



                    </div>



                </div>











                {/* LOGO */}







                <div className="company-logo-section">







                    <div className="company-logo-preview">







                        {logo?.preview ? (



                            <img



                                src={logo.preview}



                                alt="Logo entreprise"



                            />



                        ) : (



                            <span>



                                LOGO



                            </span>



                        )}







                    </div>







                    <div className="company-logo-info">







                        <h3>Logo de l'entreprise</h3>







                        <p>



                            Ajoutez le logo qui sera utilisé



                            dans les documents et reçus.



                        </p>







                        <input



                            ref={logoInputRef}



                            type="file"



                            accept="image/png,image/jpeg,image/webp"



                            onChange={handleLogoChange}



                            hidden



                        />







                        <button



                            type="button"



                            className="btn-secondary"



                            onClick={() =>



                                logoInputRef.current?.click()



                            }



                        >



                            Choisir un logo



                        </button>







                    </div>







                </div>











                {/* INFORMATIONS */}







                <div className="settings-form-grid">







                    <div className="form-group settings-full-width">



                        <label>Nom de l'entreprise</label>







                        <input



                            type="text"



                            name="nom"



                            className="form-input"



                            value={company.nom}



                            onChange={handleCompanyChange}



                            placeholder="Nom de l'entreprise"



                        />



                    </div>







                    <div className="form-group settings-full-width">



                        <label>Adresse</label>







                        <input



                            type="text"



                            name="adresse"



                            className="form-input"



                            value={company.adresse}



                            onChange={handleCompanyChange}



                            placeholder="Adresse de l'entreprise"



                        />



                    </div>







                    <div className="form-group">



                        <label>Téléphone</label>







                        <input



                            type="tel"



                            name="telephone"



                            className="form-input"



                            value={company.telephone}



                            onChange={handleCompanyChange}



                            placeholder="+509 ..."



                        />



                    </div>







                    <div className="form-group">



                        <label>Email</label>







                        <input



                            type="email"



                            name="email"



                            className="form-input"



                            value={company.email}



                            onChange={handleCompanyChange}



                            placeholder="contact@entreprise.com"



                        />



                    </div>







                    <div className="form-group settings-full-width">



                        <label>Site web</label>







                        <input



                            type="url"



                            name="site_web"



                            className="form-input"



                            value={company.site_web}



                            onChange={handleCompanyChange}



                            placeholder="https://..."



                        />



                    </div>







                </div>







                <div className="settings-actions">







                    <button

                        type="button"

                        className="btn-primary"

                        onClick={handleSaveCompany}

                        disabled={companySaving}

                    >

                        {companySaving

                            ? "Enregistrement..."

                            : "Enregistrer l'entreprise"}

                    </button>





                </div>







            </section>











            {/* =====================================================



                RECUS ET DOCUMENTS



            ====================================================== */}







            <section className="settings-card">







                <div className="settings-card-header">



                    <div>



                        <h2>Reçus et documents</h2>







                        <p>



                            Configurez les informations affichées



                            sur vos reçus et documents.



                        </p>



                    </div>



                </div>











                <div className="document-options">







                    <label className="settings-checkbox">



                        <input



                            type="checkbox"



                            name="afficherLogo"



                            checked={documents.afficherLogo}



                            onChange={handleDocumentChange}



                        />







                        <span>



                            Afficher le logo sur les reçus



                        </span>



                    </label>











                    <label className="settings-checkbox">



                        <input



                            type="checkbox"



                            name="afficherAdresse"



                            checked={documents.afficherAdresse}



                            onChange={handleDocumentChange}



                        />







                        <span>



                            Afficher l'adresse



                        </span>



                    </label>











                    <label className="settings-checkbox">



                        <input



                            type="checkbox"



                            name="afficherTelephone"



                            checked={documents.afficherTelephone}



                            onChange={handleDocumentChange}



                        />







                        <span>



                            Afficher le téléphone



                        </span>



                    </label>











                    <label className="settings-checkbox">



                        <input



                            type="checkbox"



                            name="afficherEmail"



                            checked={documents.afficherEmail}



                            onChange={handleDocumentChange}



                        />







                        <span>



                            Afficher l'email



                        </span>



                    </label>







                </div>











                <div className="settings-form-grid">







                    <div className="form-group settings-full-width">



                        <label>



                            Message du reçu



                        </label>







                        <textarea



                            name="message"



                            className="form-input settings-textarea"



                            value={documents.message}



                            onChange={handleDocumentChange}



                            rows="3"



                            placeholder="Message affiché en bas du reçu"



                        />



                    </div>











                    <div className="form-group">







                        <label>



                            Format du ticket



                        </label>







                        <select



                            name="formatTicket"



                            className="settings-select settings-select-full"



                            value={documents.formatTicket}



                            onChange={handleDocumentChange}



                        >



                            <option value="80mm">



                                Ticket thermique — 80 mm



                            </option>







                            <option value="58mm">



                                Ticket thermique — 58 mm



                            </option>



                        </select>







                    </div>







                </div>











                <div className="settings-actions">







                 <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSaveDocuments}
                    disabled={documentsSaving}
                >
                    {documentsSaving
                        ? "Enregistrement..."
                        : "Enregistrer les paramètres"}
                </button>







                </div>







            </section>







        </div>



    );



}







export default Parametre;