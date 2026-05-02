"use client";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({
  children,
  restaurantId,
  restaurantName,
  userInitials,
}: {
  children: React.ReactNode;
  restaurantId: string;
  restaurantName: string;
  userInitials: string;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Topbar restaurantId={restaurantId} restaurantName={restaurantName} userInitials={userInitials} />
      <main className="md:ml-[200px] pt-14 min-h-screen">
        <div className="px-s-6 py-s-6">{children}</div>
      </main>
    </div>
  );
}
