"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_DISCLAIMER } from "@/lib/constants";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/instruments", label: "Instruments" },
  { href: "/simulateur", label: "Simulateur" },
  { href: "/comparer", label: "Comparer" },
  { href: "/marche", label: "Marché" },
  { href: "/a-propos", label: "À propos" },
];

/** Wordmark géométrique original (pas un logo officiel). */
function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-md bg-mark-awb text-white shadow-sm ${className}`}
      aria-hidden
    >
      <span className="text-[11px] font-black tracking-tighter">AW</span>
    </div>
  );
}

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
    <div className="flex min-h-screen flex-col bg-bank-50 text-bank-900">
      {/* Utility bar */}
      <div className="bg-brand-bar text-[11px] text-brand-light/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1.5 sm:px-6">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-medium tracking-wide text-brand-light">
              attijariwafa bank
            </span>
            <span className="opacity-40">·</span>
            <span className="italic opacity-80">Croire en vous</span>
            <span className="opacity-40">·</span>
            <span className="text-brand-light/60">Espace client</span>
          </div>
          {user && (
            <div className="hidden text-right sm:block">
              <span className="text-brand-light/90">{user.name}</span>
              <span className="mx-1.5 opacity-40">·</span>
              <span className="opacity-70">{user.company}</span>
            </div>
          )}
        </div>
      </div>

      {/* Primary header */}
      <header className="bg-brand-ink text-brand-light">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <BrandMark />
            <div>
              <div className="text-sm font-semibold tracking-tight text-brand-light">
                Attijari Marchés
                <span className="font-normal text-brand-light/60">
                  {" "}
                  · Couverture de change
                </span>
              </div>
              <div className="text-[11px] text-brand-light/50">
                Desk commercial FX — clients corporate
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/simulateur"
              className="hidden rounded-md border-2 border-brand-orange px-3 py-1.5 text-xs font-semibold text-brand-orange transition hover:bg-brand-orange hover:text-brand-bar sm:inline-flex"
            >
              Simulateur
            </Link>
            <button
              onClick={logout}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs text-brand-light/80 transition hover:border-brand-red hover:text-brand-red"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* Secondary nav tier */}
        <nav className="border-t border-white/10 bg-brand-ink/95">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
            {NAV.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-brand-orange/20 font-semibold text-brand-orange"
                      : "text-brand-light/70 hover:bg-white/5 hover:text-brand-light"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>

      <footer className="border-t border-bank-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
          <div>
            <div className="flex items-center gap-2">
              <BrandMark className="h-8 w-8" />
              <div>
                <div className="text-sm font-semibold text-bank-900">
                  Attijari Marchés
                </div>
                <div className="text-[11px] italic text-bank-500">
                  Croire en vous
                </div>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-bank-500">
              Portail client — Couverture de change. Desk commercial FX,
              clients corporate.
            </p>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-bank-400">
              Espace client
            </div>
            <ul className="mt-2 space-y-1 text-sm text-bank-600">
              <li>
                <Link href="/simulateur" className="hover:text-brand-red">
                  Simulateur
                </Link>
              </li>
              <li>
                <Link href="/instruments" className="hover:text-brand-red">
                  Instruments
                </Link>
              </li>
              <li>
                <Link href="/marche" className="hover:text-brand-red">
                  Marché
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-bank-400">
              Confidentialité
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-bank-600">
              {DEMO_DISCLAIMER}
            </p>
            <Link
              href="/a-propos"
              className="mt-2 inline-block text-xs font-medium text-brand-red hover:underline"
            >
              À propos →
            </Link>
          </div>
        </div>
        <div className="border-t border-bank-100 bg-brand-bar py-3 text-center text-[10px] text-brand-light/50">
          Couverture FX — Desk Commercial · Accès réservé · EUR/MAD &amp;
          USD/MAD
        </div>
      </footer>
    </div>
  );
}
