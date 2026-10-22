"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./sections/Header";

export default function SiteChrome({
  children,
  footer,
  oauthEnabled,
}: {
  children: ReactNode;
  footer: ReactNode;
  oauthEnabled: { google: boolean; facebook: boolean };
}) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  return (
    <>
      {!isAdmin && <Header oauthEnabled={oauthEnabled} />}
      <main id="main-content" tabIndex={-1} className={isAdmin ? "" : "pt-20"}>
        {children}
      </main>
      {!isAdmin && footer}
    </>
  );
}
