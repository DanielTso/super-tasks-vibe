# macOS Mojave UI Overhaul — Design Document

## Overview

Complete UI redesign of Super-Task Vibe from a shallow macOS-inspired prototype to a polished, functional macOS Mojave dark-mode task manager. Replaces hand-rolled components with shadcn/ui, adds sidebar navigation, task detail panel, search, and functional desktop chrome.

## Layout Architecture

Hybrid layout: macOS desktop chrome (menu bar + dock) wrapping a standalone app window.

```
Menu Bar (22px, glass blur, functional dropdowns)
┌──────────────────────────────────────────────────────┐
│ ● ● ●        Super-Task Vibe                        │
├────────┬─────────────────────────────────────────────┤
│Sidebar │ Toolbar: [search] [filter] [+ New Task]    │
│ (200px)├─────────────────────────────────────────────┤
│        │                                             │
│ Inbox  │   Kanban Board (3-column grid)              │
│ Today  │   [Todo]  [In Progress]  [Done]             │
│ All    │   cards with DnD...                         │
│ ────── │                                             │
│Projects│                       ┌── Detail Sheet ────┤│
│ · Work │                       │ Title, Priority     ││
│ · Home │                       │ Due date, Status    ││
│        │                       │ Description         ││
│        │                       │ AI Sub-tasks        ││
├────────┴───────────────────────┴─────────────────────┤
│ Status bar: 12 tasks · 4 todo · 3 in progress       │
└──────────────────────────────────────────────────────┘
Dock (functional: Kanban, Voice, Settings)
```

- Window fills viewport between menu bar (top) and dock (bottom) — no longer draggable
- Sidebar (200px, collapsible via Cmd+B) with filter views
- Task detail Sheet slides in from right (400px) on card click
- Toolbar has search input, filter controls, and New Task button
- Status bar at bottom with aggregate task counts

## Color Theme — Mojave Dark Mode

### Wallpaper

CSS gradient replacing Unsplash external dependency:

```css
background: linear-gradient(180deg,
  #081B33 0%, #152642 20%, #2F4562 40%,
  #353C51 55%, #506680 70%, #767D92 85%, #4A4040 100%);
```

### Surface Colors

| Surface | Value | Token |
|---------|-------|-------|
| Window body | `#323232` | `--background` |
| Sidebar | `#2D2D2D` | `--sidebar` |
| Cards | `#2A2A2A` | `--card` |
| Inputs | `rgba(255,255,255,0.07)` | `--input` |
| Menu bar / Dock | `rgba(30,30,30,0.8)` + blur(30px) | Custom |
| Popovers / Menus | `rgba(40,40,40,0.95)` + blur | `--popover` |

### Text Colors (white at varying opacity)

| Level | Value | Usage |
|-------|-------|-------|
| Primary | `rgba(255,255,255,0.85)` | Titles, card names |
| Secondary | `rgba(255,255,255,0.55)` | Descriptions, metadata |
| Tertiary | `rgba(255,255,255,0.25)` | Placeholders, disabled |

### Accent & System Colors

| Color | Hex | Usage |
|-------|-----|-------|
| System Blue | `#0A84FF` | Primary accent, links, selected items, focus rings |
| System Red | `#FF453A` | Critical priority, destructive actions |
| System Orange | `#FF9F0A` | High priority |
| System Yellow | `#FFD60A` | Medium priority |
| System Green | `#32D74B` | Low priority, success states |

### Traffic Light Buttons

| Button | Normal | Hover symbol color |
|--------|--------|--------------------|
| Close | `#ED6A5F` | `#460804` |
| Minimize | `#F6BE50` | `#90591D` |
| Zoom | `#61C555` | `#2A6218` |
| Inactive (all) | `#4D4D4D` | — |

### Corner Radii

| Element | Radius |
|---------|--------|
| Window | 10px |
| Cards / Dialogs | 8px |
| Menus / Popovers | 6px |
| Buttons / Inputs | 5px |
| Dock bar | 18px |

### Shadows

Window (active):
```css
box-shadow:
  inset 0 1px 0 rgba(255,255,255,0.05),
  0 0 0 1px rgba(0,0,0,0.3),
  0 22px 70px 4px rgba(0,0,0,0.56);
```

