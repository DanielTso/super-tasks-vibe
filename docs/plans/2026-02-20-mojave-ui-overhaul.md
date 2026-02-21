# macOS Mojave UI Overhaul — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Super-Task Vibe from a shallow macOS-inspired prototype into a polished, functional macOS Mojave dark-mode task manager with shadcn/ui, sidebar navigation, task detail panel, search, and functional desktop chrome.

**Architecture:** Hybrid layout — macOS desktop chrome (menu bar + dock) wrapping a non-draggable app window with sidebar + kanban content area. shadcn/ui provides all base UI primitives. Mojave dark mode colors replace the current glass aesthetic. Existing DnD logic and server actions are preserved.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4 beta, shadcn/ui (latest, Tailwind v4 compatible), @dnd-kit, framer-motion, lucide-react, sonner

**Design doc:** `docs/plans/2026-02-20-mojave-ui-overhaul-design.md`

---

### Task 1: Install shadcn/ui and dependencies

**Files:**
- Modify: `package.json`
- Create: `src/lib/utils.ts`
- Create: `src/components/ui/` (shadcn components directory — auto-created by CLI)
- Modify: `src/styles/globals.css`

**Step 1: Install shadcn/ui prerequisites**

```bash
npm install class-variance-authority clsx tailwind-merge tw-animate-css sonner
```

**Step 2: Initialize shadcn/ui**

```bash
npx shadcn@latest init
```

When prompted:
- Style: Default
- Base color: Neutral
- CSS variables: Yes
- CSS file: `src/styles/globals.css`
- Tailwind config: (skip — Tailwind v4 beta, CSS-only)
- Components alias: `@/components`
- Utils alias: `@/lib/utils`
- React Server Components: Yes

If the CLI doesn't auto-detect Tailwind v4, it may need manual CSS adjustments (see Step 4).

**Step 3: Verify `src/lib/utils.ts` was created**

It should contain:

```ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

If not created, create it manually with this content.

**Step 4: Update `src/styles/globals.css` with Mojave dark theme**

After shadcn init modifies the file, update it to use Mojave dark mode tokens. The final `globals.css` should be:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  /* macOS Mojave custom tokens */
  --font-sans: "SF Pro Display", "SF Pro Text", "Inter", system-ui, -apple-system, sans-serif;
  --radius-dock: 18px;
  --color-mac-close: #ED6A5F;
  --color-mac-minimize: #F6BE50;
  --color-mac-zoom: #61C555;
  --color-mac-close-hover: #460804;
  --color-mac-minimize-hover: #90591D;
  --color-mac-zoom-hover: #2A6218;
  --color-mac-inactive: #4D4D4D;
  --color-system-blue: #0A84FF;
  --color-system-red: #FF453A;
  --color-system-orange: #FF9F0A;
  --color-system-yellow: #FFD60A;
  --color-system-green: #32D74B;
}

/* macOS Mojave Dark Mode — the only theme */
:root {
  --radius: 0.5rem;
  --background: #323232;
  --foreground: rgba(255, 255, 255, 0.85);
  --card: #2A2A2A;
  --card-foreground: rgba(255, 255, 255, 0.85);
  --popover: #282828;
  --popover-foreground: rgba(255, 255, 255, 0.85);
  --primary: #0A84FF;
  --primary-foreground: #FFFFFF;
  --secondary: #3A3A3A;
  --secondary-foreground: rgba(255, 255, 255, 0.55);
  --muted: #2A2A2A;
  --muted-foreground: rgba(255, 255, 255, 0.55);
  --accent: #3A3A3A;
  --accent-foreground: rgba(255, 255, 255, 0.85);
  --destructive: #FF453A;
  --destructive-foreground: #FFFFFF;
  --border: rgba(255, 255, 255, 0.1);
  --input: rgba(255, 255, 255, 0.07);
  --ring: #0A84FF;
  --chart-1: #0A84FF;
  --chart-2: #32D74B;
  --chart-3: #FF9F0A;
  --chart-4: #BF5AF2;
  --chart-5: #FF453A;
  --sidebar: #2D2D2D;
  --sidebar-foreground: rgba(255, 255, 255, 0.85);
  --sidebar-primary: #0A84FF;
  --sidebar-primary-foreground: #FFFFFF;
  --sidebar-accent: rgba(255, 255, 255, 0.1);
  --sidebar-accent-foreground: #FFFFFF;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-ring: #0A84FF;
}

body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  background-color: var(--background);
  color: var(--foreground);
}

/* Mojave window shadow */
.window-shadow {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.3),
    0 22px 70px 4px rgba(0, 0, 0, 0.56);
}

/* Menu/popover shadow */
.menu-shadow {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.1),
    0 10px 30px rgba(0, 0, 0, 0.5);
}

/* Glass blur for menu bar and dock */
.mojave-glass {
  background: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
}

/* macOS-style scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
```

