import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    login as loginService,
    getCurrentUser
} from "../services/authService";


const AuthContext = createContext(null);


export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);


    // =====================================
    // VÉRIFIER LA SESSION
    // =====================================

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {

            setLoading(false);

            return;
        }


        getCurrentUser()

            .then((userData) => {

                setUser(userData);

            })

            .catch(() => {

                localStorage.removeItem("access_token");

                setUser(null);

            })

            .finally(() => {

                setLoading(false);

            });

    }, []);


    // =====================================
    // LOGIN
    // =====================================

    const login = async (username, password) => {

        const data = await loginService(
            username,
            password
        );


        localStorage.setItem(
            "access_token",
            data.access_token
        );


        const userData = await getCurrentUser();

        setUser(userData);


        return userData;
    };


    // =====================================
    // LOGOUT
    // =====================================

    const logout = () => {

        localStorage.removeItem("access_token");

        setUser(null);
    };


    return (

        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user
            }}
        >

            {children}

        </AuthContext.Provider>

    );
}


export function useAuth() {

    return useContext(AuthContext);

}