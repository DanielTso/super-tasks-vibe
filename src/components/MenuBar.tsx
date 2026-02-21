"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";

function useClockDisplay() {
  const [time, setTime] = useState("");

  useEffect(() => {
    function formatTime() {
      return new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }

    setTime(formatTime());
    const interval = setInterval(() => setTime(formatTime()), 60_000);
    return () => clearInterval(interval);
  }, []);

  return time;
}

interface MenuBarProps {
  onNewTask?: () => void;
  onToggleSidebar?: () => void;
}

export function MenuBar({ onNewTask, onToggleSidebar }: MenuBarProps) {
  const clock = useClockDisplay();

  return (
    <header className="h-[22px] flex items-center px-4 mojave-glass border-b border-[rgba(0,0,0,0.3)] text-[13px] font-normal select-none shrink-0 z-50">
      <div className="flex items-center gap-0.5">
        <span className="font-bold px-2 py-0.5 text-foreground"></span>
        <span className="font-semibold px-2 py-0.5 text-foreground">Super-Task</span>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-0.5 hover:bg-white/10 rounded text-foreground outline-none">
              File
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="menu-shadow bg-popover border-border min-w-[200px]" align="start">
            <DropdownMenuItem onClick={onNewTask}>
              New Task
              <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Close Window</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-0.5 hover:bg-white/10 rounded text-foreground outline-none">
              Edit
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="menu-shadow bg-popover border-border min-w-[200px]" align="start">
            <DropdownMenuItem disabled>Undo</DropdownMenuItem>
            <DropdownMenuItem disabled>Redo</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="px-2 py-0.5 hover:bg-white/10 rounded text-foreground outline-none">
              View
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="menu-shadow bg-popover border-border min-w-[200px]" align="start">
            <DropdownMenuItem onClick={onToggleSidebar}>
              Toggle Sidebar
              <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {["Go", "Window", "Help"].map((item) => (
          <DropdownMenu key={item}>
            <DropdownMenuTrigger asChild>
              <button className="px-2 py-0.5 hover:bg-white/10 rounded text-foreground outline-none">
                {item}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="menu-shadow bg-popover border-border min-w-[160px]" align="start">
              <DropdownMenuItem disabled>No actions available</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <span className="text-foreground/60">{clock}</span>
      </div>
    </header>
  );
}
