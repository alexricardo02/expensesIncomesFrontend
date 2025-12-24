// src/lib/utils.ts

export const formatCurrency = (value: number, currency: string): string => {
  const locales: Record<string, string> = {
    EUR: "de-DE",
    USD: "en-US",
    GBP: "en-GB",
    JPY: "ja-JP",
  };

  return new Intl.NumberFormat(locales[currency] || "en-US", {
    style: "currency",
    currency: locales[currency] ? currency : "USD",
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(value);
};