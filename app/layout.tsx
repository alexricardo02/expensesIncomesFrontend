import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import type { Locale } from "@/lib/i18n/translations";
import { ThemeProvider, type Theme } from "@/lib/theme/ThemeContext";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finance Tracker",
  description: "Personal finance dashboard — track income and expenses with real-time stats.",
  openGraph: {
    title: "Finance Tracker",
    description: "Personal finance dashboard built with Next.js, Spring Boot, Redis, and PostgreSQL.",
    type: "website",
  },
};

const SUPPORTED_LOCALES: Locale[] = ["en", "es", "de"];

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const initialLocale = cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale) ? cookieLocale : undefined;
  const initialTheme: Theme = cookieStore.get("theme")?.value === "dark" ? "dark" : "light";

  return (
    <html lang={initialLocale ?? "en"} className={initialTheme === "dark" ? "dark" : ""}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider initialTheme={initialTheme}>
          <LanguageProvider initialLocale={initialLocale}>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}