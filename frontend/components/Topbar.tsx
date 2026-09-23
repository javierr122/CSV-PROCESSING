"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { IconLayoutDashboard, IconList, IconLogoMark, IconPlus } from "./icons";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: IconLayoutDashboard },
  { href: "/uploads", label: "Uploads", icon: IconList },
];

export function Topbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/40 bg-white/70 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group relative flex items-center gap-2.5">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 via-brand-600 to-blue-700 text-white shadow-lg shadow-brand-500/40 ring-2 ring-white/60 transition-transform duration-200 group-hover:scale-105 group-hover:rotate-3">
            <IconLogoMark className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
            </span>
          </span>
          <div className="leading-tight">
            <p className="bg-gradient-to-r from-brand-700 to-brand-500 bg-clip-text text-sm font-bold text-transparent">
              CSV-PROCESING
            </p>
            <p className="text-[11px] text-gray-500">CarbonBox</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-brand-600 to-blue-500 text-white shadow-md shadow-brand-500/30"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
          <Link href="/uploads/new" className="ml-1">
            <Button size="sm">
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Subir archivo</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
