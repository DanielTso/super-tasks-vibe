"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import type { ActionResult, SubTask } from "@/lib/types";

const InputSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000),
});

export async function generateSubTasks(
  taskTitle: string,
  taskDescription: string
): Promise<ActionResult<SubTask[]>> {
  const parsed = InputSchema.safeParse({ title: taskTitle, description: taskDescription });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  try {
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001"),
      system:
        "You are a productivity assistant. Break down the user's task into clear, actionable sub-tasks. Each sub-task should be concise and relevant. Only respond with the structured data requested.",
      prompt: `Task: ${parsed.data.title}\nDescription: ${parsed.data.description}`,
      schema: z.object({
        subtasks: z
          .array(
            z.object({
              title: z.string(),
              description: z.string(),
              priority: z.enum(["low", "medium", "high"]),
              estimatedMinutes: z.number(),
            })
          )
          .min(3)
          .max(7),
      }),
    });

    return { data: object.subtasks };
  } catch (error) {
    console.error("[generateSubTasks]", error);
    return { error: "Failed to generate sub-tasks. Please try again." };
  }
}
