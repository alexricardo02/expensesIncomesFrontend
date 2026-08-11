"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Locale, getTranslation } from "./translations";

const SUPPORTED: Locale[] = ["en", "es", "de"];
const COOKIE_NAME = "locale";

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const l of langs) {
    const code = l.slice(0, 2).toLowerCase();
    if (SUPPORTED.includes(code as Locale)) return code as Locale;
  }
  return "en";
}

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children, initialLocale }: { children: React.ReactNode; initialLocale?: Locale }) {
  const router = useRouter();
  const [prevInitialLocale, setPrevInitialLocale] = useState(initialLocale);
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (initialLocale) return initialLocale;
    if (typeof window === "undefined") return "en";

    const saved = Cookies.get(COOKIE_NAME) as Locale | undefined;
    return saved && SUPPORTED.includes(saved) ? saved : detectLocale();
  });

  if (initialLocale && initialLocale !== prevInitialLocale && SUPPORTED.includes(initialLocale)) {
    setPrevInitialLocale(initialLocale);
    setLocaleState(initialLocale);
  }

  const setLocale = useCallback((l: Locale) => {
    if (!SUPPORTED.includes(l)) return;
    setLocaleState(l);
    Cookies.set(COOKIE_NAME, l, { expires: 365, path: "/", sameSite: "lax" });
    router.refresh();
  }, [router]);

  const t = useCallback((path: string, params?: Record<string, string | number>): string => {
    const translated = getTranslation(path, locale, params);
    return typeof translated === "string" ? translated : String(translated);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}