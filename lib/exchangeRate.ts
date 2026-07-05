import { cookies } from "next/headers";

export async function getUsdArsRate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/exchange-rate/usd-ars`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}