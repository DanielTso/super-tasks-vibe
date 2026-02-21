"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { Task, ActionResult } from "@/lib/types";

const AddDependencySchema = z.object({
  taskId: z.string().uuid(),
  dependsOnTaskId: z.string().uuid(),
});

const RemoveDependencySchema = z.object({
  taskId: z.string().uuid(),
  dependsOnTaskId: z.string().uuid(),
});

const TaskIdSchema = z.string().uuid();

// libSQL returns Row class instances; Next.js requires plain objects for client components
function toPlainObject<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row)) as T;
}

/**
 * Check if adding a dependency would create a circular dependency
 * Returns true if circular dependency would be created
 */
async function wouldCreateCircularDependency(
  taskId: string,
  dependsOnTaskId: string
): Promise<boolean> {
  // Direct cycle: A depends on B, and B depends on A
  if (taskId === dependsOnTaskId) return true;

  // Check if dependsOnTaskId already depends on taskId (transitive cycle)
  // We need to check if there's a path from dependsOnTaskId back to taskId
  const visited = new Set<string>();
  const queue: string[] = [dependsOnTaskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === taskId) return true;
    if (visited.has(current)) continue;
    visited.add(current);

    // Get all tasks that current depends on
    const result = await db.execute({
      sql: "SELECT depends_on_task_id FROM task_dependencies WHERE task_id = ?",
      args: [current],
    });

    for (const row of result.rows) {
      const depId = row.depends_on_task_id as string;
      if (!visited.has(depId)) {
        queue.push(depId);
      }
    }
  }

  return false;
}

/**
 * Add a dependency to a task
 */
export async function addTaskDependency(
  taskId: string,
  dependsOnTaskId: string
): Promise<ActionResult<{ taskId: string; dependsOnTaskId: string }>> {
  const parsed = AddDependencySchema.safeParse({ taskId, dependsOnTaskId });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  // Prevent self-dependency
  if (taskId === dependsOnTaskId) {
    return { error: "A task cannot depend on itself" };
  }

  try {
    // Check for circular dependency
    const wouldCycle = await wouldCreateCircularDependency(taskId, dependsOnTaskId);
    if (wouldCycle) {
      return { error: "Cannot add dependency: would create a circular dependency" };
    }

    // Check if both tasks exist
    const taskResult = await db.execute({
      sql: "SELECT id FROM tasks WHERE id = ?",
      args: [taskId],
    });
    if (taskResult.rows.length === 0) {
      return { error: "Task not found" };
    }

    const dependsOnResult = await db.execute({
      sql: "SELECT id FROM tasks WHERE id = ?",
      args: [dependsOnTaskId],
    });
    if (dependsOnResult.rows.length === 0) {
      return { error: "Dependency task not found" };
    }

    // Insert the dependency
    await db.execute({
      sql: `INSERT INTO task_dependencies (task_id, depends_on_task_id, created_at)
            VALUES (?, ?, datetime('now'))`,
      args: [taskId, dependsOnTaskId],
    });

    revalidatePath("/");

    return { data: { taskId, dependsOnTaskId } };
  } catch (error) {
    console.error("[addTaskDependency]", error);
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return { error: "This dependency already exists" };
    }
    return { error: "Failed to add dependency" };
  }
}

/**
 * Remove a dependency from a task
 */
export async function removeTaskDependency(
  taskId: string,
  dependsOnTaskId: string
): Promise<ActionResult<{ taskId: string; dependsOnTaskId: string }>> {
  const parsed = RemoveDependencySchema.safeParse({ taskId, dependsOnTaskId });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    await db.execute({
      sql: "DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_task_id = ?",
      args: [taskId, dependsOnTaskId],
    });

    revalidatePath("/");

    return { data: { taskId, dependsOnTaskId } };
  } catch (error) {
    console.error("[removeTaskDependency]", error);
    return { error: "Failed to remove dependency" };
  }
}

/**
 * Get all dependencies (prerequisite tasks) for a task
 */
export async function getTaskDependencies(taskId: string): Promise<ActionResult<Task[]>> {
  const parsed = TaskIdSchema.safeParse(taskId);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const result = await db.execute({
      sql: `SELECT t.* FROM tasks t
            INNER JOIN task_dependencies td ON t.id = td.depends_on_task_id
            WHERE td.task_id = ?
            ORDER BY t.created_at ASC`,
      args: [taskId],
    });

    return { data: result.rows.map((row) => toPlainObject<Task>(row as Record<string, unknown>)) };
  } catch (error) {
    console.error("[getTaskDependencies]", error);
    return { error: "Failed to fetch task dependencies" };
  }
}

/**
 * Get all tasks that depend on a given task
 */
export async function getDependentTasks(taskId: string): Promise<ActionResult<Task[]>> {
  const parsed = TaskIdSchema.safeParse(taskId);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const result = await db.execute({
      sql: `SELECT t.* FROM tasks t
            INNER JOIN task_dependencies td ON t.id = td.task_id
            WHERE td.depends_on_task_id = ?
            ORDER BY t.created_at ASC`,
      args: [taskId],
    });

    return { data: result.rows.map((row) => toPlainObject<Task>(row as Record<string, unknown>)) };
  } catch (error) {
    console.error("[getDependentTasks]", error);
    return { error: "Failed to fetch dependent tasks" };
  }
}

/**
 * Check if all dependencies for a task are complete (status = 'done')
 */
export async function checkDependenciesComplete(
  taskId: string
): Promise<ActionResult<{ complete: boolean; total: number; completed: number }>> {
  const parsed = TaskIdSchema.safeParse(taskId);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    // Get count of all dependencies
    const totalResult = await db.execute({
      sql: "SELECT COUNT(*) as count FROM task_dependencies WHERE task_id = ?",
      args: [taskId],
    });
    const total = (totalResult.rows[0]?.count as number) ?? 0;

    // Get count of completed dependencies
    const completedResult = await db.execute({
      sql: `SELECT COUNT(*) as count FROM task_dependencies td
            INNER JOIN tasks t ON td.depends_on_task_id = t.id
            WHERE td.task_id = ? AND t.status = 'done'`,
      args: [taskId],
    });
    const completed = (completedResult.rows[0]?.count as number) ?? 0;

    return { data: { complete: total === completed, total, completed } };
  } catch (error) {
    console.error("[checkDependenciesComplete]", error);
    return { error: "Failed to check dependencies" };
  }
}
