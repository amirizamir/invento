"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Server,
  FileBarChart,
  Upload,
  Users,
  ScrollText,
  Bell,
  ChevronLeft,
  ChevronRight,
  HardDrive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Role } from "@prisma/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vms", label: "VM Inventory", icon: Server },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/imports", label: "Imports", icon: Upload, roles: ["ADMIN", "OPERATOR"] as Role[] },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/users", label: "Users", icon: Users, roles: ["ADMIN"] as Role[] },
  { href: "/audit-logs", label: "Audit Logs", icon: ScrollText, roles: ["ADMIN"] as Role[] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const filteredNav = navItems.filter((item) => {
    if (!item.roles) return true;
    return session?.user?.role && item.roles.includes(session.user.role);
  });

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <HardDrive className="h-6 w-6 shrink-0 text-sidebar-primary" />
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="font-semibold text-lg truncate">AHG</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">VM Inventory</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center text-sidebar-foreground/80"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
