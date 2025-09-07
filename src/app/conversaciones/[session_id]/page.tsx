import { redirect } from "next/navigation";

export default async function Page({
  params,
}: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params;
  redirect(`/conversaciones?id=${encodeURIComponent(session_id)}`);
}
