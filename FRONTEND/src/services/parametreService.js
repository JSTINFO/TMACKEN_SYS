import api from "./api";

export const getParametres = async () => {
    const response = await api.get("/parametres/");
    return response.data;
};

export const updateParametre = async (idParametre, data) => {
    const response = await api.put(
        `/parametres/${idParametre}`,
        data
    );

    return response.data;
};