"use client";

import { useState } from "react";
import { Sparkles, Loader2, Check, Plus, AlertCircle } from "lucide-react";
import { generateSubTasks } from "@/lib/actions/ai-tasks";
import { createTask } from "@/lib/actions/tasks";
import type { Task, SubTask } from "@/lib/types";

interface SubTaskGeneratorProps {
  task: Task;
  onSubTaskCreated?: () => void;
}

export function SubTaskGenerator({ task, onSubTaskCreated }: SubTaskGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    const result = await generateSubTasks(task.title, task.description || "");
    setIsGenerating(false);

    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setSubtasks(result.data);
    }
  };

  const handleSaveAsTask = async (index: number, subtask: SubTask) => {
    const result = await createTask({
      title: subtask.title,
      description: subtask.description,
      status: "todo",
      priority: subtask.priority,
      project_id: task.project_id,
    });

    if (!result.error) {
      setSavedIds((prev) => new Set(prev).add(index));
      onSubTaskCreated?.();
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {!subtasks.length ? (
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-2 bg-gradient-to-r from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 border border-border rounded-lg flex items-center justify-center gap-2 text-xs font-semibold text-foreground transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            )}
            {isGenerating ? "Generating with AI..." : "Generate Sub-tasks with AI"}
          </button>
          {error && (
            <div className="mt-2 flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              Suggested Breakdown
            </span>
            <button
              onClick={() => setSubtasks([])}
              className="text-[10px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          {subtasks.map((st, i) => (
            <div
              key={i}
              className="bg-muted p-3 rounded-[6px] border border-border flex items-start justify-between gap-3 group"
            >
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-medium text-foreground mb-0.5 truncate">
                  {st.title}
                </h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1">
                  {st.description}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded bg-muted uppercase ${
                      st.priority === "high" ? "text-system-red" : "text-system-yellow"
                    }`}
                  >
                    {st.priority}
                  </span>
                  <span className="text-[8px] text-muted-foreground/60 font-medium">
                    {st.estimatedMinutes}m est.
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleSaveAsTask(i, st)}
                disabled={savedIds.has(i)}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  savedIds.has(i)
                    ? "bg-system-green/15 text-system-green border border-system-green/30"
                    : "bg-muted hover:bg-accent text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {savedIds.has(i) ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
