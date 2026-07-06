export async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response | null> {
  const attempts = [6000, 28000]; // 1er intento rápido, 2do le da tiempo al cold start
  for (let i = 0; i < attempts.length; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), attempts[i]);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
      clearTimeout(timeout);
      return res;
    } catch {
      clearTimeout(timeout);
      if (i === attempts.length - 1) return null;
    }
  }
  return null;
}