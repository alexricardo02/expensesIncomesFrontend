export async function fetchWithRetry(url: string, options: RequestInit = {}) {
  // WHY: 1er intento rápido (6s). 2do intento (28s) da tiempo a Render para despertar.
  const attempts = [6000, 28000]; 
  
  for (let i = 0; i < attempts.length; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), attempts[i]);
    
    try {
      const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-store" });
      clearTimeout(timeoutId);

      // WHY: Si Render está reiniciando, a veces escupe un 502/503/504 en vez de timeout. 
      // Lo tratamos como Cold Start y forzamos reintento.
      if (res.status >= 500) {
        if (i === attempts.length - 1) return { ok: false, coldStart: true, data: null };
        continue; 
      }

      // WHY: Si es 401 (Token expirado) o 404 (URL mal), NO es un cold start. 
      // Devolvemos el error limpiamente sin enmascararlo.
      if (!res.ok) {
        return { ok: false, coldStart: false, data: null };
      }

      // WHY: Parseamos el JSON internamente de forma segura mientras la conexión está viva.
      const data = await res.json();
      return { ok: true, coldStart: false, data };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      // WHY: AbortError significa que el timeout cortó la petición. Es un Cold Start real.
      if (i === attempts.length - 1) {
        return { ok: false, coldStart: true, data: null };
      }
    }
  }
  return { ok: false, coldStart: true, data: null };
}