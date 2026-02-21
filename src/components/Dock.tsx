"use client";

import { motion } from "framer-motion";
import { ListTodo, Mic, Settings, LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DockItem {
  id: string;
  icon: LucideIcon;
  label: string;
  color: string;
}

const DOCK_ITEMS: DockItem[] = [
  { id: "tasks", icon: ListTodo, label: "Kanban", color: "bg-orange-500" },
  { id: "voice", icon: Mic, label: "Voice", color: "bg-blue-500" },
  { id: "settings", icon: Settings, label: "Settings", color: "bg-[#636366]" },
];

interface DockProps {
  activeId?: string;
  onItemClick?: (id: string) => void;
}

export function Dock({ activeId = "tasks", onItemClick }: DockProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="shrink-0 flex justify-center py-2 z-50">
        <div className="mojave-glass px-4 pt-3 pb-1 rounded-dock flex items-end gap-3 border border-white/15">
          {DOCK_ITEMS.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{ y: -8, scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  onClick={() => onItemClick?.(item.id)}
                  className="flex flex-col items-center focus:outline-none"
                >
                  <div
                    className={`w-11 h-11 rounded-[10px] ${item.color} shadow-lg flex items-center justify-center border border-white/20 relative`}
                  >
                    <item.icon className="w-5 h-5 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-[10px]" />
                  </div>
                  <div
                    className={`w-1 h-1 rounded-full mt-1 ${
                      activeId === item.id ? "bg-white/70" : "bg-transparent"
                    }`}
                  />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-popover border-border text-foreground text-xs menu-shadow"
              >
                {item.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