**Step 5: Add `dark` class to html element**

Modify `src/app/layout.tsx`: change `<html lang="en" className="h-full">` to `<html lang="en" className="h-full dark">`.

This enables shadcn's `dark:` variants to work alongside our root-level dark theme.

**Step 6: Run lint and build to verify**

```bash
npm run lint && npm run build
```

Fix any errors introduced by the shadcn init process.

**Step 7: Commit**

```bash
git add -A
git commit -m "feat: install shadcn/ui with Mojave dark theme"
```

---

### Task 2: Install all required shadcn/ui components

**Files:**
- Create: Multiple files in `src/components/ui/` (auto-generated by shadcn CLI)

**Step 1: Add all shadcn components**

```bash
npx shadcn@latest add button card dialog sheet command dropdown-menu input textarea select badge separator scroll-area tooltip popover calendar skeleton
```

**Step 2: Install sonner (toast)**

```bash
npx shadcn@latest add sonner
```

**Step 3: Verify all components exist**

```bash
ls src/components/ui/
```

Expected: `button.tsx`, `card.tsx`, `dialog.tsx`, `sheet.tsx`, `command.tsx`, `dropdown-menu.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `badge.tsx`, `separator.tsx`, `scroll-area.tsx`, `tooltip.tsx`, `popover.tsx`, `calendar.tsx`, `skeleton.tsx`, `sonner.tsx`, plus any Radix dependencies auto-installed.

**Step 4: Run lint and build**

```bash
npm run lint && npm run build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shadcn/ui components for Mojave UI"
```

---

### Task 3: Rebuild Wallpaper and layout shell

Replace the Unsplash-dependent Wallpaper with a Mojave CSS gradient. Update layout.tsx to set up the new app shell structure.

**Files:**
- Modify: `src/components/Wallpaper.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Rewrite Wallpaper.tsx**

Replace the entire file with a Mojave night desert gradient:

```tsx
export function Wallpaper() {
  return (
    <div
      className="fixed inset-0 z-[-1]"
      style={{
        background:
          "linear-gradient(180deg, #081B33 0%, #152642 20%, #2F4562 40%, #353C51 55%, #506680 70%, #767D92 85%, #4A4040 100%)",
      }}
    />
  );
}
```

**Step 2: Update layout.tsx**

The layout should render: Wallpaper (behind), then children filling the viewport. MenuBar will be rendered inside `page.tsx` as part of the app shell now (to keep it client-side with functional state).

```tsx
import type { Metadata } from "next";
import { Wallpaper } from "@/components/Wallpaper";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Super-Task Vibe",
  description: "Personal macOS-inspired Task Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="h-full antialiased">
        <Wallpaper />
        {children}
      </body>
    </html>
  );
}
```

Note: Removed `Inter` font import (using SF Pro from CSS). Removed `MenuBar` from layout (it moves to page.tsx as part of the client-side app shell).

**Step 3: Verify dev server renders the gradient background**

```bash
npm run dev
```

Open http://localhost:3000 — should see the Mojave gradient with no content yet (since page.tsx still references old components).

**Step 4: Run lint**

```bash
npm run lint
```

**Step 5: Commit**

```bash
git add src/components/Wallpaper.tsx src/app/layout.tsx
git commit -m "feat: replace Unsplash wallpaper with Mojave gradient, simplify layout"
```

---

### Task 4: Rebuild Window as non-draggable app shell

Remove draggability, make Window a flex container filling the viewport between menu bar and dock. Keep traffic light buttons as decorative.

**Files:**
- Modify: `src/components/Window.tsx`

