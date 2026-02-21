"use client";

import { useState, useEffect, useCallback } from "react";
import {
  GitBranch,
  X,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  addTaskDependency,
  removeTaskDependency,
  getTaskDependencies,
  checkDependenciesComplete,
} from "@/lib/actions/task-dependencies";
import { getTasks } from "@/lib/actions/tasks";
import type { Task, TaskStatus } from "@/lib/types";

interface TaskDependencyManagerProps {
  task: Task;
  onDependencyChanged?: () => void;
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  todo: <Circle className="w-3.5 h-3.5 text-muted-foreground" />,
  in_progress: (
    <div className="w-3.5 h-3.5 rounded-full border-2 border-system-blue" />
  ),
  done: <CheckCircle2 className="w-3.5 h-3.5 text-system-green" />,
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

export function TaskDependencyManager({
  task,
  onDependencyChanged,
}: TaskDependencyManagerProps) {
  const [dependencies, setDependencies] = useState<Task[]>([]);
  const [depStatus, setDepStatus] = useState<{
    complete: boolean;
    total: number;
    completed: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [open, setOpen] = useState(false);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const loadDependencies = useCallback(async () => {
    setIsLoading(true);
    const [depsResult, statusResult] = await Promise.all([
      getTaskDependencies(task.id),
      checkDependenciesComplete(task.id),
    ]);

    if (depsResult.data) {
      setDependencies(depsResult.data);
    }
    if (statusResult.data) {
      setDepStatus(statusResult.data);
    }
    setIsLoading(false);
  }, [task.id]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  const loadAllTasks = useCallback(async () => {
    const result = await getTasks(task.project_id);
    if (result.data) {
      // Filter out current task and already added dependencies
      const existingDepIds = new Set(dependencies.map((d) => d.id));
      const filtered = result.data.filter(
        (t) =>
          t.id !== task.id &&
          !existingDepIds.has(t.id) &&
          !t.archived
      );
      setAllTasks(filtered);
    }
  }, [task.id, task.project_id, dependencies]);

  useEffect(() => {
    if (open) {
      loadAllTasks();
    }
  }, [open, loadAllTasks]);

  const handleAddDependency = async (dependsOnTaskId: string) => {
    setIsAdding(true);
    const result = await addTaskDependency(task.id, dependsOnTaskId);
    setIsAdding(false);
    setOpen(false);

    if (result.error) {
      // Error will be handled by the component using toast
      console.error("Failed to add dependency:", result.error);
    } else {
      await loadDependencies();
      onDependencyChanged?.();
    }
  };

  const handleRemoveDependency = async (dependsOnTaskId: string) => {
    setIsRemoving(dependsOnTaskId);
    const result = await removeTaskDependency(task.id, dependsOnTaskId);
    setIsRemoving(null);

    if (result.error) {
      console.error("Failed to remove dependency:", result.error);
    } else {
      await loadDependencies();
      onDependencyChanged?.();
    }
  };

  const incompleteCount = depStatus ? depStatus.total - depStatus.completed : 0;
  const isBlocked = task.status !== "done" && incompleteCount > 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Dependencies
          </span>
        </div>
        {depStatus && depStatus.total > 0 && (
          <Badge
            variant="outline"
            className={cn(
              "text-[10px]",
              depStatus.complete
                ? "bg-system-green/15 text-system-green border-system-green/30"
                : "bg-system-yellow/15 text-system-yellow border-system-yellow/30"
            )}
          >
            {depStatus.completed}/{depStatus.total} done
          </Badge>
        )}
      </div>

      {isBlocked && (
        <div className="flex items-start gap-2 text-xs text-system-orange bg-system-orange/10 border border-system-orange/20 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            This task has {incompleteCount} incomplete{" "}
            {incompleteCount === 1 ? "dependency" : "dependencies"}. Complete{" "}
            {incompleteCount === 1 ? "it" : "them"} first.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        </div>
      ) : dependencies.length === 0 ? (
        <div className="text-center py-3 text-xs text-muted-foreground">
          No dependencies added
        </div>
      ) : (
        <div className="space-y-2">
          {dependencies.map((dep) => (
            <div
              key={dep.id}
              className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted border border-border group"
            >
              <div className="flex items-center gap-2 min-w-0">
                {STATUS_ICONS[dep.status]}
                <div className="flex flex-col min-w-0">
                  <span
                    className={cn(
                      "text-xs font-medium truncate",
                      dep.status === "done" && "line-through text-muted-foreground"
                    )}
                  >
                    {dep.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {STATUS_LABELS[dep.status]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveDependency(dep.id)}
                disabled={isRemoving === dep.id}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                {isRemoving === dep.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            disabled={isAdding}
            className="w-full py-2 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border border-border rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-foreground transition-all disabled:opacity-50"
          >
            {isAdding ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <GitBranch className="w-3.5 h-3.5 text-primary" />
            )}
            {isAdding ? "Adding..." : "Add Dependency"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tasks..." />
            <CommandList>
              <CommandEmpty>No tasks found</CommandEmpty>
              <CommandGroup>
                {allTasks.map((t) => (
                  <CommandItem
                    key={t.id}
                    value={t.id}
                    onSelect={() => handleAddDependency(t.id)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {STATUS_ICONS[t.status]}
                    <span className="flex-1 truncate text-xs">{t.title}</span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4"
                    >
                      {STATUS_LABELS[t.status]}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
