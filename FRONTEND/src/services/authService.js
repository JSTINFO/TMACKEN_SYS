import api from "./api";


// ==========================================
// CONNEXION
// ==========================================

export const login = async (
    username,
    password
) => {

    const response = await api.post(
        "/auth/login",
        {
            username,
            password
        }
    );

    return response.data;
};


// ==========================================
// UTILISATEUR CONNECTÉ
// ==========================================

export const getCurrentUser = async () => {

    const response = await api.get(
        "/auth/me"
    );

    return response.data;
};

// ==========================================
// MODIFIER L'UTILISATEUR CONNECTÉ
// ==========================================

export const updateCurrentUser = async (userData) => {

    const response = await api.put(
        "/auth/me",
        userData
    );

    return response.data;
};


// ==========================================
// MODIFIER LE MOT DE PASSE
// ==========================================

export const updatePassword = async (
    actuel,
    nouveau
) => {

    const response = await api.put(
        "/auth/me/password",
        {
            actuel,
            nouveau
        }
    );

    return response.data;
};