**Step 1: Rewrite Window.tsx**

```tsx
"use client";

import { ReactNode } from "react";

interface WindowProps {
  title: string;
  children: ReactNode;
}

export function Window({ title, children }: WindowProps) {
  return (
    <div className="flex flex-col rounded-[10px] window-shadow overflow-hidden bg-background border border-border">
      {/* macOS Title Bar */}
      <div className="h-[38px] flex items-center px-[13px] bg-[#3A3A3A] border-b border-[rgba(0,0,0,0.3)] select-none shrink-0">
        <div className="flex gap-[8px] w-[54px]">
          <div className="w-[12px] h-[12px] rounded-full bg-mac-close border border-[#E24B41] group/btn cursor-default relative">
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-mac-close-hover opacity-0 group-hover/btn:opacity-100 transition-opacity">x</span>
          </div>
          <div className="w-[12px] h-[12px] rounded-full bg-mac-minimize border border-[#E1A73E] group/btn cursor-default relative">
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-mac-minimize-hover opacity-0 group-hover/btn:opacity-100 transition-opacity leading-none pb-[1px]">-</span>
          </div>
          <div className="w-[12px] h-[12px] rounded-full bg-mac-zoom border border-[#2DAC2F] group/btn cursor-default relative">
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-mac-zoom-hover opacity-0 group-hover/btn:opacity-100 transition-opacity">+</span>
          </div>
        </div>

        <span className="text-[13px] font-semibold text-foreground/60 w-full text-center pr-[54px] tracking-tight">
          {title}
        </span>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/Window.tsx
git commit -m "feat: rebuild Window as non-draggable app shell with Mojave title bar"
```

---

### Task 5: Rebuild MenuBar with functional dropdowns

Replace static menu items with shadcn DropdownMenu. File menu has "New Task" action, View menu has "Toggle Sidebar".

**Files:**
- Modify: `src/components/MenuBar.tsx`

**Step 1: Rewrite MenuBar.tsx**

```tsx
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
              <DropdownMenuShortcut>Cmd+N</DropdownMenuShortcut>
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
              <DropdownMenuShortcut>Cmd+B</DropdownMenuShortcut>
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
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/MenuBar.tsx
git commit -m "feat: rebuild MenuBar with functional shadcn dropdowns"
```

---

### Task 6: Rebuild Dock with functional navigation

Add onClick handlers for dock items. The Kanban icon shows an active indicator. Mic icon toggles voice assistant.

**Files:**
- Modify: `src/components/Dock.tsx`

**Step 1: Rewrite Dock.tsx**

```tsx
"use client";

import { motion } from "framer-motion";
import { ListTodo, Mic, Settings, LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DockItem {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: "tasks", icon: ListTodo, label: "Kanban", color: "bg-orange-500" },
  { id: "voice", icon: Mic, label: "Voice", color: "bg-blue-500" },
  { id: "settings", icon: Settings, label: "Settings", color: "bg-[#636366]" },
];

interface DockProps {
  activeId?: string;
  onItemClick?: (id: string) => void;
}

export function Dock({ activeId = "tasks", onItemClick }: DockProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="shrink-0 flex justify-center py-2 z-50">
        <div className="mojave-glass px-4 pt-3 pb-1 rounded-dock flex items-end gap-3 border border-white/15">
          {DOCK_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ y: -8, scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => onItemClick?.(item.id)}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <div
                    className={`w-11 h-11 rounded-[10px] ${item.color} shadow-lg flex items-center justify-center border border-white/20 relative`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-[10px]" />
                  </div>
                  <div
                    className={`w-1 h-1 rounded-full mt-1 ${
                      activeId === item.id ? "bg-white/70" : "bg-transparent"
                    }`}
                  />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-popover border-border text-foreground text-xs menu-shadow"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/Dock.tsx
git commit -m "feat: rebuild Dock with functional navigation and tooltips"
```

---

### Task 7: Create AppSidebar component

Build the sidebar using shadcn Sidebar primitives. Contains Inbox/Today/All filters.

**Files:**
- Create: `src/components/AppSidebar.tsx`

**Step 1: Create AppSidebar.tsx**

