import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "./api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            getMe()
                .then((res) => setUser(res.data.data))
                .catch(() => {
                    localStorage.removeItem("token");
                    setToken("");
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = (tkn, userData) => {
        localStorage.setItem("token", tkn);
        setToken(tkn);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
