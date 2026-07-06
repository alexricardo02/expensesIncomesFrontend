import { cookies } from "next/headers";
import { fetchWithRetry } from "./serverFetch";

export async function getUsdArsRate() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  try {
    const res = await fetchWithRetry(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/exchange-rate/usd-ars`,
    );
    if (!res) return 1000;
    if (!res.ok) return null;
    return res.data;
  } catch {
    return null;
  }
}
