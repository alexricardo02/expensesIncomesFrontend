import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function proxy(request: NextRequest, path: string[]) {
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  const backendResponse = await fetch(targetUrl, init);

  const buffer = await backendResponse.arrayBuffer();

  // 2. Clonamos las cabeceras originales (para conservar el Content-Type de PDF/Excel)
  const responseHeaders = new Headers(backendResponse.headers);
  // Eliminamos esta cabecera para evitar errores de codificación en navegadores
  responseHeaders.delete("content-encoding"); 
  responseHeaders.delete("content-length");
  
  // 3. Creamos la respuesta pasándole los bytes crudos
  const response = new NextResponse(buffer, { 
    status: backendResponse.status,
    headers: responseHeaders 
  });

  const setCookieHeader = backendResponse.headers.get("set-cookie");
  if (setCookieHeader) {
    // Requerido para propagar la cookie HttpOnly al navegador a través de Next.js Server
    response.headers.set("set-cookie", setCookieHeader);
  }
  return response;
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
export async function POST(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
export async function PUT(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = req.cookies.get('auth_token')?.value;
  
  // Extraer el body para reenviar la contraseña
  const body = await req.json().catch(() => ({})); 

  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${params.path.join('/')}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ¡Crucial para no recibir 403!
    },
    body: JSON.stringify(body) // Reenviar el DTO al backend
  });
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
