import Link from "next/link";
import { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/upload", label: "Upload", icon: "↑" },
  { href: "/chat", label: "Ask AI", icon: "?" },
  { href: "/notes", label: "Saved Notes", icon: "□" },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-[240px_1fr]">
        <aside className="border-r border-black bg-black p-6 text-white">
          <div className="mb-8 space-y-2">
            <p className="title-font text-lg font-bold uppercase tracking-[0.12em]">
              ScholarMind
            </p>
            <p className="text-xs uppercase tracking-[0.1em] text-[#800080]">
              Student Workspace
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 border border-white px-3 py-2 text-sm"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center border border-white text-xs">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <section className="p-5 md:p-8">{children}</section>
      </div>
    </main>
  );
}