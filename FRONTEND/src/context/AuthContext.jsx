import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    login as loginService,
    getCurrentUser,
    updateCurrentUser as updateCurrentUserService
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
    // MODIFIER L'UTILISATEUR
    // =====================================

    const updateUser = async (userData) => {

        const updatedUser =
            await updateCurrentUserService(
                userData
            );

        setUser(updatedUser);

        return updatedUser;
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
                updateUser,
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