```tsx
"use client";

import { Inbox, CalendarDays, ListTodo, FolderOpen } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type SidebarFilter = "inbox" | "today" | "all";

interface AppSidebarProps {
  activeFilter: SidebarFilter;
  onFilterChange: (filter: SidebarFilter) => void;
  taskCounts: { inbox: number; today: number; all: number };
  isCollapsed: boolean;
}

const FILTERS = [
  { id: "inbox" as const, label: "Inbox", icon: Inbox },
  { id: "today" as const, label: "Today", icon: CalendarDays },
  { id: "all" as const, label: "All Tasks", icon: ListTodo },
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
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/AppSidebar.tsx
git commit -m "feat: create AppSidebar with filter navigation"
```

---

### Task 8: Create Toolbar component with search and new task button

**Files:**
- Create: `src/components/Toolbar.tsx`

**Step 1: Create Toolbar.tsx**

```tsx
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
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/Toolbar.tsx
git commit -m "feat: create Toolbar with search, filters, and new task button"
```

---

### Task 9: Create StatusBar component

**Files:**
- Create: `src/components/StatusBar.tsx`

**Step 1: Create StatusBar.tsx**

```tsx
import type { Task } from "@/lib/types";

interface StatusBarProps {
  tasks: Task[];
}

export function StatusBar({ tasks }: StatusBarProps) {
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="h-[22px] flex items-center px-4 bg-[#2A2A2A] border-t border-border text-[11px] text-muted-foreground select-none shrink-0">
      <span>
        {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        {" \u00B7 "}
        {todo} todo
        {" \u00B7 "}
        {inProgress} in progress
        {" \u00B7 "}
        {done} done
      </span>
    </div>
  );
}
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/StatusBar.tsx
git commit -m "feat: create StatusBar with task counts"
```

---

### Task 10: Rebuild NewTaskDialog with full form fields

Replace the minimal title-only form with a full form including priority, due date, and status selectors.

**Files:**
- Modify: `src/components/kanban/NewTaskDialog.tsx`

**Step 1: Rewrite NewTaskDialog.tsx**

```tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTask } from "@/lib/actions/tasks";
import type { TaskPriority, TaskStatus } from "@/lib/types";

interface NewTaskDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: () => void;
}

export function NewTaskDialog({
  projectId,
  open,
  onOpenChange,
  onTaskCreated,
}: NewTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isPending, setIsPending] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setStatus("todo");
    setDueDate(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsPending(true);
    const result = await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
      project_id: projectId,
    });

    setIsPending(false);
    if (!result.error) {
      resetForm();
      onOpenChange(false);
      onTaskCreated?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border menu-shadow sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Title
            </label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="bg-input border-border"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
              className="bg-input border-border resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border menu-shadow">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-input border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border menu-shadow">
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dueDate
                    ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border menu-shadow" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/kanban/NewTaskDialog.tsx
git commit -m "feat: rebuild NewTaskDialog with priority, status, and date selectors"
```

---

### Task 11: Create TaskDetailSheet component

The right-side panel for viewing/editing a task. Integrates SubTaskGenerator.

**Files:**
- Create: `src/components/kanban/TaskDetailSheet.tsx`

