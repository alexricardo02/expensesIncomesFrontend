"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Rate {
  compra: number;
  venta: number;
  casa: string;
  fechaActualizacion: string;
}

interface CurrencyDisplayContextType {
  displayCurrency: "USD" | "ARS";
  setDisplayCurrency: (c: "USD" | "ARS") => void;
  rate: Rate | null;
  convert: (amount: number, originalCurrency: string) => { amount: number; currency: string };
}

const CurrencyDisplayContext = createContext<CurrencyDisplayContextType | null>(null);

export function CurrencyDisplayProvider({ rate, children }: { rate: Rate | null; children: ReactNode }) {
  const [displayCurrency, setDisplayCurrency] = useState<"USD" | "ARS">("USD");

  const convert = (amount: number, originalCurrency: string) => {
    if (!rate || originalCurrency === displayCurrency) {
      return { amount, currency: originalCurrency };
    }
    if (originalCurrency === "USD" && displayCurrency === "ARS") {
      return { amount: amount * rate.venta, currency: "ARS" };
    }
    if (originalCurrency === "ARS" && displayCurrency === "USD") {
      return { amount: amount / rate.venta, currency: "USD" };
    }
    return { amount, currency: originalCurrency };
  };

  return (
    <CurrencyDisplayContext.Provider value={{ displayCurrency, setDisplayCurrency, rate, convert }}>
      {children}
    </CurrencyDisplayContext.Provider>
  );
}

export function useCurrencyDisplay() {
  const ctx = useContext(CurrencyDisplayContext);
  if (!ctx) throw new Error("useCurrencyDisplay must be used within CurrencyDisplayProvider");
  return ctx;
}