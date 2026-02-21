# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
npm run dev          # Start Next.js dev server (http://localhost:3000)
npm run build        # Production build (requires all env vars)
npm run lint         # ESLint (scoped to src/)
npm run test:e2e     # Playwright e2e tests (auto-starts dev server)
npm run test:e2e:ui  # Playwright tests in interactive UI mode
```

### Running Single E2E Test

```bash
npx playwright test e2e/app.spec.ts --grep "should load the homepage"
```

### E2E Tests

Two Playwright configs exist:

- **Root** (`playwright.config.ts`): Standard Playwright tests in `e2e/`. Base URL `http://localhost:3000`. Has `webServer` block that auto-starts `npm run dev`. This is what CI runs.
- **UUV** (`uuv/playwright.config.ts`): BDD framework config using `@uuv/playwright`. Base URL `http://localhost:4200` (override via `UUV_BASE_URL`). No feature files exist yet. Requires a manually running server.

## Architecture

**Super-Task Vibe** is a modern task manager built with Next.js 16 (App Router), React 19, and TypeScript (strict mode). It features a Kanban board, sidebar navigation, task detail sheet, voice assistant, AI-powered subtask generation, task tags, archiving, and dependencies.

### Tech Stack

- **Framework**: Next.js 16 App Router with React Server Actions
- **Database**: Turso (LibSQL) via `@libsql/client` — raw SQL with parameterized queries, no ORM. Schema DDL in `schema.sql` (no migration system).
- **AI**: Vercel AI SDK (`ai`) with `@ai-sdk/google` — uses Gemini 2.0 Flash for structured object generation
- **Voice**: ElevenLabs API (text-to-speech) via `/api/voice` route, Web Speech API (speech recognition)
- **Drag & Drop**: @dnd-kit (core + sortable), closestCorners collision detection
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS) — Dialog, Sheet, Select, Calendar, DropdownMenu, Command, ScrollArea, Tooltip, Badge, Sonner, and more. Components live in `src/components/ui/`.
- **Styling**: Tailwind CSS 4 beta — CSS-only config via `@theme inline` directive in `src/styles/globals.css`. shadcn CSS variables (`--background`, `--foreground`, `--primary`, etc.) are mapped through `@theme inline`.
- **Animation**: framer-motion for drag, spring animations, and hover micro-interactions
- **Notifications**: sonner (toast notifications)
- **Validation**: Zod schemas for env vars (`src/lib/env.ts`) and server action inputs

### Key Directories

- `src/app/` — Next.js App Router pages and API routes
- `src/components/ui/` — shadcn/ui primitive components (generated, do not hand-edit)
- `src/components/kanban/` — KanbanBoard, KanbanColumn, KanbanCard, NewTaskDialog, TaskDetailSheet, SubTaskGenerator, TaskDependencyManager
- `src/components/AppSidebar.tsx` — Collapsible sidebar with filter navigation (Inbox, Today, All Tasks, Archived)
- `src/components/Toolbar.tsx` — Search input and filter controls above the Kanban board
- `src/components/StatusBar.tsx` — Bottom status bar showing task counts and app info
- `src/components/` — MenuBar, Dock, Window, Wallpaper, VoiceAssistant
- `src/hooks/` — useRealtimeTasks, useVoiceInput, useVoiceOutput, useKeyboardShortcuts
- `src/lib/actions/` — Server actions: `tasks.ts` (CRUD, archive, tags), `ai-tasks.ts` (Gemini subtask generation), `task-dependencies.ts` (dependency management)
- `src/lib/types.ts` — Task, CreateTaskInput, UpdateTaskInput, ActionResult<T>, SubTask
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `src/lib/db.ts` — Turso client singleton
- `src/lib/env.ts` — Zod-validated env vars with build-time placeholders

### Component Patterns

