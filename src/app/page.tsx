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
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewTask: () => setNewTaskOpen(true),
    onToggleSidebar: () => setSidebarCollapsed((prev) => !prev),
  });

  // Sidebar filter counts
  const taskCounts = useMemo(() => ({
    inbox: tasks.length,
    today: tasks.filter((t) => isToday(t.due_date)).length,
    all: tasks.length,
  }), [tasks]);

  // Apply all filters
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (sidebarFilter === "today") {
      result = result.filter((t) => isToday(t.due_date));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    if (filterPriority) {
      result = result.filter((t) => t.priority === filterPriority);
    }

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

      {voiceOpen && <VoiceAssistant onClose={() => setVoiceOpen(false)} />}

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
