import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  if (authToken) {
    if (isAuthPage) {
        // Si intenta ir al login estando logueado, lo mandamos al dashboard
        return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!authToken && refreshToken) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/refresh`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshToken }),
        },
      );

      if (res.ok) {
        const data = await res.json();
        const newAuthToken = data.token;
        const newRefreshToken = data.refreshToken;

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set(
          "Cookie",
          `auth_token=${newAuthToken}; refresh_token=${refreshToken}`,
        );

        const response = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });

        response.cookies.set({
          name: "auth_token",
          value: newAuthToken,
          maxAge: 14 * 60,
          path: "/",
        });

        response.cookies.set({
          name: "refresh_token",
          value: newRefreshToken,
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });

        return response;
      }
    } catch (error) {
      console.error("Error al refrescar el token silenciosamente:", error);
    }
  }

  if (!isAuthPage) {
     return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// 7. Configuramos en qué rutas debe actuar este guardia
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};