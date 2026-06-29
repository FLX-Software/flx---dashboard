import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/lib/auth/get-user";

export async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <Sidebar userEmail={user?.email} />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
