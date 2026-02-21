"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { InValue } from "@libsql/client";
import type { Task, ActionResult } from "@/lib/types";
import { checkDependenciesComplete } from "./task-dependencies";

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(10000).optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  due_date: z.string().optional(),
  project_id: z.string(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(10000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  due_date: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
});

const USER_ID = "personal-vibe-user";

// libSQL returns Row class instances; Next.js requires plain objects for client components
function toPlainObject<T>(row: Record<string, unknown>): T {
  const obj = Object.fromEntries(Object.entries(row)) as Record<string, unknown>;
  // Parse tags JSON string to array
  if (typeof obj.tags === "string") {
    try {
      obj.tags = JSON.parse(obj.tags);
    } catch {
      obj.tags = [];
    }
  }
  // Convert archived integer to boolean
  if (typeof obj.archived === "number") {
    obj.archived = obj.archived === 1;
  }
  return obj as T;
}

export async function createTask(
  input: z.infer<typeof CreateTaskSchema>
): Promise<ActionResult<Task>> {
  const result = CreateTaskSchema.safeParse(input);
  if (!result.success) return { error: result.error.issues[0].message };

  try {
    const taskId = crypto.randomUUID();

    // Set position to max + 1 for the target status column
    const posResult = await db.execute({
      sql: "SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM tasks WHERE project_id = ? AND user_id = ? AND status = ?",
      args: [result.data.project_id, USER_ID, result.data.status],
    });
    const position = (posResult.rows[0]?.next_pos as number) ?? 0;

    await db.execute({
      sql: `INSERT INTO tasks (id, title, description, status, priority, due_date, project_id, user_id, position, tags, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [
        taskId,
        result.data.title,
        result.data.description || "",
        result.data.status,
        result.data.priority,
        result.data.due_date || null,
        result.data.project_id,
        USER_ID,
        position,
        JSON.stringify(result.data.tags || []),
      ],
    });

    revalidatePath("/");

    // Fetch the created task to return full data
    const created = await db.execute({
      sql: "SELECT * FROM tasks WHERE id = ?",
      args: [taskId],
    });

    return { data: toPlainObject<Task>(created.rows[0] as Record<string, unknown>) };
  } catch (error) {
    console.error("[createTask]", error);
    return { error: "Failed to create task" };
  }
}

export async function getTasks(
  projectId: string,
  includeArchived: boolean = false
): Promise<ActionResult<Task[]>> {
  try {
    const sql = includeArchived
      ? "SELECT * FROM tasks WHERE project_id = ? AND user_id = ? ORDER BY position ASC"
      : "SELECT * FROM tasks WHERE project_id = ? AND user_id = ? AND archived = 0 ORDER BY position ASC";

    const result = await db.execute({
      sql,
      args: [projectId, USER_ID],
    });

    return { data: result.rows.map((row) => toPlainObject<Task>(row as Record<string, unknown>)) };
  } catch (error) {
    console.error("[getTasks]", error);
    return { error: "Failed to fetch tasks" };
  }
}

export async function updateTask(
  input: z.infer<typeof UpdateTaskSchema>
): Promise<ActionResult<Task>> {
  const result = UpdateTaskSchema.safeParse(input);
  if (!result.success) return { error: result.error.issues[0].message };

  const { id, ...fields } = result.data;

  // Check dependencies if trying to mark as done
  if (fields.status === "done") {
    const depsCheck = await checkDependenciesComplete(id);
    if (depsCheck.error) {
      return { error: depsCheck.error };
    }
    if (depsCheck.data && !depsCheck.data.complete) {
      const { completed, total } = depsCheck.data;
      return { error: `Cannot complete task: ${total - completed} of ${total} dependencies incomplete` };
    }
  }

  // Build dynamic SET clause from provided fields only
  const setClauses: string[] = [];
  const args: InValue[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      if (key === "tags") {
        setClauses.push(`tags = ?`);
        args.push(JSON.stringify(value as string[]));
      } else {
        setClauses.push(`${key} = ?`);
        args.push(value as InValue);
      }
    }
  }

  if (setClauses.length === 0) return { error: "No fields to update" };

  setClauses.push("updated_at = datetime('now')");
  args.push(id, USER_ID);

  try {
    await db.execute({
      sql: `UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ? AND user_id = ?`,
      args,
    });

    revalidatePath("/");

    const updated = await db.execute({
      sql: "SELECT * FROM tasks WHERE id = ?",
      args: [id],
    });

    if (!updated.rows[0]) return { error: "Task not found" };
    return { data: toPlainObject<Task>(updated.rows[0] as Record<string, unknown>) };
  } catch (error) {
    console.error("[updateTask]", error);
    return { error: "Failed to update task" };
  }
}

export async function deleteTask(id: string): Promise<ActionResult<{ id: string }>> {
  if (!id) return { error: "Task ID is required" };

  try {
    await db.execute({
      sql: "DELETE FROM tasks WHERE id = ? AND user_id = ?",
      args: [id, USER_ID],
    });

    revalidatePath("/");
    return { data: { id } };
  } catch (error) {
    console.error("[deleteTask]", error);
    return { error: "Failed to delete task" };
  }
}

export async function updateTaskPositions(
  updates: { id: string; status: string; position: number }[]
): Promise<ActionResult<{ count: number }>> {
  if (!updates.length) return { error: "No updates provided" };

  try {
    await db.batch(
      updates.map((u) => ({
        sql: "UPDATE tasks SET status = ?, position = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
        args: [u.status, u.position, u.id, USER_ID],
      }))
    );

    revalidatePath("/");
    return { data: { count: updates.length } };
  } catch (error) {
    console.error("[updateTaskPositions]", error);
    return { error: "Failed to update task positions" };
  }
}

export async function archiveTask(id: string): Promise<ActionResult<Task>> {
  if (!id) return { error: "Task ID is required" };

  try {
    await db.execute({
      sql: "UPDATE tasks SET archived = 1, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
      args: [id, USER_ID],
    });

    revalidatePath("/");

    const updated = await db.execute({
      sql: "SELECT * FROM tasks WHERE id = ?",
      args: [id],
    });

    if (!updated.rows[0]) return { error: "Task not found" };
    return { data: toPlainObject<Task>(updated.rows[0] as Record<string, unknown>) };
  } catch (error) {
    console.error("[archiveTask]", error);
    return { error: "Failed to archive task" };
  }
}

export async function unarchiveTask(id: string): Promise<ActionResult<Task>> {
  if (!id) return { error: "Task ID is required" };

  try {
    await db.execute({
      sql: "UPDATE tasks SET archived = 0, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
      args: [id, USER_ID],
    });

    revalidatePath("/");

    const updated = await db.execute({
      sql: "SELECT * FROM tasks WHERE id = ?",
      args: [id],
    });

    if (!updated.rows[0]) return { error: "Task not found" };
    return { data: toPlainObject<Task>(updated.rows[0] as Record<string, unknown>) };
  } catch (error) {
    console.error("[unarchiveTask]", error);
    return { error: "Failed to unarchive task" };
  }
}

export async function getArchivedTasks(
  projectId: string
): Promise<ActionResult<Task[]>> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM tasks WHERE project_id = ? AND user_id = ? AND archived = 1 ORDER BY position ASC",
      args: [projectId, USER_ID],
    });

    return { data: result.rows.map((row) => toPlainObject<Task>(row as Record<string, unknown>)) };
  } catch (error) {
    console.error("[getArchivedTasks]", error);
    return { error: "Failed to fetch archived tasks" };
  }
}

export async function archiveAllDoneTasks(
  projectId: string
): Promise<ActionResult<{ count: number }>> {
  try {
    const result = await db.execute({
      sql: "UPDATE tasks SET archived = 1, updated_at = datetime('now') WHERE project_id = ? AND user_id = ? AND status = 'done' AND archived = 0",
      args: [projectId, USER_ID],
    });

    revalidatePath("/");
    return { data: { count: result.rowsAffected } };
  } catch (error) {
    console.error("[archiveAllDoneTasks]", error);
    return { error: "Failed to archive completed tasks" };
  }
}
