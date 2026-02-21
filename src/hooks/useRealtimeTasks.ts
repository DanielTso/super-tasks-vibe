"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { getTasks } from "@/lib/actions/tasks";
import type { Task } from "@/lib/types";

export function useRealtimeTasks(projectId: string, includeArchived: boolean = false) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isFetchingRef = useRef(false);

  const refreshTasks = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const result = await getTasks(projectId, includeArchived);
      if (result.data) {
        setTasks((prev) => {
          const next = result.data as Task[];
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [projectId, includeArchived]);

  useEffect(() => {
    refreshTasks();

    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshTasks();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshTasks]);

  return { tasks, setTasks, refreshTasks, isLoading };
}
