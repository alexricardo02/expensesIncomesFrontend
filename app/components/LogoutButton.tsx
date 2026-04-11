"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react"; // Usamos el ícono de salida

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // 1. Borramos las "llaves" del navegador
    Cookies.remove("auth_token");
    Cookies.remove("user_profile");

    // 2. Redirigimos al usuario al Login inmediatamente
    router.push("/login");

    // 3. ¡IMPORTANTE! Refrescamos la ruta para limpiar cualquier 
    // rastro de datos en el caché de Next.js
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all font-medium cursor-pointer border border-rose-100 shadow-sm"
    >
      <LogOut size={18} />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}