"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/upload", label: "Upload", icon: "↑" },
  { href: "/chat", label: "Ask AI", icon: "?" },
  { href: "/notes", label: "Saved Notes", icon: "□" },
];

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-black">
      <div className="mx-auto min-h-screen max-w-7xl lg:grid lg:grid-cols-[240px_1fr]">
        <header className="flex items-center justify-between border-b border-black p-4 lg:hidden">
          <p className="title-font text-base font-bold uppercase tracking-[0.12em]">
            ScholarMind
          </p>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="border border-black px-3 py-2 text-sm"
            aria-label="Toggle menu"
          >
            Menu
          </button>
        </header>

        {menuOpen ? (
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-30 bg-black lg:hidden"
            onClick={() => setMenuOpen(false)}
          />
        ) : null}

        <aside
          className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-black bg-black p-6 text-white transition-transform lg:static lg:w-auto lg:translate-x-0 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-8 space-y-2">
            <p className="title-font text-lg font-bold uppercase tracking-[0.12em]">
              ScholarMind
            </p>
            <p className="text-xs uppercase tracking-[0.1em] text-[#800080]">
              Student Workspace
            </p>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 border px-3 py-2 text-sm ${
                    isActive
                      ? "border-[#800080] bg-[#800080] text-white"
                      : "border-white"
                  }`}
                >
                  <span className="inline-flex h-5 w-5 items-center justify-center border border-white text-xs">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <section className="p-4 sm:p-6 md:p-8">{children}</section>
      </div>
    </main>
  );
}