- `page.tsx` is `"use client"` — the entire home page is client-rendered, polling via `useRealtimeTasks`
- Server actions are imported directly into client components and called as async functions
- `cn()` utility from `src/lib/utils.ts` is used throughout for conditional class composition
- Hardcoded user ID (`"personal-vibe-user"`) and project ID (`"00000000-0000-0000-0000-000000000000"`)
- `dark` class is set on `<html>` to satisfy shadcn/ui component styling expectations

### Server Action Patterns

All server actions in `src/lib/actions/` follow this pattern:

1. File starts with `"use server";`
2. Validate input with Zod `safeParse()` — return `{ error }` on failure
3. Execute DB operation in try/catch
4. Log errors with `console.error("[functionName]", error)`
5. Call `revalidatePath("/")` after mutations
6. Return `ActionResult<T>` — discriminated union: `{ data: T }` | `{ error: string }`

Key operations: `createTask` (UUID via `crypto.randomUUID()`), `getTasks`, `updateTask` (dynamic SET clause), `deleteTask`, `updateTaskPositions` (batch via `db.batch()` for drag-and-drop)

### Task Schema

Tasks have: id (UUID), title, description, status (`todo`|`in_progress`|`done`), priority (`low`|`medium`|`high`|`critical`), due_date, project_id, user_id, position, tags (JSON array), archived (boolean), created_at, updated_at. Full DDL in `schema.sql`.

### Styling Conventions

- **Framework**: Tailwind CSS 4 beta — CSS-only config via `@theme inline` directive in `src/styles/globals.css`
- **CSS Variables**: shadcn CSS variables (`--background`, `--foreground`, `--primary`, etc.) mapped via `@theme inline`
- **Utility**: Always use `cn()` from `src/lib/utils.ts` for conditional and merged class names
- **Components**: Use shadcn/ui components where possible (Dialog, Sheet, Select, Calendar, DropdownMenu, Command, ScrollArea, Tooltip, Badge, Sonner)
- **Animation**: Use framer-motion for drag, spring animations, and hover micro-interactions

### Design Philosophy

This project embraces **flexible, modern design patterns** inspired by industry-leading task managers like Linear, Notion, and Todoist. The design should be:

- **Clean and minimal**: Focus on content, not chrome
- **Keyboard-first**: Support power users with shortcuts (Cmd+K command palette, quick actions)
- **Contextual**: Show relevant information based on user context
- **Performant**: Fast interactions, optimistic updates, smooth animations
- **Accessible**: ARIA labels, keyboard navigation, screen reader support

### Industry-Standard UI Patterns

Based on research of leading task managers (Linear, Notion, Todoist, Asana), implement these patterns:

#### 1. Command Palette (Cmd+K)
- Fuzzy search across all actions and navigation
- Keyboard navigation (↑↓ arrows, Enter to select, Esc to close)
- Categorized results (Navigation, Actions, Settings)
- Recent commands tracking

#### 2. Bento Grid Layouts
- Modular, compartmentalized task organization
- Visual hierarchy through box sizes
- Responsive grid adaptation

#### 3. Contextual Sidebars
- Collapsible navigation with icon + text
- Nested sections for projects/labels
- Quick filters and counts

#### 4. Smart Input Patterns
- Natural language task creation ("Meeting tomorrow at 3pm")
- Inline editing without modal disruption
- Auto-save with optimistic updates

#### 5. Visual Feedback
- Smooth drag-and-drop with ghost previews
- Toast notifications for actions
- Loading states with skeletons

### CI

GitHub Actions (`.github/workflows/`):

- **ci.yml**: Lint + Build jobs on push/PR to main (Node 22)
- **playwright.yml**: E2E tests on push/PR to main, uploads report artifact

All CI jobs require the 4 env vars as GitHub secrets.

## Environment Variables

Required in `.env.local`:
- `TURSO_DATABASE_URL` — LibSQL connection URL
- `TURSO_AUTH_TOKEN` — Turso JWT auth token
- `GOOGLE_GENERATIVE_AI_API_KEY` — Gemini API key
- `ELEVENLABS_API_KEY` — ElevenLabs API key

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).
