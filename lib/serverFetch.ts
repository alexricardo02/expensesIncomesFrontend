// lib/serverFetch.ts

export async function fetchWithRetry(url: string, options: RequestInit = {}): Promise<any | null> {
  // WHY: 1st attempt fails fast if Render is sleeping. 2nd attempt gives Render 28s to wake up.
  const attempts = [6000, 28000]; 
  
  for (let i = 0; i < attempts.length; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), attempts[i]);
    
    try {
      const res = await fetch(url, { 
        ...options, 
        signal: controller.signal, 
        cache: "no-store" 
      });
      
      clearTimeout(timeoutId);
      
      // WHY: If the response is not OK (e.g., 401 Unauthorized, 500 Internal Error), 
      // we throw to trigger a retry or final failure, rather than parsing an HTML error page.
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      // WHY: Consume the JSON stream inside the try block while the connection is guaranteed open.
      const data = await res.json();
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`Attempt ${i + 1} failed for URL ${url}:`, error);
      
      // If it's the last attempt, return null to signal a complete failure (Cold start / offline)
      if (i === attempts.length - 1) {
        return null;
      }
    }
  }
  return null;
}