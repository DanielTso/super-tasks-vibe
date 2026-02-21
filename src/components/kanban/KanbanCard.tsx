"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarDays, GitBranch, Lock, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { checkDependenciesComplete } from "@/lib/actions/task-dependencies";
import type { Task, TaskPriority } from "@/lib/types";
import { useEffect, useState } from "react";
import { TagBadge } from "@/components/ui/tag-badge";

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

  const [depStatus, setDepStatus] = useState<{
    complete: boolean;
    total: number;
    completed: number;
  } | null>(null);

  useEffect(() => {
    // Load dependency status
    checkDependenciesComplete(task.id).then((result) => {
      if (result.data) {
        setDepStatus(result.data);
      }
    });
  }, [task.id]);

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
  const hasIncompleteDeps = depStatus && depStatus.total > 0 && !depStatus.complete;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -1, scale: 1.005 }}
      onClick={onClick}
      className={cn(
        "bg-card p-3 rounded-[8px] border border-border cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors",
        isOverlay && "border-primary/40 shadow-xl scale-[1.02] z-50",
        hasIncompleteDeps && "border-system-orange/30 bg-system-orange/5"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge
          variant="outline"
          className={cn("text-[9px] font-bold uppercase tracking-wider", PRIORITY_COLORS[task.priority])}
        >
          {task.priority}
        </Badge>
        {hasIncompleteDeps && (
          <div className="flex items-center gap-1 text-system-orange" title="Has incomplete dependencies">
            <Lock className="w-3 h-3" />
          </div>
        )}
      </div>

      <h3 className="text-[13px] font-semibold text-foreground leading-tight mb-1">
        {task.title}
      </h3>

      {task.description && (
        <p className="text-[11px] text-muted-foreground mb-2 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.tags.slice(0, 3).map((tag) => (
            <TagBadge key={tag} tag={tag} size="sm" />
          ))}
          {task.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground px-1">+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between">
        {dueDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarDays className="w-3 h-3" />
            <span className="text-[11px]">{dueDate}</span>
          </div>
        )}
        {depStatus && depStatus.total > 0 && (
          <div className={cn(
            "flex items-center gap-1 text-[10px]",
            depStatus.complete ? "text-system-green" : "text-system-orange"
          )}>
            <GitBranch className="w-3 h-3" />
            <span>{depStatus.completed}/{depStatus.total}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
