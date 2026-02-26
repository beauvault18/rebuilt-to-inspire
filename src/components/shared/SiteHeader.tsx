"use client";

import Link from "next/link";

export default function SiteHeader() {
  return (
    <header className="px-8 py-5 border-b border-border">
      <Link
        href="/dashboard"
        className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
      >
        Rebuilt To Inspire
      </Link>
    </header>
  );
}
