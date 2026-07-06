"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface Rate {
  compra: number;
  venta: number;
  casa: string;
  fechaActualizacion: string;
}

type DisplayMode = "ORIGINAL" | "ARS_TO_USD" | "USD_TO_ARS";

interface CurrencyDisplayContextType {
  displayMode: DisplayMode;
  setDisplayMode: (m: DisplayMode) => void;
  rate: Rate | null;
  convert: (amount: number, originalCurrency: string) => { amount: number; currency: string };
}


const CurrencyDisplayContext = createContext<CurrencyDisplayContextType | null>(null);


export function CurrencyDisplayProvider({ rate, children }: { rate: Rate | null; children: ReactNode }) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>("ORIGINAL");

  const convert = (amount: number, originalCurrency: string) => {
    if (!rate || displayMode === "ORIGINAL") {
      return { amount, currency: originalCurrency };
    }
    
    // FIX: Si elegimos ARS a USD, SOLO convertimos los que originalmente eran ARS.
    if (displayMode === "ARS_TO_USD" && originalCurrency === "ARS") {
      return { amount: amount / rate.venta, currency: "USD" };
    }
    
    // FIX: Si elegimos USD a ARS, SOLO convertimos los que originalmente eran USD.
    if (displayMode === "USD_TO_ARS" && originalCurrency === "USD") {
      return { amount: amount * rate.venta, currency: "ARS" };
    }
    
    // FIX: Cualquier otra moneda (EUR, GBP) u otra combinación, se ignora y queda intacta.
    return { amount, currency: originalCurrency };
  };

  return (
    <CurrencyDisplayContext.Provider value={{ displayMode, setDisplayMode, rate, convert }}>
      {children}
    </CurrencyDisplayContext.Provider>
  );
}

export function useCurrencyDisplay() {
  const ctx = useContext(CurrencyDisplayContext);
  if (!ctx) throw new Error("useCurrencyDisplay must be used within CurrencyDisplayProvider");
  return ctx;
}