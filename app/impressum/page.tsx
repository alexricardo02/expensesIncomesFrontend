import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Impressum — Finance Tracker" };

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/login" className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
          <h1 className="text-2xl font-bold">Impressum</h1>

          <section className="space-y-1 text-sm text-slate-700">
            {/* Aktualisiert von TMG auf das aktuelle DDG für maximale Compliance-Qualität im Portfolio */}
            <h2 className="font-semibold text-slate-900">Angaben gemäß § 5 DDG</h2>
            <p>Alex Ricardo Brinckmann</p>
            <p>Isaac-Fulda-Allee 4</p>
            <p>55124 Mainz, Deutschland</p>
          </section>

          <section className="space-y-1 text-sm text-slate-700">
            <h2 className="font-semibold text-slate-900">Kontakt</h2>
            <p>E-Mail: brinckmannalex@gmail.com</p>
          </section>

          <section className="space-y-1 text-sm text-slate-700">
            <h2 className="font-semibold text-slate-900">Verantwortlich für den Inhalt</h2>
            <p>Alex Ricardo Brinckmann (Anschrift wie oben)</p>
          </section>

          <p className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            Dies ist un persönliches, nicht-kommerzielles Portfolio-Projekt. Finance Tracker wird
            im vorliegenden Zustand (as-is) ausschließlich zu Demonstrationszwecken bereitgestellt.
          </p>
        </div>
      </div>
    </main>
  );
}