"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { useEffect } from "react";
import { authSlice, logout } from "../store/slices/authSlice";
import axios from "axios";

export function Providers({ children }) {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                store.dispatch(authSlice.actions.setTokenFromStorage(storedToken));
            }
        }

        // Axios Interceptor for 401 Unauthorized
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    store.dispatch(logout());
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.response.eject(interceptor);
        };
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
