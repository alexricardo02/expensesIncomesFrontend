import Link from "next/link";

export default function LegalFooter() {
  return (
    <div className="mt-6 text-center text-xs text-slate-400 space-x-3">
      <Link href="/impressum" className="hover:text-slate-600 hover:underline">
        Impressum
      </Link>
      <span>|</span>
      <Link href="/datenschutzerklarung" className="hover:text-slate-600 hover:underline">
        Datenschutzerklärung
      </Link>
    </div>
  );
}