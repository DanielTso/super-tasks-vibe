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
        "bg-card p-3 rounded-[8px] border border-border cursor-grab active:cursor-grabbing hover:border-primary/40 transition-colors",
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
