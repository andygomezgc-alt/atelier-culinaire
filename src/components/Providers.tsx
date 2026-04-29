"use client";
import { SessionProvider } from "next-auth/react";
import { LangProvider } from "./LangProvider";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LangProvider>
        <ToastProvider>{children}</ToastProvider>
      </LangProvider>
    </SessionProvider>
  );
}
