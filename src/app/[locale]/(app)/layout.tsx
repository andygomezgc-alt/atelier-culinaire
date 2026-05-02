import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/${params.locale}/login`);
  }

  const userName = session.user.name ?? session.user.email ?? "U";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppShell
      restaurantId="default"
      restaurantName="Mi Restaurante"
      userInitials={userInitials}
    >
      {children}
    </AppShell>
  );
}
