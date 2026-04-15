"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { THEME } from "@/lib/theme";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
  target?: string;
  icon?: React.ReactNode;
};

type TopBarProps = {
  navItems?: NavItem[];
  right?: React.ReactNode;
};

export default function TopBar({ navItems = [], right }: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`${THEME.topbar.bg} ${THEME.topbar.text} px-4 relative print:hidden`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14">
        {/* Logo + title */}
        <div className="flex items-center gap-3">
          <div className={THEME.topbar.logoWrap}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/rtcg-logo.png" alt="RTCG" className="h-7 object-contain" />
          </div>
          <span className="font-bold text-sm tracking-wide hidden sm:block">BROADCAST IT SISTEMI</span>
          <span className="font-bold text-sm tracking-wide sm:hidden">BIT</span>
        </div>

        {/* Desktop nav */}
        {navItems.length > 0 && (
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.target}
                className={`${item.active ? THEME.topbar.navLinkActive : THEME.topbar.navLink} flex items-center gap-1`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {right && (
              <>
                <div className={`${THEME.topbar.divider} mx-2`} />
                {right}
              </>
            )}
          </nav>
        )}

        {/* Right slot (desktop, no nav) */}
        {navItems.length === 0 && right && (
          <div className="hidden md:block">{right}</div>
        )}

        {/* Mobile: right slot + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          {navItems.length === 0 && right}
          {navItems.length > 0 && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="p-2 rounded-md text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Meni"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && navItems.length > 0 && (
        <div className="md:hidden absolute top-14 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target={item.target}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-5 py-3 text-sm border-b border-slate-700/50 transition-colors ${
                item.active
                  ? "text-white bg-slate-700"
                  : "text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          {right && (
            <div className="px-5 py-3">
              {right}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
