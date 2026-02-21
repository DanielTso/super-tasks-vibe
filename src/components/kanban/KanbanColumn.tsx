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
