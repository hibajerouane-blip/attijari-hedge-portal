"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_DISCLAIMER } from "@/lib/constants";

const NAV = [
  { href: "/", label: "Tableau de bord" },
  { href: "/instruments", label: "Instruments" },
  { href: "/simulateur", label: "Simulateur" },
  { href: "/comparer", label: "Comparer" },
  { href: "/marche", label: "Marché" },
  { href: "/a-propos", label: "À propos" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; company: string } | null>(
    null
  );

  useEffect(() => {
    if (pathname === "/login") return;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUser({ name: d.name, company: d.company }))
      .catch(() => {});
  }, [pathname]);

  if (pathname === "/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen flex-col bg-bank-50 text-bank-950">
      <header className="border-b border-bank-200/80 bg-bank-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-accent/90 text-sm font-bold tracking-tight">
              HD
            </div>
            <div>
              <div className="text-sm font-semibold tracking-wide">
                HedgeDesk Demo
              </div>
              <div className="text-[11px] text-bank-300">
                Couverture FX — Démo Stage
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-bank-200 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden text-right text-xs sm:block">
                <div className="font-medium text-white">{user.name}</div>
                <div className="text-bank-300">{user.company}</div>
              </div>
            )}
            <button
              onClick={logout}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-bank-100 hover:bg-white/10"
            >
              Déconnexion
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 lg:hidden">
          {NAV.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-md px-3 py-1 text-xs ${
                  active ? "bg-white/15 text-white" : "text-bank-300"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t border-bank-200 bg-white/70 py-5">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 text-center text-[11px] text-bank-500 sm:px-6">
          <p className="font-medium text-bank-700">{DEMO_DISCLAIMER}</p>
          <p>
            HedgeDesk Demo ·{" "}
            <Link href="/a-propos" className="text-teal-accent hover:underline">
              À propos
            </Link>{" "}
            · EUR/MAD &amp; USD/MAD
          </p>
        </div>
      </footer>
    </div>
  );
}
