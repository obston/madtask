import Link from "next/link";

const LINKS = [
  { href: "/overview", label: "Overview" },
  { href: "/conversaciones", label: "Conversaciones" },
  { href: "/agenda", label: "Agenda" },
  { href: "/mensajes", label: "Mensajes" },
  { href: "/memoria", label: "Memoria" },
  { href: "/admin", label: "Admin" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-neutral-900 h-screen sticky top-0">
      <nav className="p-4 space-y-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block px-3 py-2 rounded hover:bg-neutral-900/50"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-3 text-xs text-neutral-500">Sprint 1 — MVP</div>
    </aside>
  );
}
