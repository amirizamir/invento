"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Search,
  Moon,
  Sun,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ROLE_LABELS } from "@/lib/rbac";
import { NotificationCenter } from "@/components/notification-center";
import { CommandPalette } from "@/components/command-palette";
import { useState } from "react";

interface TopbarProps {
  breadcrumbs?: { label: string; href?: string }[];
}

export function Topbar({ breadcrumbs }: TopbarProps) {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-4 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span>/</span>}
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-foreground transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="hidden md:flex items-center gap-2 text-muted-foreground w-64 justify-start"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
            <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <NotificationCenter />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {session?.user?.name ? getInitials(session.user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {session?.user?.role ? ROLE_LABELS[session.user.role] : ""}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
