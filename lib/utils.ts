// src/lib/utils.ts

export const formatCurrency = (value: number, currency: string, compact: boolean = false): string => {
  const locales: Record<string, string> = {
    EUR: "de-DE",
    USD: "en-US",
    GBP: "en-GB",
    JPY: "ja-JP",
    ARS: "es-AR",
  };

  const minFractions = currency === "JPY" || compact ? 0 : 2;
  const maxFractions = currency === "JPY" ? 0 : (compact ? 1 : 2);

  return new Intl.NumberFormat(locales[currency] || "en-US", {
    style: "currency",
    currency: locales[currency] ? currency : "USD",
    minimumFractionDigits: minFractions,
    maximumFractionDigits: maxFractions,
    notation: compact ? "compact" : "standard",
  }).format(value);
};