**Step 1: Create TaskDetailSheet.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTask, deleteTask } from "@/lib/actions/tasks";
import { SubTaskGenerator } from "./SubTaskGenerator";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "bg-system-red/15 text-system-red border-system-red/30",
  high: "bg-system-orange/15 text-system-orange border-system-orange/30",
  medium: "bg-system-yellow/15 text-system-yellow border-system-yellow/30",
  low: "bg-system-green/15 text-system-green border-system-green/30",
};

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  // Sync form state when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateTask({
      id: task.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
    });
    setIsSaving(false);
    onTaskUpdated?.();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onOpenChange(false);
    onTaskDeleted?.();
  };

  const hasChanges =
    title !== task.title ||
    description !== (task.description || "") ||
    priority !== task.priority ||
    status !== task.status ||
    (dueDate?.toISOString().split("T")[0] || null) !== task.due_date;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card border-border w-[400px] sm:max-w-[400px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("text-[10px] uppercase", PRIORITY_COLORS[priority])}>
              {priority}
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border menu-shadow">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete task?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &ldquo;{task.title}&rdquo;. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <SheetTitle className="sr-only">Task Details</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none px-0 h-auto focus-visible:ring-0 text-foreground"
              placeholder="Task title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-input border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border menu-shadow">
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-input border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border menu-shadow">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border text-[13px]",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dueDate
                    ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "No due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border menu-shadow" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={5}
              className="bg-input border-border resize-none text-[13px]"
            />
          </div>

          <Separator className="bg-border" />

          <SubTaskGenerator task={task} onSubTaskCreated={onTaskUpdated} />
        </div>

        {hasChanges && (
          <div className="px-6 py-3 border-t border-border bg-card shrink-0">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
```

**Step 2: Add shadcn AlertDialog component (needed for delete confirmation)**

```bash
npx shadcn@latest add alert-dialog
```

**Step 3: Run lint**

```bash
npm run lint
```

**Step 4: Commit**

```bash
git add src/components/kanban/TaskDetailSheet.tsx src/components/ui/alert-dialog.tsx
git commit -m "feat: create TaskDetailSheet with edit form, delete confirmation, and AI subtasks"
```

---

### Task 12: Restyle KanbanCard with shadcn primitives and click-to-open

Replace inline glass styles with Mojave dark theme. Add onClick to open task detail sheet.

**Files:**
- Modify: `src/components/kanban/KanbanCard.tsx`

**Step 1: Rewrite KanbanCard.tsx**

```tsx
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/lib/types";

interface KanbanCardProps {
  task: Task;
  isOverlay?: boolean;
  onClick?: () => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "bg-system-red/15 text-system-red border-system-red/30",
  high: "bg-system-orange/15 text-system-orange border-system-orange/30",
  medium: "bg-system-yellow/15 text-system-yellow border-system-yellow/30",
  low: "bg-system-green/15 text-system-green border-system-green/30",
};

function formatDueDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

export function KanbanCard({ task, isOverlay, onClick }: KanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "Task", task },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-card/50 p-4 rounded-[8px] border border-primary/30 h-[100px]"
      />
    );
  }

  const dueDate = formatDueDate(task.due_date);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -1, scale: 1.005 }}
      onClick={onClick}
      className={cn(
        "bg-card p-3 rounded-[8px] border border-border cursor-grab active:cursor-grabbing hover:border-white/20 transition-colors",
        isOverlay && "border-primary/40 shadow-xl scale-[1.02] z-50"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge
          variant="outline"
          className={cn("text-[9px] font-bold uppercase tracking-wider", PRIORITY_COLORS[task.priority])}
        >
          {task.priority}
        </Badge>
      </div>

      <h3 className="text-[13px] font-semibold text-foreground leading-tight mb-1">
        {task.title}
      </h3>

      {task.description && (
        <p className="text-[11px] text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {dueDate && (
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarDays className="w-3 h-3" />
          <span className="text-[11px]">{dueDate}</span>
        </div>
      )}
    </motion.div>
  );
}
```

Note: Removed the inline delete dropdown (delete is now in TaskDetailSheet). Removed `onTaskDeleted` prop — deletion happens through the detail sheet. Added `onClick` prop for opening detail.

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/kanban/KanbanCard.tsx
git commit -m "feat: restyle KanbanCard with Mojave theme, add click-to-open"
```

---

### Task 13: Restyle KanbanColumn with Mojave theme and empty state

**Files:**
- Modify: `src/components/kanban/KanbanColumn.tsx`

**Step 1: Rewrite KanbanColumn.tsx**

```tsx
"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { KanbanCard } from "./KanbanCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

interface KanbanColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ id, title, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full rounded-[8px] p-3 border transition-colors",
        isOver
          ? "border-primary/30 bg-primary/5"
          : "border-transparent bg-black/10"
      )}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            {title}
          </h2>
          <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-muted-foreground font-medium">
            {tasks.length}
          </span>
        </div>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-2">
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-[11px] text-muted-foreground/50">
                No tasks
              </div>
            ) : (
              tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick?.(task)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </SortableContext>
    </div>
  );
}
```