Menu/popover:
```css
box-shadow:
  0 0 0 1px rgba(255,255,255,0.1),
  0 10px 30px rgba(0,0,0,0.5);
```

### Typography

Font stack: `"SF Pro Display", "SF Pro Text", "Inter", system-ui, -apple-system, sans-serif`

| Context | Size | Weight |
|---------|------|--------|
| Menu bar / sidebar items | 13px | Regular (400) |
| Window title | 13px | Semibold (600) |
| Sidebar section headers | 11px | Semibold (600) |
| Body text | 13px | Regular (400) |
| Small / Caption | 11px | Regular (400) |

## Component Architecture

### shadcn/ui Components to Install

sidebar, dialog, sheet, command, dropdown-menu, button, input, textarea, select, badge, separator, scroll-area, tooltip, popover, calendar, sonner, card, skeleton

### Components to Rebuild

| Component | Changes |
|-----------|---------|
| `MenuBar` | Rebuild with shadcn DropdownMenu for functional File/Edit/View menus |
| `Window` | Simplify to non-draggable app shell (flex layout), keep traffic lights decorative |
| `Dock` | Add onClick handlers for navigation, keep framer-motion hover animations |
| `KanbanBoard` | Keep DnD logic, restyle columns/cards with shadcn primitives |
| `KanbanColumn` | Restyle with Mojave colors, add empty state placeholder |
| `KanbanCard` | Rebuild on shadcn Card + Badge, keep framer-motion hover, add click-to-open-detail |
| `NewTaskDialog` | Rebuild with shadcn Dialog, add priority Select, Calendar date picker, status Select |
| `VoiceAssistant` | Restyle with shadcn Button/Tooltip, move toggle to Dock |
| `Wallpaper` | Replace Unsplash image with CSS Mojave gradient |
| `Skeleton` | Replace with shadcn Skeleton component |

### New Components

| Component | Purpose |
|-----------|---------|
| `TaskDetailSheet` | Right-side shadcn Sheet for viewing/editing task. Integrates SubTaskGenerator. |
| `SearchCommand` | Cmd+K command palette (shadcn Command) for searching/filtering tasks |
| `TaskForm` | Shared form for create/edit — title, description, priority, due date, status |
| `StatusBar` | Bottom bar showing task counts by status |
| `AppSidebar` | shadcn Sidebar with Inbox/Today/All filters and project list |

### Components to Remove

| Component | Reason |
|-----------|--------|
| `SubTaskGenerator` (standalone) | Integrated into TaskDetailSheet |
| `ui/Skeleton.tsx` | Replaced by shadcn Skeleton |

## New Features

### Task Detail Sheet

- Opens on card click, slides from right (400px)
- All fields editable: title, description, priority (Select), due date (Calendar), status (Select)
- SubTaskGenerator integrated at bottom — generates AI subtasks, each saveable with "+" button
- Delete with confirmation dialog
- Close with X or click outside

### Search & Filter (Cmd+K)

- Command palette searches tasks by title and description
- Quick filter actions: by priority, by status
- Also accessible via search input in toolbar

### Enhanced New Task Dialog

- Full form: title (required), description, priority selector, due date picker, status
- Replaces current title-only creation

### Functional Menu Bar

- File: New Task (Cmd+N)
- View: Toggle Sidebar (Cmd+B)

### Functional Dock

- Kanban icon: shows active state (current view)
- Mic icon: toggles VoiceAssistant panel
- Settings: placeholder for future

### Toast Notifications

- sonner toasts for: task created, updated, deleted, AI subtasks generated

### Sidebar Filters

- Inbox: all tasks (default)
- Today: tasks with due_date = today
- All Tasks: everything
- Projects section: placeholder for future multi-project support

## Data Flow Changes

No database schema changes. No new server actions needed — existing CRUD covers all operations. Changes are UI-only:

- `updateTask` already supports partial updates (dynamic SET) — used by TaskDetailSheet for inline editing
- `getTasks` already returns all fields — sidebar filters are client-side
- `SubTaskGenerator` already works — just needs to be rendered in TaskDetailSheet

## Out of Scope

- Multi-project support (placeholder in sidebar only)
- Authentication
- Real-time collaboration
- Light mode (dark only for this iteration)
- Mobile-responsive redesign (desktop-first, existing mobile scroll preserved)
