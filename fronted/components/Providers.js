"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { useEffect } from "react";
import { authSlice } from "../store/slices/authSlice";

export function Providers({ children }) {
    useEffect(() => {
        // Automatically load token from local storage if window is available
        if (typeof window !== "undefined") {
            const storedToken = localStorage.getItem("token");
            if (storedToken) {
                store.dispatch(authSlice.actions.setTokenFromStorage(storedToken));
            }
        }
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
