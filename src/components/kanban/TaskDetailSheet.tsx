"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarDays, Trash2, Archive, ArchiveRestore } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTask, deleteTask, archiveTask, unarchiveTask } from "@/lib/actions/tasks";
import { SubTaskGenerator } from "./SubTaskGenerator";
import { TaskDependencyManager } from "./TaskDependencyManager";
import { TagInput } from "@/components/ui/tag-input";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types";

interface TaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "bg-system-red/15 text-system-red border-system-red/30",
  high: "bg-system-orange/15 text-system-orange border-system-orange/30",
  medium: "bg-system-yellow/15 text-system-yellow border-system-yellow/30",
  low: "bg-system-green/15 text-system-green border-system-green/30",
};

export function TaskDetailSheet({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailSheetProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.due_date ? new Date(task.due_date) : undefined);
      setTags(task.tags || []);
    }
  }, [task]);

  if (!task) return null;

  const handleSave = async () => {
    setIsSaving(true);
    await updateTask({
      id: task.id,
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : null,
      tags,
    });
    setIsSaving(false);
    onTaskUpdated?.();
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    onOpenChange(false);
    onTaskDeleted?.();
  };

  const handleArchive = async () => {
    await archiveTask(task.id);
    onTaskUpdated?.();
  };

  const handleUnarchive = async () => {
    await unarchiveTask(task.id);
    onTaskUpdated?.();
  };

  const handleArchive = async () => {
    await archiveTask(task.id);
    onOpenChange(false);
    onTaskUpdated?.();
  };

  const handleUnarchive = async () => {
    await unarchiveTask(task.id);
    onOpenChange(false);
    onTaskUpdated?.();
  };

  const hasChanges =
    title !== task.title ||
    description !== (task.description || "") ||
    priority !== task.priority ||
    status !== task.status ||
    (dueDate?.toISOString().split("T")[0] || null) !== task.due_date ||
    JSON.stringify(tags.sort()) !== JSON.stringify((task.tags || []).sort());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-card border-border w-[400px] sm:max-w-[400px] flex flex-col p-0">
        <SheetHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className={cn("text-[10px] uppercase", PRIORITY_COLORS[priority])}>
              {priority}
            </Badge>
            <div className="flex items-center gap-1">
              {/* Archive/Unarchive Button */}
              {task.archived ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUnarchive}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent h-7 px-2"
                  title="Unarchive task"
                >
                  <ArchiveRestore className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground hover:bg-accent h-7 px-2"
                      title="Archive task"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border menu-shadow">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Archive task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will archive &ldquo;{task.title}&rdquo;. Archived tasks are hidden from the main view but can be accessed from the Archived filter.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleArchive} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Archive
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {/* Delete Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border menu-shadow">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete task?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete &ldquo;{task.title}&rdquo;. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <SheetTitle className="sr-only">Task Details</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none px-0 h-auto focus-visible:ring-0 text-foreground"
              placeholder="Task title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="bg-input border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border menu-shadow">
                  <SelectItem value="todo">Todo</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-input border-border text-[13px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border menu-shadow">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input border-border text-[13px]",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dueDate
                    ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : "No due date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border menu-shadow" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Tags
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              placeholder="Add tags..."
              maxTags={10}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={5}
              className="bg-input border-border resize-none text-[13px]"
            />
          </div>

          <Separator className="bg-border" />

          <TaskDependencyManager task={task} onDependencyChanged={onTaskUpdated} />

          <Separator className="bg-border" />

          <SubTaskGenerator task={task} onSubTaskCreated={onTaskUpdated} />
        </div>

        {hasChanges && (
          <div className="px-6 py-3 border-t border-border bg-card shrink-0">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
