"use client";

import { useEffect } from "react";

interface Shortcuts {
  onNewTask?: () => void;
  onToggleSidebar?: () => void;
}

export function useKeyboardShortcuts({ onNewTask, onToggleSidebar }: Shortcuts) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey;
      if (!isMod) return;

      if (e.key === "n") {
        e.preventDefault();
        onNewTask?.();
      } else if (e.key === "b") {
        e.preventDefault();
        onToggleSidebar?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewTask, onToggleSidebar]);
}