Note: Removed `onTaskDeleted` prop (handled in TaskDetailSheet). Added `onTaskClick` prop to pass up card clicks. Added empty state.

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/kanban/KanbanColumn.tsx
git commit -m "feat: restyle KanbanColumn with Mojave theme and empty state"
```

---

### Task 14: Update KanbanBoard to pass onTaskClick through

**Files:**
- Modify: `src/components/kanban/KanbanBoard.tsx`

**Step 1: Update KanbanBoard.tsx**

Add `onTaskClick` prop and pass it through to KanbanColumn. Remove `onTaskDeleted` prop (no longer needed). Clean up unused `arrayMove` import.

Changes to make:

1. Update interface:
```tsx
interface KanbanBoardProps {
  tasks: Task[];
  refreshTasks: () => Promise<void>;
  onTaskClick?: (task: Task) => void;
}
```

2. Update function signature:
```tsx
export function KanbanBoard({ tasks, refreshTasks, onTaskClick }: KanbanBoardProps) {
```

3. Remove `arrayMove` import (unused).

4. In the KanbanColumn render, replace `onTaskDeleted={onTaskDeleted}` with `onTaskClick={onTaskClick}`:
```tsx
<KanbanColumn
  id={col.id}
  title={col.title}
  tasks={getTasksByStatus(col.id).sort((a, b) => a.position - b.position)}
  onTaskClick={onTaskClick}
/>
```

5. Update DragOverlay to remove `isOverlay` only usage — keep `<KanbanCard task={activeTask} isOverlay />` (no onClick needed for overlay).

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/kanban/KanbanBoard.tsx
git commit -m "refactor: update KanbanBoard to pass onTaskClick, remove unused imports"
```

---

### Task 15: Restyle SubTaskGenerator with shadcn primitives

Update the existing SubTaskGenerator to use shadcn Button and Badge. Remove old glass classes.

**Files:**
- Modify: `src/components/kanban/SubTaskGenerator.tsx`

**Step 1: Update SubTaskGenerator.tsx**

Replace inline styled buttons with shadcn `Button`, priority badges with `Badge`. Replace `glass` classes with `bg-card` / `border-border`. Keep the overall structure and logic unchanged.

Key class replacements:
- `glass p-3 rounded-lg border border-white/5` → `bg-muted p-3 rounded-[6px] border border-border`
- Button styling → `<Button variant="outline" size="sm">`
- Priority colors → Use `PRIORITY_COLORS` map with system colors like KanbanCard
- Error banner → `bg-destructive/10 border-destructive/20 text-destructive`
- Text colors: `text-white/80` → `text-foreground`, `text-white/40` → `text-muted-foreground`, `text-white/30` → `text-muted-foreground/60`

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/kanban/SubTaskGenerator.tsx
git commit -m "feat: restyle SubTaskGenerator with shadcn primitives"
```

---

### Task 16: Rebuild page.tsx — the main app shell

Wire everything together: MenuBar, Window with sidebar + toolbar + kanban + status bar, Dock, VoiceAssistant, TaskDetailSheet, NewTaskDialog. This is the integration task.

**Files:**
- Modify: `src/app/page.tsx`

**Step 1: Rewrite page.tsx**

```tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { Toaster, toast } from "sonner";
import { MenuBar } from "@/components/MenuBar";
import { Window } from "@/components/Window";
import { Dock } from "@/components/Dock";
import { AppSidebar, SidebarFilter } from "@/components/AppSidebar";
import { Toolbar } from "@/components/Toolbar";
import { StatusBar } from "@/components/StatusBar";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { NewTaskDialog } from "@/components/kanban/NewTaskDialog";
import { TaskDetailSheet } from "@/components/kanban/TaskDetailSheet";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { useRealtimeTasks } from "@/hooks/useRealtimeTasks";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

const PROJECT_ID = "00000000-0000-0000-0000-000000000000";

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const today = new Date().toISOString().split("T")[0];
  return dateStr === today;
}

