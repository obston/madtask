import { headers } from "next/headers";

export async function getBaseUrl() {
  const h = await headers(); // ✅ ahora sí, await
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "development" ? "http" : "https");
  return `${proto}://${host}`;
}
