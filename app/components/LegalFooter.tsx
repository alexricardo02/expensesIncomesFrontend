import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LegalFooter() {
  const { t } = useLanguage();
  return (
    <div className="mt-6 text-center text-xs text-slate-400 space-x-3">
      <Link href="/impressum" className="hover:text-slate-600 hover:underline dark:hover:text-slate-200">
        {t("legal.footer.impressum")}
      </Link>
      <span>|</span>
      <Link href="/datenschutzerklarung" className="hover:text-slate-600 hover:underline dark:hover:text-slate-200">
        {t("legal.footer.privacy")}
      </Link>
    </div>
  );
}