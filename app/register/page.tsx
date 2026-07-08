"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Mail, AlertCircle, ArrowLeft, Eye, EyeOff, Check } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const passwordRules = [
    { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { label: "At least one uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { label: "At least one number", test: (p: string) => /\d/.test(p) },
    { label: "At least one special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // 1. Limpiamos con seguridad (agregué email que faltaba limpiar)
    const cleanUsername = username ? username.trim().toLowerCase() : "";
    const cleanEmail = email ? email.trim().toLowerCase() : "";
    const cleanPassword = password ? password.trim() : "";

    if (!cleanUsername || !cleanEmail || !cleanPassword) {
      setError("Por favor, completa todos los campos.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 2. ¡EL ARREGLO ESTÁ AQUÍ! 
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: cleanPassword
        }),
      });

      if (!res.ok) {
        // Capturamos el error JSON de Java si existe, si no, como texto
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Error al crear la cuenta");
      }

      router.push("/login");

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center text-slate-400 hover:text-slate-600 mb-6 text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} className="mr-1 cursor-pointer" /> Back to Login
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2">Start tracking your finances today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg flex items-center text-sm border border-rose-100">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-slate-900 w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="e.g.: tomas_dev"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-slate-900 w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
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

            {/* Password requirements */}
            {password.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {passwordRules.map((rule) => {
                  const met = rule.test(password);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-2 text-xs font-medium transition-colors ${met ? "text-emerald-600" : "text-slate-400"
                        }`}
                    >
                      <span
                        className={`flex items-center justify-center w-4 h-4 rounded-full border transition-colors ${met
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-slate-300"
                          }`}
                      >
                        {met && <Check size={10} strokeWidth={3} className="text-white" />}
                      </span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 mt-2 cursor-pointer"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}