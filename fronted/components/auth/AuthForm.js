"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, register, clearError as clearAuthError } from "../../store/slices/authSlice";
import { motion } from "framer-motion";
import { Bot, Loader2 } from "lucide-react";

export default function AuthForm() {
    const dispatch = useDispatch();
    const { loading: authLoading, error: authError } = useSelector((state) => state.auth);

    // Auth state
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const handleAuth = async (e) => {
        e.preventDefault();
        if (isLoginView) {
            await dispatch(login({ email, password }));
        } else {
            const res = await dispatch(register({ name, email, password }));
            if (!res.error) {
                // Auto switch to login view on success
                setIsLoginView(true);
                dispatch(clearAuthError());
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4 font-sans bg-stone-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
                className="w-full max-w-md p-8 bg-white border border-stone-200 shadow-xl rounded-2xl"
            >
                <div className="flex items-center justify-center mb-8 gap-2 text-stone-900">
                    <Bot className="w-8 h-8 text-neutral-800" />
                    <span className="text-2xl font-bold tracking-tight">QuestionAI</span>
                </div>

                <h2 className="mb-6 text-xl font-semibold text-center text-stone-800">
                    {isLoginView ? "Welcome back" : "Create an account"}
                </h2>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLoginView && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-stone-600">Name</label>
                            <input
                                type="text"
                                autoFocus
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-600">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-stone-600">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 text-stone-900 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    {authError && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="text-sm text-red-500 font-medium pb-2">
                            {authError}
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={authLoading}
                        className="w-full py-2.5 mt-2 font-medium text-white transition-colors bg-stone-900 hover:bg-stone-800 rounded-lg flex justify-center items-center gap-2 disabled:bg-stone-600"
                    >
                        {authLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLoginView ? "Sign In" : "Sign Up")}
                    </button>
                </form>

                <p className="mt-6 text-sm text-center text-stone-500">
                    {isLoginView ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => { setIsLoginView(!isLoginView); dispatch(clearAuthError()); }}
                        className="text-stone-900 hover:underline focus:outline-none font-medium"
                    >
                        {isLoginView ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
