import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Users
} from "lucide-react";

import {
    getClients,
    createClient,
    updateClient,
    deleteClient
} from "../services/clientService";

import ConfirmModal from "../components/ConfirmModal";


function Clients() {

    // =====================================================
    // CLIENTS
    // =====================================================

    const [clients, setClients] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");


    // =====================================================
    // MODAL CLIENT
    // =====================================================

    const [showModal, setShowModal] = useState(false);

    const [editingClient, setEditingClient] = useState(null);

    const [saving, setSaving] = useState(false);


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

    const [confirmLoading, setConfirmLoading] =
        useState(false);


    // =====================================================
    // FORMULAIRE VIDE
    // =====================================================

    const emptyForm = {

        nom: "",

        prenom: "",

        telephone: "",

        email: "",

        adresse: ""

    };


    const [form, setForm] = useState(emptyForm);


    // =====================================================
    // CHARGER LES CLIENTS
    // =====================================================

    const loadClients = async () => {

        try {

            setLoading(true);

            setError("");

            const data = await getClients();

            setClients(data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.detail ||
                "Impossible de charger les clients."
            );

        } finally {

            setLoading(false);

        }
    };


    useEffect(() => {

        loadClients();

    }, []);


    // =====================================================
    // RECHERCHE
    // =====================================================

    const filteredClients = clients.filter((client) => {

        const value = search
            .toLowerCase()
            .trim();


        if (!value) {
            return true;
        }


        return (

            client.nom
                ?.toLowerCase()
                .includes(value)

            ||

            client.prenom
                ?.toLowerCase()
                .includes(value)

            ||

            client.telephone
                ?.toLowerCase()
                .includes(value)

            ||

            client.email
                ?.toLowerCase()
                .includes(value)

            ||

            client.adresse
                ?.toLowerCase()
                .includes(value)

        );

    });


    // =====================================================
    // CHANGEMENT FORMULAIRE
    // =====================================================

    const handleChange = (event) => {

        const {
            name,
            value
        } = event.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));

    };


    // =====================================================
    // OUVRIR MODAL CRÉATION
    // =====================================================

    const openCreateModal = () => {

        setEditingClient(null);

        setForm(emptyForm);

        setError("");

        setShowModal(true);

    };


    // =====================================================
    // OUVRIR MODAL MODIFICATION
    // =====================================================

    const openEditModal = (client) => {

        setEditingClient(client);

        setForm({

            nom: client.nom || "",

            prenom: client.prenom || "",

            telephone: client.telephone || "",

            email: client.email || "",

            adresse: client.adresse || ""

        });

        setError("");

        setShowModal(true);

    };


    // =====================================================
    // FERMER MODAL CLIENT
    // =====================================================

    const closeModal = () => {

        if (saving) {
            return;
        }


        setShowModal(false);

        setEditingClient(null);

        setForm(emptyForm);

        setError("");

    };


    // =====================================================
    // FERMER MODAL CONFIRMATION
    // =====================================================

    const closeConfirmModal = () => {

        if (confirmLoading) {
            return;
        }


        setConfirmModal({

            open: false,

            type: "warning",

            title: "",

            message: "",

            confirmText: "Confirmer",

            action: null

        });

    };


    // =====================================================
    // VALIDATION FORMULAIRE
    // =====================================================

    const validateForm = () => {

        if (!form.nom.trim()) {

            setError(
                "Le nom est obligatoire."
            );

            return false;

        }


        if (!form.prenom.trim()) {

            setError(
                "Le prénom est obligatoire."
            );

            return false;

        }


        return true;

    };


    // =====================================================
    // PRÉPARER CRÉATION / MODIFICATION
    // =====================================================

    const handleSubmit = (event) => {

        event.preventDefault();

        setError("");


        if (!validateForm()) {
            return;
        }


        const data = {

            nom: form.nom.trim(),

            prenom: form.prenom.trim(),

            telephone:
                form.telephone.trim() || null,

            email:
                form.email.trim() || null,

            adresse:
                form.adresse.trim() || null

        };


        // =================================================
        // MODIFICATION
        // =================================================

        if (editingClient) {

            setConfirmModal({

                open: true,

                type: "info",

                title: "Modifier ce client ?",

                message:
                    `Voulez-vous enregistrer les modifications apportées à ${editingClient.prenom} ${editingClient.nom} ?`,

                confirmText: "Modifier",

                action: async () => {

                    try {

                        setConfirmLoading(true);

                        setError("");


                        const updatedClient =
                            await updateClient(

                                editingClient.id_client,

                                data

                            );


                        setClients((previous) =>

                            previous.map((client) =>

                                client.id_client ===
                                editingClient.id_client

                                    ? updatedClient

                                    : client

                            )

                        );


                        setShowModal(false);

                        setEditingClient(null);

                        setForm(emptyForm);

                        closeConfirmModal();


                    } catch (err) {

                        console.error(err);


                        setError(

                            err.response?.data?.detail ||

                            "Impossible de modifier le client."

                        );


                        closeConfirmModal();

                    } finally {

                        setConfirmLoading(false);

                    }

                }

            });


            return;

        }


        // =================================================
        // CRÉATION
        // =================================================

        setConfirmModal({

            open: true,

            type: "success",

            title: "Créer ce client ?",

            message:
                `Voulez-vous créer le client ${form.prenom} ${form.nom} ?`,

            confirmText: "Créer",

            action: async () => {

                try {

                    setConfirmLoading(true);

                    setError("");


                    const newClient =
                        await createClient(data);


                    setClients((previous) => [

                        ...previous,

                        newClient

                    ]);


                    setShowModal(false);

                    setEditingClient(null);

                    setForm(emptyForm);

                    closeConfirmModal();


                } catch (err) {

                    console.error(err);


                    setError(

                        err.response?.data?.detail ||

                        "Impossible de créer le client."

                    );


                    closeConfirmModal();

                } finally {

                    setConfirmLoading(false);

                }

            }

        });

    };


    // =====================================================
    // SUPPRESSION
    // =====================================================

    const handleDelete = (client) => {

        setError("");


        setConfirmModal({

            open: true,

            type: "warning",

            title: "Supprimer ce client ?",

            message:
                `Vous êtes sur le point de supprimer ${client.prenom} ${client.nom}. Cette action est irréversible.`,

            confirmText: "Supprimer",

            action: async () => {

                try {

                    setConfirmLoading(true);

                    setError("");


                    await deleteClient(
                        client.id_client
                    );


                    setClients((previous) =>

                        previous.filter(

                            (item) =>

                                item.id_client !==
                                client.id_client

                        )

                    );


                    closeConfirmModal();


                } catch (err) {

                    console.error(err);


                    setError(

                        err.response?.data?.detail ||

                        "Impossible de supprimer le client."

                    );


                    closeConfirmModal();

                } finally {

                    setConfirmLoading(false);

                }

            }

        });

    };


    // =====================================================
    // RENDU
    // =====================================================

    return (

        <div className="clients-page">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="page-header">

                <div>
{/* 
                    <h1 className="page-title">
                        Clients
                    </h1>

                    <p className="page-description">
                        Gérez les clients de TMACKEN.
                    </p> */}

                </div>


                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={openCreateModal}
                >

                    <Plus size={17} />

                    Nouveau client

                </button>

            </div>


            {/* =================================================
                STATISTIQUES
            ================================================= */}

            <div className="stats-grid clients-stats">

                <div className="stat-card">

                    <div className="stat-label">
                        Total clients
                    </div>

                    <div className="stat-value">
                        {clients.length}
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-label">
                        Résultats
                    </div>

                    <div className="stat-value">
                        {filteredClients.length}
                    </div>

                </div>

            </div>


            {/* =================================================
                BARRE OUTILS
            ================================================= */}

            <div className="toolbar clients-toolbar">


                <div className="clients-search">

                    <div className="clients-search-wrapper">

                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Rechercher un client..."
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={loadClients}
                    disabled={loading}
                >

                    <RefreshCw
                        size={16}
                        className={
                            loading
                                ? "spin"
                                : ""
                        }
                    />

                    Actualiser

                </button>

            </div>


            {/* =================================================
                ERREUR PAGE
            ================================================= */}

            {error && !showModal && (

                <div className="clients-error">

                    {error}

                </div>

            )}


            {/* =================================================
                TABLEAU
            ================================================= */}

            <div className="table-container">


                {loading ? (

                    <div className="clients-loading">

                        Chargement des clients...

                    </div>

                ) : filteredClients.length === 0 ? (

                    <div className="clients-empty">

                        <Users size={35} />

                        <h3>
                            Aucun client
                        </h3>

                        <p>
                            Aucun client ne correspond
                            à votre recherche.
                        </p>

                    </div>

                ) : (

                    <table className="table">

                        <thead>

                            <tr>

                                <th>ID</th>

                                <th>Nom</th>

                                <th>Prénom</th>

                                <th>Téléphone</th>

                                <th>Email</th>

                                <th>Adresse</th>

                                <th>Création</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredClients.map(
                                (client) => (

                                    <tr
                                        key={
                                            client.id_client
                                        }
                                    >

                                        <td>
                                            #{client.id_client}
                                        </td>

                                        <td>
                                            {client.nom}
                                        </td>

                                        <td>
                                            {client.prenom}
                                        </td>

                                        <td>
                                            {client.telephone ||
                                                "—"}
                                        </td>

                                        <td>
                                            {client.email ||
                                                "—"}
                                        </td>

                                        <td>
                                            {client.adresse ||
                                                "—"}
                                        </td>

                                        <td>

                                            {client.date_creation
                                                ? new Date(
                                                    client.date_creation
                                                ).toLocaleDateString(
                                                    "fr-FR"
                                                )
                                                : "—"}

                                        </td>

                                        <td>

                                            <div className="client-actions">


                                                {/* MODIFIER */}

                                                <button
                                                    type="button"
                                                    className="table-action edit"
                                                    onClick={() =>
                                                        openEditModal(
                                                            client
                                                        )
                                                    }
                                                    title="Modifier"
                                                >

                                                    <Pencil
                                                        size={16}
                                                    />

                                                </button>


                                                {/* SUPPRIMER */}

                                                <button
                                                    type="button"
                                                    className="table-action delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            client
                                                        )
                                                    }
                                                    title="Supprimer"
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                )}

            </div>


            {/* =================================================
                MODAL CLIENT
            ================================================= */}

            {showModal && (

                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget &&
                            !saving
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div className="client-modal">


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {editingClient
                                        ? "Modifier le client"
                                        : "Nouveau client"}

                                </h2>

                                <p>

                                    {editingClient
                                        ? "Modifiez les informations du client."
                                        : "Ajoutez un nouveau client."}

                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Fermer"
                            >

                                ×

                            </button>

                        </div>


                        {/* ERREUR FORMULAIRE */}

                        {error && (

                            <div className="clients-error modal-error">

                                {error}

                            </div>

                        )}


                        {/* FORMULAIRE */}

                        <form
                            className="form-grid"
                            onSubmit={handleSubmit}
                        >


                            {/* NOM */}

                            <div className="form-group">

                                <label className="form-label">

                                    Nom *

                                </label>

                                <input
                                    className="form-input"
                                    type="text"
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    placeholder="Nom"
                                    autoComplete="family-name"
                                />

                            </div>


                            {/* PRÉNOM */}

                            <div className="form-group">

                                <label className="form-label">

                                    Prénom *

                                </label>

                                <input
                                    className="form-input"
                                    type="text"
                                    name="prenom"
                                    value={form.prenom}
                                    onChange={handleChange}
                                    placeholder="Prénom"
                                    autoComplete="given-name"
                                />

                            </div>


                            {/* TÉLÉPHONE */}

                            <div className="form-group">

                                <label className="form-label">

                                    Téléphone

                                </label>

                                <input
                                    className="form-input"
                                    type="tel"
                                    name="telephone"
                                    value={form.telephone}
                                    onChange={handleChange}
                                    placeholder="Téléphone"
                                    autoComplete="tel"
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="form-group">

                                <label className="form-label">

                                    Email

                                </label>

                                <input
                                    className="form-input"
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    placeholder="Email"
                                    autoComplete="email"
                                />

                            </div>


                            {/* ADRESSE */}

                            <div className="form-group full">

                                <label className="form-label">

                                    Adresse

                                </label>

                                <input
                                    className="form-input"
                                    type="text"
                                    name="adresse"
                                    value={form.adresse}
                                    onChange={handleChange}
                                    placeholder="Adresse"
                                    autoComplete="street-address"
                                />

                            </div>


                            {/* ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={closeModal}
                                    disabled={saving}
                                >

                                    Annuler

                                </button>


                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={saving}
                                >

                                    {editingClient
                                        ? "Enregistrer"
                                        : "Créer le client"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


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

                loading={
                    confirmLoading
                }

                onConfirm={
                    confirmModal.action
                }

                onCancel={
                    closeConfirmModal
                }

            />

        </div>

    );

}


export default Clients;