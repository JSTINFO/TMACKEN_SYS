import api from "./api";

export const getMyEntreprise = async () => {
    const response = await api.get("/entreprise/me");
    return response.data;
};

export const updateMyEntreprise = async (entrepriseData) => {
    const response = await api.put(
        "/entreprise/me",
        entrepriseData
    );

    return response.data;
};

export const uploadEntrepriseLogo = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await api.post(
        "/entreprise/me/logo",
        formData
    );

    return response.data;
};