export default function Home() {
  const { tasks, refreshTasks, isLoading } = useRealtimeTasks(PROJECT_ID);

  // UI state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilter>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | null>(null);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  // Sidebar filter counts
  const taskCounts = useMemo(() => ({
    inbox: tasks.length,
    today: tasks.filter((t) => isToday(t.due_date)).length,
    all: tasks.length,
  }), [tasks]);

  // Apply all filters
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Sidebar filter
    if (sidebarFilter === "today") {
      result = result.filter((t) => isToday(t.due_date));
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Priority filter
    if (filterPriority) {
      result = result.filter((t) => t.priority === filterPriority);
    }

    // Status filter
    if (filterStatus) {
      result = result.filter((t) => t.status === filterStatus);
    }

    return result;
  }, [tasks, sidebarFilter, searchQuery, filterPriority, filterStatus]);

  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setDetailOpen(true);
  }, []);

  const handleTaskCreated = useCallback(() => {
    refreshTasks();
    toast.success("Task created");
  }, [refreshTasks]);

  const handleTaskUpdated = useCallback(() => {
    refreshTasks();
    toast.success("Task updated");
  }, [refreshTasks]);

  const handleTaskDeleted = useCallback(() => {
    refreshTasks();
    toast.success("Task deleted");
  }, [refreshTasks]);

  const handleDockClick = useCallback((id: string) => {
    if (id === "voice") {
      setVoiceOpen((prev) => !prev);
    }
  }, []);

  // Keyboard shortcuts
  // Cmd+N for new task, Cmd+B for sidebar toggle
  // Note: These are registered via useEffect in a production app,
  // but for simplicity the menu bar callbacks handle it.

  return (
    <div className="h-screen flex flex-col">
      <MenuBar
        onNewTask={() => setNewTaskOpen(true)}
        onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col p-3 pb-0 overflow-hidden">
        <Window title="Super-Task Vibe">
          <div className="flex h-full">
            <AppSidebar
              activeFilter={sidebarFilter}
              onFilterChange={setSidebarFilter}
              taskCounts={taskCounts}
              isCollapsed={sidebarCollapsed}
            />

            <div className="flex-1 flex flex-col min-w-0">
              <Toolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onNewTask={() => setNewTaskOpen(true)}
                onFilterPriority={setFilterPriority}
                onFilterStatus={setFilterStatus}
              />

              <div className="flex-1 overflow-hidden p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-[13px]">
                    Loading tasks...
                  </div>
                ) : (
                  <KanbanBoard
                    tasks={filteredTasks}
                    refreshTasks={refreshTasks}
                    onTaskClick={handleTaskClick}
                  />
                )}
              </div>

              <StatusBar tasks={filteredTasks} />
            </div>
          </div>
        </Window>
      </div>

      <Dock activeId="tasks" onItemClick={handleDockClick} />

      {voiceOpen && <VoiceAssistant />}

      <NewTaskDialog
        projectId={PROJECT_ID}
        open={newTaskOpen}
        onOpenChange={setNewTaskOpen}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailSheet
        task={selectedTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
      />

      <Toaster
        position="bottom-right"
        toastOptions={{
          className: "bg-card border-border text-foreground",
        }}
      />
    </div>
  );
}
```

**Step 2: Update VoiceAssistant for standalone rendering**

Since VoiceAssistant is now conditionally rendered (not always present), simplify it to just the panel without the toggle button (dock handles the toggle). Remove the `isOpen` state and always render the panel when mounted. Remove the floating button.

Modify `src/components/VoiceAssistant.tsx`: Remove the toggle button, just render the panel. The parent controls mount/unmount.

**Step 3: Delete old Skeleton.tsx**

```bash
rm src/components/ui/Skeleton.tsx
```

The shadcn skeleton component replaces it.

**Step 4: Run lint and build**

```bash
npm run lint && npm run build
```

**Step 5: Commit**

```bash
git add -A
git commit -m "feat: rebuild page.tsx with full Mojave app shell integration"
```

---

### Task 17: Update VoiceAssistant for panel-only rendering

Simplify VoiceAssistant to render as a standalone panel (no toggle button, parent handles show/hide).

**Files:**
- Modify: `src/components/VoiceAssistant.tsx`

**Step 1: Rewrite VoiceAssistant.tsx**

```tsx
"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";

interface VoiceAssistantProps {
  onClose?: () => void;
}

