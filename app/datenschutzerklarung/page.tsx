import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Datenschutzerklärung — Finance Tracker" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold text-slate-900 text-lg">{title}</h2>
      <div className="text-sm text-slate-700 space-y-2">{children}</div>
    </section>
  );
}

export default function DatenschutzPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/login" className="flex items-center text-slate-500 hover:text-slate-800 text-sm">
          <ArrowLeft size={16} className="mr-2" /> Back
        </Link>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-8">
          <h1 className="text-2xl font-bold">Datenschutzerklärung</h1>

          <Section title="1. Verantwortlicher">
            <p>
              Alex Ricardo Brinckmann, Isaac-Fulda-Allee 4, 55124 Mainz, Germany —
              E-Mail: brinckmannalex@gmail.com
            </p>
          </Section>

          <Section title="2. Welche Daten wir verarbeiten">
            <ul className="list-disc pl-5 space-y-1">
              <li>E-Mail-Adresse (Registrierung, Konto-Wiederherstellung)</li>
              <li>
                Passwort — gespeichert ausschließlich als gesalzener BCrypt-Hash,
                niemals im Klartext
              </li>
              <li>
                Finanzdaten — von dir eingetragene Einnahmen/Ausgaben, Kategorien
                und Zahlungsmethoden
              </li>
            </ul>
          </Section>

          <Section title="3. Hosting und Auftragsverarbeiter">
            <p>Zur Bereitstellung des Dienstes nutzen wir folgende Dienstleister:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Vercel Inc.</strong> — Hosting des Next.js-Frontends</li>
              <li><strong>Render Services</strong> — Hosting des Spring-Boot-Backends</li>
              <li><strong>Neon Inc.</strong> — PostgreSQL-Datenbank in der Cloud</li>
              <li><strong>Upstash Inc.</strong> — Redis-Caching-Dienst</li>
            </ul>
            <p>
              Diese Anbieter verarbeiten Daten in unserem Auftrag zur Erbringung
              der technischen Infrastruktur.
            </p>
          </Section>

          <Section title="4. Rechtsgrundlage und Zweck">
            <p>
              Die Verarbeitung erfolgt zur Vertragserfüllung (Art. 6 Abs. 1 lit. b
              DSGVO), um dir die Kontoverwaltung und das Tracking deiner Finanzen
              zu ermöglichen.
            </p>
          </Section>

          <Section title="5. Deine Rechte (DSGVO)">
            <p>Du hast jederzeit das Recht auf:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Auskunft über deine gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten (Profil-Einstellungen)</li>
              <li>
                Löschung deines Kontos und aller zugehörigen Daten — jederzeit
                selbstständig unter{" "}
                <Link href="/settings" className="text-indigo-600 hover:underline">
                  Settings → Delete Account
                </Link>
              </li>
              <li>
                Datenübertragbarkeit — Export deiner Transaktionen als CSV, Excel
                oder PDF unter{" "}
                <Link href="/edit-transactions" className="text-indigo-600 hover:underline">
                  Export
                </Link>
              </li>
              <li>Widerspruch und Einschränkung der Verarbeitung</li>
            </ul>
          </Section>

          <Section title="6. Speicherdauer">
            <p>
              Deine Daten werden gespeichert, solange dein Konto besteht. Bei
              Löschung des Kontos werden alle personenbezogenen und finanziellen
              Daten unwiderruflich aus unserer Datenbank entfernt.
            </p>
          </Section>

          <Section title="7. Kontakt zum Datenschutz">
            <p>Bei Fragen: brinckmannalex@gmail.com</p>
          </Section>
        </div>
      </div>
    </main>
  );
}