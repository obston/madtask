import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "MadTask Dashboard",
  description: "MVP dashboard con mocks",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">
        <div className="grid min-h-screen grid-cols-[240px_1fr]">
          <aside className="bg-neutral-900 border-r border-neutral-800">
            <Sidebar />
          </aside>
          <main className="p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
