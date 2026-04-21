"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import EyeIcon from "@/app/components/icons/EyeIcon";
import EyeOffIcon from "@/app/components/icons/EyeOffIcon";
import { validate, ValidationErrors } from "@/app/utils/validation";
import api from "@/app/lib/api";


export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const errs = validate(email, password);
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;

        setLoading(true);
        try {
            const response = await api.post("/auth/login", { email, password });

            if (response.data.accessToken) {
                localStorage.setItem("accessToken", response.data.accessToken);
            }
            if (response.data.refreshToken) {
                localStorage.setItem("refreshToken", response.data.refreshToken);
            }
            toast.success("Logged in successfully! Redirecting...");
            router.push("/dashboard");
        } catch (err) {
            if (axios.isAxiosError(err)) {
                toast.error(err.response?.data?.message || err.response?.data?.error || "Login failed");
            } else {
                toast.error("An unexpected error occurred");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") handleLogin();
    };

    return (
        <div className="flex bg-gray-950 text-gray-100 overflow-hidden mx-auto my-2">

            <div className="w-full lg:w-115 flex items-center justify-center p-8 lg:border-l border-white/5 bg-white/2 backdrop-blur-xl relative">
                <div className="w-full max-w-sm">

                    <p className="text-[11px] tracking-widest uppercase text-gray-500 mb-6 font-medium">
                        Welcome back
                    </p>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Sign in</h2>
                    <p className="text-sm text-gray-500 font-light mb-8">
                        Enter your credentials to access your workspace
                    </p>

                    <div className="mb-5">
                        <label className="block text-xs font-medium text-gray-400 tracking-wide mb-2">
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrors((v) => ({ ...v, email: "" }));
                            }}
                            className={`w-full bg-white/4 border rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 outline-none transition-all duration-200 ${errors.email
                                ? "border-red-500/40 focus:border-red-500/60 bg-red-500/5"
                                : "border-white/10 focus:border-violet-500/50 focus:bg-violet-500/5"
                                }`}
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-xs text-red-400 font-light">{errors.email}</p>
                        )}
                    </div>

                    <div className="mb-2">
                        <label className="block text-xs font-medium text-gray-400 tracking-wide mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setErrors((v) => ({ ...v, password: "" }));
                                }}
                                className={`w-full bg-white/2 border rounded-xl px-4 py-3 pr-11 text-sm text-gray-100 placeholder-gray-600 outline-none transition-all duration-200 ${errors.password
                                    ? "border-red-500/40 focus:border-red-500/60 bg-red-500/5"
                                    : "border-white/10 focus:border-violet-500/50 focus:bg-violet-500/5"
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1.5 text-xs text-red-400 font-light">{errors.password}</p>
                        )}
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full mt-4 py-3 rounded-xl bg-white text-gray-950 text-sm font-medium tracking-wide transition-all duration-200 hover:bg-gray-100 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <svg className="w-4 h-4 animate-spin text-gray-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        )}
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/[0.07]" />
                        <span className="text-xs text-gray-600">or</span>
                        <div className="flex-1 h-px bg-white/[0.07]" />
                    </div>

                    <p className="text-center text-sm text-gray-500 font-light">
                        Don't have an account?{" "}
                        <a href="/register" className="text-violet-400 font-medium hover:text-violet-300 transition-colors">
                            Create one
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}