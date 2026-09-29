"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import AuthModal from "./AuthModal";
import UserMenu from "./UserMenu";

export default function AuthHeaderActions({
  oauthEnabled,
}: {
  oauthEnabled: { google: boolean; facebook: boolean };
}) {
  const [authOpen, setAuthOpen] = useState(false);
  const { status } = useSession();
  return (
    <>
      {status === "loading" && <div className="h-9 w-9 animate-pulse rounded-full bg-[#2A2421]" />}
      {status === "unauthenticated" && <UserMenu onLogin={() => setAuthOpen(true)} />}
      {status === "authenticated" && <UserMenu />}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} oauthEnabled={oauthEnabled} />
    </>
  );
}
