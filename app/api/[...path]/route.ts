import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function proxy(request: NextRequest, path: string[]) {
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;
  const token = request.cookies.get("auth_token")?.value;

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

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

  // WHY: Preserve the backend headers so binary downloads keep their original content type.
  const responseHeaders = new Headers(backendResponse.headers);
  // WHY: Remove content-encoding so browsers do not try to decode an already buffered response.
  responseHeaders.delete("content-encoding"); 
  responseHeaders.delete("content-length");

  // WHY: Return the raw bytes unchanged so exported files are not corrupted.
  const response = new NextResponse(buffer, { 
    status: backendResponse.status,
    headers: responseHeaders 
  });

  const setCookieHeader = backendResponse.headers.get("set-cookie");
  if (setCookieHeader) {
    // WHY: Forward the HttpOnly cookie through the proxy response so the browser receives it.
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
export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ path: string[] }> } 
) {
  const token = req.cookies.get('auth_token')?.value;
  const body = await req.json().catch(() => ({})); 

  // WHY: Next.js 15 resolves route params asynchronously, so we await them before building the DELETE request.
  const resolvedParams = await params;

  return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/${resolvedParams.path.join('/')}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
}
export async function PATCH(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
