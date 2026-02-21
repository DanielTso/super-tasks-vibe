"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagBadgeProps {
  tag: string;
  color?: "blue" | "red" | "orange" | "yellow" | "green" | "purple";
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md";
}

const TAG_COLORS = {
  blue: "bg-system-blue/15 text-system-blue border-system-blue/30",
  red: "bg-system-red/15 text-system-red border-system-red/30",
  orange: "bg-system-orange/15 text-system-orange border-system-orange/30",
  yellow: "bg-system-yellow/15 text-system-yellow border-system-yellow/30",
  green: "bg-system-green/15 text-system-green border-system-green/30",
  purple: "bg-[#BF5AF2]/15 text-[#BF5AF2] border-[#BF5AF2]/30",
} as const;

// Deterministic color assignment based on tag name
export function getTagColor(tag: string): keyof typeof TAG_COLORS {
  const colors: (keyof typeof TAG_COLORS)[] = [
    "blue",
    "red",
    "orange",
    "yellow",
    "green",
    "purple",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function TagBadge({
  tag,
  color,
  onRemove,
  className,
  size = "md",
}: TagBadgeProps) {
  const assignedColor = color || getTagColor(tag);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium transition-colors",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-[11px]",
        TAG_COLORS[assignedColor],
        className
      )}
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
        >
          <X className={cn("w-3 h-3", size === "sm" && "w-2.5 h-2.5")} />
        </button>
      )}
    </span>
  );
}
