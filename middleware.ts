import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    // Edge requiere el padding '=' exacto para decodificar sin fallar
    const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    const payload = JSON.parse(atob(base64 + pad));
    return !payload.exp || payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  if (authToken && !isTokenExpired(authToken)) {
    if (isAuthPage) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }
  
  if (refreshToken) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/refresh`, {
        method: "POST",
        headers: { Cookie: `refresh_token=${refreshToken}` },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        // 🔴 BONUS: Si se refrescó con éxito, pero estaban en /login, redirigir al Dashboard
        const response = isAuthPage ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
        const setCookies = (res.headers as any).getSetCookie?.() ?? [];
        setCookies.forEach((c: string) => response.headers.append('Set-Cookie', c));
        return response;
      }
    } catch (error) {
      console.error("Error al refrescar el token:", error);
    }
  }

  // Si no hay refresh token, o el refresh falló, expulsar
  if (!isAuthPage) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register|forgot-password|reset-password|impressum|datenschutzerklarung).*)'],
};