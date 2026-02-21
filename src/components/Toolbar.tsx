"use client";

import { Search, Plus, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { TaskPriority, TaskStatus } from "@/lib/types";

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewTask: () => void;
  onFilterPriority?: (priority: TaskPriority | null) => void;
  onFilterStatus?: (status: TaskStatus | null) => void;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  onNewTask,
  onFilterPriority,
  onFilterStatus,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-[#303030] shrink-0">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="pl-8 h-7 text-[13px] bg-input border-border"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 px-2 text-muted-foreground hover:text-foreground">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="menu-shadow bg-popover border-border" align="end">
          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Priority</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onFilterPriority?.(null)}>All Priorities</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterPriority?.("critical")}>Critical</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterPriority?.("high")}>High</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterPriority?.("medium")}>Medium</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterPriority?.("low")}>Low</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-[11px] text-muted-foreground">Status</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onFilterStatus?.(null)}>All Statuses</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterStatus?.("todo")}>Todo</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterStatus?.("in_progress")}>In Progress</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFilterStatus?.("done")}>Done</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button onClick={onNewTask} size="sm" className="h-7 gap-1.5 text-[13px] bg-primary text-primary-foreground hover:bg-primary/90">
        <Plus className="w-3.5 h-3.5" />
        New Task
      </Button>
    </div>
  );
}
