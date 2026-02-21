"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { InValue } from "@libsql/client";
import type { Task, ActionResult } from "@/lib/types";

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  description: z.string().max(10000).optional(),
  status: z.enum(["todo", "in_progress", "done"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  due_date: z.string().optional(),
  project_id: z.string(),
});

const UpdateTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(10000).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  due_date: z.string().nullable().optional(),
  position: z.number().int().min(0).optional(),
});

const USER_ID = "personal-vibe-user";

// libSQL returns Row class instances; Next.js requires plain objects for client components
function toPlainObject<T>(row: Record<string, unknown>): T {
  return Object.fromEntries(Object.entries(row)) as T;
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
      sql: `INSERT INTO tasks (id, title, description, status, priority, due_date, project_id, user_id, position, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
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
  projectId: string
): Promise<ActionResult<Task[]>> {
  try {
    const result = await db.execute({
      sql: "SELECT * FROM tasks WHERE project_id = ? AND user_id = ? ORDER BY position ASC",
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

  // Build dynamic SET clause from provided fields only
  const setClauses: string[] = [];
  const args: InValue[] = [];

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      setClauses.push(`${key} = ?`);
      args.push(value as InValue);
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
