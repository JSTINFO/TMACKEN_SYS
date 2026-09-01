import axios from "axios";


const api = axios.create({

    baseURL: "http://192.168.1.226:8000",

    headers: {
        "Content-Type": "application/json",
    },

});


// =====================================
// AJOUT AUTOMATIQUE DU TOKEN
// =====================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem("access_token");

        if (token) {

            config.headers.Authorization = `Bearer ${token}`;

        }

        return config;
    },

    (error) => {

        return Promise.reject(error);

    }

);


export default api;