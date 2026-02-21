"use client";

import { Inbox, CalendarDays, ListTodo, FolderOpen, Archive } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SidebarFilter = "inbox" | "today" | "all" | "archived";

interface AppSidebarProps {
  activeFilter: SidebarFilter;
  onFilterChange: (filter: SidebarFilter) => void;
  taskCounts: { inbox: number; today: number; all: number; archived: number };
  isCollapsed: boolean;
}

const FILTERS = [
  { id: "inbox" as const, label: "Inbox", icon: Inbox },
  { id: "today" as const, label: "Today", icon: CalendarDays },
  { id: "all" as const, label: "All Tasks", icon: ListTodo },
  { id: "archived" as const, label: "Archived", icon: Archive },
];

export function AppSidebar({
  activeFilter,
  onFilterChange,
  taskCounts,
  isCollapsed,
}: AppSidebarProps) {
  if (isCollapsed) return null;

  return (
    <div className="w-[200px] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
      <ScrollArea className="flex-1 py-2">
        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1">
            Filters
          </p>
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors",
                activeFilter === filter.id
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <filter.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{filter.label}</span>
              <span className="text-[11px] opacity-60">
                {taskCounts[filter.id]}
              </span>
            </button>
          ))}
        </div>

        <Separator className="my-2 bg-sidebar-border" />

        <div className="px-3 py-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-2 mb-1">
            Projects
          </p>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
            <FolderOpen className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">Personal</span>
          </button>
        </div>
      </ScrollArea>
    </div>
  );
}
