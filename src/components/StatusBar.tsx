import type { Task } from "@/lib/types";

interface StatusBarProps {
  tasks: Task[];
}

export function StatusBar({ tasks }: StatusBarProps) {
  const todo = tasks.filter((t) => t.status === "todo").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="h-[22px] flex items-center px-4 bg-[#2A2A2A] border-t border-border text-[11px] text-muted-foreground select-none shrink-0">
      <span>
        {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        {" \u00B7 "}
        {todo} todo
        {" \u00B7 "}
        {inProgress} in progress
        {" \u00B7 "}
        {done} done
      </span>
    </div>
  );
}