export function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [lastTranscript, setLastTranscript] = useState("");
  const { speak, isPlaying } = useVoiceOutput();

  const { isListening, startListening, stopListening } = useVoiceInput(
    (transcript) => {
      setLastTranscript(transcript);
      speak(`I heard you say: ${transcript}. I'm on it!`);
    }
  );

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-16 right-4 z-[70] w-72 bg-card rounded-[10px] p-5 border border-border menu-shadow"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Voice Assistant
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          animate={isListening ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
            isListening
              ? "bg-destructive/15 text-destructive border-destructive/40"
              : "bg-muted text-foreground border-border"
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </motion.button>

        <div className="text-center">
          <p className="text-[11px] text-muted-foreground mb-1">
            {isListening ? "Listening..." : isPlaying ? "Speaking..." : "Tap to speak"}
          </p>
          <p className="text-[13px] text-foreground font-medium italic min-h-[20px]">
            {lastTranscript ? `"${lastTranscript}"` : "How can I help?"}
          </p>
        </div>

        {isPlaying && (
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [6, 20, 6] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                className="w-0.5 bg-primary rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

**Step 2: Run lint**

```bash
npm run lint
```

**Step 3: Commit**

```bash
git add src/components/VoiceAssistant.tsx
git commit -m "feat: simplify VoiceAssistant to panel-only rendering"
```

---

### Task 18: Add keyboard shortcuts

Add Cmd+N (new task) and Cmd+B (toggle sidebar) keyboard shortcuts.

**Files:**
- Create: `src/hooks/useKeyboardShortcuts.ts`
- Modify: `src/app/page.tsx` (add hook call)

**Step 1: Create useKeyboardShortcuts.ts**

```ts
"use client";

import { useEffect } from "react";

interface Shortcuts {
  onNewTask?: () => void;
  onToggleSidebar?: () => void;
}

export function useKeyboardShortcuts({ onNewTask, onToggleSidebar }: Shortcuts) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key === "n") {
        e.preventDefault();
        onNewTask?.();
      } else if (e.key === "b") {
        e.preventDefault();
        onToggleSidebar?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewTask, onToggleSidebar]);
}
```

**Step 2: Add to page.tsx**

Import and call in the Home component:

```tsx
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

// Inside Home():
useKeyboardShortcuts({
  onNewTask: () => setNewTaskOpen(true),
  onToggleSidebar: () => setSidebarCollapsed((prev) => !prev),
});
```

**Step 3: Run lint**

```bash
npm run lint
```

**Step 4: Commit**

```bash
git add src/hooks/useKeyboardShortcuts.ts src/app/page.tsx
git commit -m "feat: add Cmd+N and Cmd+B keyboard shortcuts"
```

---

### Task 19: Full build verification and cleanup

Run lint, type-check, and build. Fix any issues. Remove leftover old CSS classes and unused code.

**Files:**
- Potentially modify: any file with lint/type errors

**Step 1: Run lint**

```bash
npm run lint
```

Fix any reported issues.

**Step 2: Run type-check**

```bash
npx tsc --noEmit
```

Fix any TypeScript errors.

**Step 3: Run production build**

```bash
npm run build
```

Fix any build errors.

**Step 4: Manual smoke test**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Mojave gradient wallpaper renders
- Menu bar with working File > New Task dropdown
- Window with title bar and traffic lights
- Sidebar with Inbox/Today/All filters
- Toolbar with search, filter dropdown, New Task button
- Kanban board with 3 columns
- Cards are clickable → detail sheet opens from right
- Detail sheet allows editing all fields
- SubTaskGenerator appears in detail sheet
- Dock at bottom with active indicator
- Status bar with task counts
- Cmd+N opens new task dialog
- Cmd+B toggles sidebar
- Toast notifications on create/update/delete

**Step 5: Commit any remaining fixes**

```bash
git add -A
git commit -m "fix: resolve lint, type, and build issues from UI overhaul"
```

---

### Task 20: Update CLAUDE.md with new architecture

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Update the CLAUDE.md**

Key updates:
- Add shadcn/ui to tech stack
- Update key directories to include new components (AppSidebar, Toolbar, StatusBar, TaskDetailSheet)
- Update component patterns section (shadcn primitives, `cn()` utility now exists)
- Note Mojave dark theme in styling conventions
- Update the styling section (shadcn CSS variables, Mojave tokens in globals.css)
- Remove references to old glass classes

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update CLAUDE.md for Mojave UI overhaul"
```
