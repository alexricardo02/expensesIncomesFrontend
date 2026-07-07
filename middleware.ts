import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  if (authToken) {
    if (isAuthPage) return NextResponse.redirect(new URL('/', request.url));
    return NextResponse.next();
  }

  if (!authToken && refreshToken) {
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
        const response = NextResponse.next();
        const setCookies = (res.headers as any).getSetCookie?.() ?? [];
        setCookies.forEach((c: string) => response.headers.append('Set-Cookie', c));
        return response;
      }
    } catch (error) {
      console.error("Error al refrescar el token:", error);
    }
  }

  if (!isAuthPage) return NextResponse.redirect(new URL('/login', request.url));
  return NextResponse.next();
}

export const config = {
  // Se excluyen rutas proxy (/api/*), recursos estáticos y páginas públicas
  // Evita que el middleware exija un JWT en el handshake inicial de autenticación
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login|register).*)'],
};