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

**Super-Task Vibe** is a macOS Mojave-aesthetic personal task manager built with Next.js 16 (App Router), React 19, and TypeScript (strict mode). It features a Kanban board, sidebar navigation, task detail sheet, voice assistant, and AI-powered subtask generation.

### Tech Stack

- **Framework**: Next.js 16 App Router with React Server Actions
- **Database**: Turso (LibSQL) via `@libsql/client` — raw SQL with parameterized queries, no ORM. Schema DDL in `schema.sql` (no migration system).
- **AI**: Vercel AI SDK (`ai`) with `@ai-sdk/google` — uses Gemini 2.0 Flash for structured object generation
- **Voice**: ElevenLabs API (text-to-speech) via `/api/voice` route, Web Speech API (speech recognition)
- **Drag & Drop**: @dnd-kit (core + sortable), closestCorners collision detection
- **UI Components**: shadcn/ui (Radix UI primitives + Tailwind CSS) — Dialog, Sheet, Select, Calendar, DropdownMenu, Command, ScrollArea, Tooltip, Badge, Sonner, and more. Components live in `src/components/ui/`.
- **Styling**: Tailwind CSS 4 beta — CSS-only config via `@theme inline` directive in `src/styles/globals.css`. Mojave dark theme applied globally via `:root` CSS variables (no `tailwind.config.*` or `postcss.config.*` files). shadcn CSS variables (`--background`, `--foreground`, `--primary`, etc.) are mapped through `@theme inline`.
- **Animation**: framer-motion for drag, spring animations, and hover micro-interactions
- **Notifications**: sonner (toast notifications)
- **Validation**: Zod schemas for env vars (`src/lib/env.ts`) and server action inputs

### Key Directories

- `src/app/` — Next.js App Router pages and API routes
- `src/components/ui/` — shadcn/ui primitive components (generated, do not hand-edit)
- `src/components/kanban/` — KanbanBoard, KanbanColumn, KanbanCard, NewTaskDialog, TaskDetailSheet, SubTaskGenerator
- `src/components/AppSidebar.tsx` — Collapsible sidebar with filter navigation (Inbox, Today, All Tasks)
- `src/components/Toolbar.tsx` — Search input and filter controls above the Kanban board
- `src/components/StatusBar.tsx` — Bottom status bar showing task counts and app info
- `src/components/` — MenuBar (functional dropdowns), Dock (functional navigation), Window (app shell), Wallpaper, VoiceAssistant
- `src/hooks/` — useRealtimeTasks (5s polling, pauses when tab hidden), useVoiceInput, useVoiceOutput, useKeyboardShortcuts
- `src/lib/actions/` — Server actions: `tasks.ts` (CRUD), `ai-tasks.ts` (Gemini subtask generation)
- `src/lib/types.ts` — Task, CreateTaskInput, UpdateTaskInput, ActionResult<T>, SubTask
- `src/lib/utils.ts` — `cn()` utility (clsx + tailwind-merge)
- `src/lib/db.ts` — Turso client singleton
- `src/lib/env.ts` — Zod-validated env vars with build-time placeholders

### Component Patterns

- `page.tsx` is `"use client"` — the entire home page is client-rendered, polling via `useRealtimeTasks`
- Server actions are imported directly into client components and called as async functions
- `cn()` utility from `src/lib/utils.ts` is used throughout for conditional class composition
- Hardcoded user ID (`"personal-vibe-user"`) and project ID (`"00000000-0000-0000-0000-000000000000"`)
- Mojave dark mode is applied as the single global theme via `:root` CSS variables — no light/dark toggle
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

Tasks have: id (UUID), title, description, status (`todo`|`in_progress`|`done`), priority (`low`|`medium`|`high`|`critical`), due_date, project_id, user_id, position, created_at, updated_at. Full DDL in `schema.sql`.

### Styling Conventions

- **Theme**: macOS Mojave dark theme is the only theme. All colors are defined as CSS custom properties on `:root` in `src/styles/globals.css`.
- **Theme tokens**: `--color-system-blue/red/orange/yellow/green` for system accent colors; `--color-mac-close/minimize/zoom` for traffic light buttons; `--radius-dock: 18px` for dock corners.
- **shadcn CSS variables**: `--background`, `--foreground`, `--primary`, `--muted`, `--border`, `--ring`, etc. mapped via `@theme inline` so Tailwind utilities (`bg-background`, `text-foreground`, etc.) work directly.
- **Glass effects**: `.mojave-glass` — `rgba(30,30,30,0.8)` background with 30px backdrop blur and saturate(180%). Used on the menu bar and dock.
- **Elevation**: `.window-shadow` for main app window; `.menu-shadow` for dropdowns and popovers.
- **Font stack**: SF Pro Display/Text, Inter, system-ui (set via `--font-sans` in `@theme inline`)
- **cn() utility**: Always use `cn()` from `src/lib/utils.ts` for conditional and merged class names.

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
