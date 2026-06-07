import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export function AppShell({
  children,
  breadcrumbs,
}: {
  children: React.ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
