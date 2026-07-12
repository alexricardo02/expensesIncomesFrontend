"use client";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useLanguage();

  const handleLogout = async () => {
    try {
      await fetch("/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout request failed", e);
    }
    Cookies.remove("user_profile");
    router.push("/login");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="flex items-center justify-center w-full lg:w-auto gap-2 px-4 py-2.5 rounded-xl font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors shadow-sm cursor-pointer">
      <LogOut size={20} />
      <span>{t("common.logout")}</span>
    </button>
  );
}