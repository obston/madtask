import Link from "next/link";

export default function AdminIndex() {
  const Card = ({ href, title, children }: any) => (
    <Link href={href} className="block rounded-2xl border border-neutral-800 p-5 hover:bg-neutral-900 transition">
      <h2 className="font-medium mb-2">{title}</h2>
      <p className="text-sm text-neutral-400">{children}</p>
    </Link>
  );

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <div className="grid md:grid-cols-2 gap-4">
        <Card href="/admin/canales" title="Canales">
          WhatsApp / FB App (números, webhooks, triggers) · Email · Webchat · Otros
        </Card>
        <Card href="/admin/voice" title="Bots por llamada (Voice)">
          Proveedores, IVR, TTS/STT · Flujo de transferencia a agente humano
        </Card>
        <Card href="/admin/seguridad" title="Seguridad & Accesos">
          Roles/Permisos, audit logs
        </Card>
        <Card href="/admin/config" title="Configuración del Bot">
          Prompts, políticas, herramientas (fotos/archivos)
        </Card>
      </div>
    </main>
  );
}
