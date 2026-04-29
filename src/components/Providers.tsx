"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { LangProvider } from "./LangProvider";
import { ToastProvider } from "./Toast";
import { useMemo } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <LangProvider>
          <ToastProvider>{children}</ToastProvider>
        </LangProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
