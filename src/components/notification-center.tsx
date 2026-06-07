"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
}

export function NotificationCenter() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      const json = await res.json();
      return json.data as { notifications: Notification[]; unreadCount: number };
    },
    refetchInterval: 60000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.notifications ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-72">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
          ) : (
            notifications.map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 p-3 cursor-default"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex items-start justify-between w-full gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => markRead.mutate(n.id)}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
