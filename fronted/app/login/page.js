"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import AuthForm from "../../components/auth/AuthForm";

export default function LoginPage() {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) return null;

    return <AuthForm />;
}
