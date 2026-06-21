"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";


export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Limpiamos con seguridad
    const cleanUsername = username ? username.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanUsername || !cleanPassword) {
      setError("Por favor, llena ambos campos.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2. ¡EL ARREGLO ESTÁ AQUÍ! Forzamos los nombres que Java espera
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Usuario o contraseña incorrectos");
      }

      // 3. GUARDAMOS LA MAGIA (Sin duplicados)
      const fourteenMinutes = 14 / (24 * 60); // 14 minutos en formato días para js-cookie

      Cookies.set("auth_token", data.token, { expires: fourteenMinutes, path: '/' });

      if (data.refreshToken) {
        Cookies.set("refresh_token", data.refreshToken, { expires: 7, path: '/' });
      }

      if (data.profile) {
        Cookies.set("user_profile", JSON.stringify(data.profile), { expires: 7, path: '/' });
      }

      // Redirigimos al Dashboard
      router.refresh(); // Refrescamos cache primero
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Welcome</h1>
          <p className="text-slate-500 mt-2">Manage your finances securely</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg flex items-center text-sm border border-rose-100">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">User</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-slate-900 w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="Your username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-slate-900 w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Iniciando sesión..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            ¿Not a member?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}