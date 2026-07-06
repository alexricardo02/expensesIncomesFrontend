"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("user_profile");
    Cookies.remove("auth_token", { path: '/' });
    Cookies.remove("refresh_token", { path: '/' });

    router.push("/login");

    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center w-full lg:w-auto gap-2 px-4 py-2.5 rounded-xl font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors shadow-sm cursor-pointer"
    >
      <LogOut size={20} />
      <span>Logout</span>
    </button>
  );
}