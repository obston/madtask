"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/conversaciones", label: "Conversaciones" },
  { href: "/memoria", label: "Memoria" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/admin", label: "Admin" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-neutral-800 text-xl font-semibold">MadTask</div>
      <nav className="p-2 space-y-1">
        {links.map((l) => {
          const active = pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                active ? "bg-neutral-800 text-white" : "text-neutral-300 hover:bg-neutral-800/60 hover:text-white"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-3 text-xs text-neutral-500">Sprint 1 — MVP</div>
    </div>
  );
}
