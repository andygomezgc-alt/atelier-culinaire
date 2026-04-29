import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <AppShell
      user={{
        id: user.id, name: user.name, role: user.role,
        initials: user.initials, photoUrl: user.photoUrl, lang: user.lang,
      }}
    >
      {children}
    </AppShell>
  );
}
