import { NextResponse } from 'next/dev/server';
import type { NextRequest } from 'next/dev/server';

export function middleware(request: NextRequest) {
  // 1. El guardia busca tu cookie
  const token = request.cookies.get('auth_token')?.value;

  const path = request.nextUrl.pathname;
  const isPublicRoute = path === '/login' || path === '/register';

  // 2. Si NO tienes token y la ruta NO es pública (quieres entrar al Dashboard) -> fuera (Login)
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Si SÍ tienes token pero intentas ir a /login o /register -> Te manda de regreso al Dashboard
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 4. Si todo está en orden, te deja pasar
  return NextResponse.next();
}

// Aquí le decimos al guardia qué rutas debe vigilar
export const config = {
  matcher: [
    /*
     * Hace match con todas las rutas excepto:
     * - api (rutas de API locales)
     * - _next/static (archivos estáticos de Next)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, archivos .svg, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$).*)',
  ],
};