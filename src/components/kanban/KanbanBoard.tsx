"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { updateTaskPositions } from "@/lib/actions/tasks";
import type { Task, TaskStatus } from "@/lib/types";

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

interface KanbanBoardProps {
  tasks: Task[];
  refreshTasks: () => Promise<void>;
  onTaskClick?: (task: Task) => void;
}

export function KanbanBoard({ tasks, refreshTasks, onTaskClick }: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync when parent tasks change (e.g. from polling)
  // We use a key comparison to avoid overwriting mid-drag state
  const tasksKey = JSON.stringify(tasks.map((t) => t.id + t.status + t.position));
  const [prevTasksKey, setPrevTasksKey] = useState(tasksKey);
  if (tasksKey !== prevTasksKey && !activeId) {
    setLocalTasks(tasks);
    setPrevTasksKey(tasksKey);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => localTasks.filter((t) => t.status === status),
    [localTasks]
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeTask = localTasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Determine the target column: either the over item is a column ID or a task in a column
    let targetStatus: TaskStatus | undefined;

    const overTask = localTasks.find((t) => t.id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    } else if (["todo", "in_progress", "done"].includes(over.id as string)) {
      targetStatus = over.id as TaskStatus;
    }

    if (!targetStatus || activeTask.status === targetStatus) return;

    // Move task to new column
    setLocalTasks((prev) => {
      return prev.map((t) =>
        t.id === active.id ? { ...t, status: targetStatus } : t
      );
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTask = localTasks.find((t) => t.id === active.id);
    if (!activeTask) return;

    // Determine if we're dropping on a task or a column
    const overTask = localTasks.find((t) => t.id === over.id);
    const targetStatus: TaskStatus = overTask
      ? overTask.status
      : (["todo", "in_progress", "done"].includes(over.id as string)
          ? (over.id as TaskStatus)
          : activeTask.status);

    // Get tasks in the target column
    const columnTasks = localTasks
      .filter((t) => t.status === targetStatus && t.id !== active.id)
      .sort((a, b) => a.position - b.position);

    // Insert at the right position
    let newColumnTasks: Task[];
    if (overTask && overTask.id !== active.id) {
      const overIndex = columnTasks.findIndex((t) => t.id === over.id);
      const movedTask = { ...activeTask, status: targetStatus };
      newColumnTasks = [...columnTasks];
      newColumnTasks.splice(overIndex >= 0 ? overIndex : columnTasks.length, 0, movedTask);
    } else {
      newColumnTasks = [...columnTasks, { ...activeTask, status: targetStatus }];
    }

    // Assign new positions
    const updates = newColumnTasks.map((t, i) => ({
      id: t.id,
      status: targetStatus,
      position: i,
    }));

    // Optimistic update
    setLocalTasks((prev) => {
      const otherTasks = prev.filter(
        (t) => !updates.some((u) => u.id === t.id)
      );
      const updatedTasks = updates.map((u) => {
        const original = prev.find((t) => t.id === u.id)!;
        return { ...original, status: u.status as TaskStatus, position: u.position };
      });
      return [...otherTasks, ...updatedTasks];
    });

    // Persist
    await updateTaskPositions(updates);
    refreshTasks();
  }

  const activeTask = activeId ? localTasks.find((t) => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex md:grid md:grid-cols-3 gap-6 h-full overflow-x-auto pb-4 md:pb-0 md:overflow-visible">
        {COLUMNS.map((col) => (
          <div key={col.id} className="min-w-[300px] md:min-w-0 h-full">
            <KanbanColumn
              id={col.id}
              title={col.title}
              tasks={getTasksByStatus(col.id).sort((a, b) => a.position - b.position)}
              onTaskClick={onTaskClick}
            />
          </div>
        ))}
      </div>

      <DragOverlay
        dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: "0.5",
              },
            },
          }),
        }}
      >
        {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
