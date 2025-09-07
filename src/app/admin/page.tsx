export default async function AdminPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
          <div className="font-medium">Canales</div>
          <div className="text-sm opacity-80">
            • WhatsApp / FB App (números, webhooks, triggers)<br/>
            • Email / Webchat / Otros
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
          <div className="font-medium">Bots por llamada (Voice)</div>
          <div className="text-sm opacity-80">
            • Proveedores, IVR, TTS/STT<br/>
            • Flujo de transferencia a agente humano
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
          <div className="font-medium">Seguridad & Accesos</div>
          <div className="text-sm opacity-80">
            • Roles/Permisos, audit logs
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 p-4 space-y-2">
          <div className="font-medium">Configuración del Bot</div>
          <div className="text-sm opacity-80">
            • Prompts, políticas, herramientas (fotos/archivos)
          </div>
        </div>
      </div>
    </div>
  );
}
