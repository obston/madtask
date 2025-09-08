"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminBreadcrumb({ title }: { title: string }) {
  const path = usePathname();
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-neutral-400">
        <Link href="/admin" className="hover:underline">Admin</Link>
        <span className="mx-2">/</span>
        <span className="text-neutral-200">{title}</span>
      </div>
      <div className="text-xs text-neutral-500 font-mono">{path}</div>
    </div>
  );
}
