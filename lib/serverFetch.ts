export async function fetchWithRetry(url: string, options: RequestInit = {}) {
  const attempts = [6000, 28000]; 
  
  for (let i = 0; i < attempts.length; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), attempts[i]);
    
    try {
      const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
      clearTimeout(timeoutId);

      if (res.status >= 500) {
        if (i === attempts.length - 1) return { ok: false, coldStart: true, data: null };
        continue; 
      }

      if (!res.ok) {
        return { ok: false, coldStart: false, data: null };
      }

      const data = await res.json();
      return { ok: true, coldStart: false, data };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (i === attempts.length - 1) {
        return { ok: false, coldStart: true, data: null };
      }
    }
  }
  return { ok: false, coldStart: true, data: null };
}