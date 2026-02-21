"use client";

import { ReactNode } from "react";

interface WindowProps {
  title: string;
  children: ReactNode;
}

export function Window({ title, children }: WindowProps) {
  return (
    <div className="flex flex-col rounded-[10px] window-shadow overflow-hidden bg-background border border-border">
      {/* macOS Title Bar */}
      <div className="h-[38px] flex items-center px-[13px] bg-[#3A3A3A] border-b border-[rgba(0,0,0,0.3)] select-none shrink-0">
        <div className="flex gap-[8px] w-[54px]">
          <div className="w-[12px] h-[12px] rounded-full bg-mac-close border border-[#E24B41] group/btn cursor-default relative">
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-mac-close-hover opacity-0 group-hover/btn:opacity-100 transition-opacity">x</span>
          </div>
          <div className="w-[12px] h-[12px] rounded-full bg-mac-minimize border border-[#E1A73E] group/btn cursor-default relative">
            <span className="absolute inset-0 flex items-center justify-center text-[10px] text-mac-minimize-hover opacity-0 group-hover/btn:opacity-100 transition-opacity leading-none pb-[1px]">-</span>
          </div>
          <div className="w-[12px] h-[12px] rounded-full bg-mac-zoom border border-[#2DAC2F] group/btn cursor-default relative">
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-mac-zoom-hover opacity-0 group-hover/btn:opacity-100 transition-opacity">+</span>
          </div>
        </div>

        <span className="text-[13px] font-semibold text-foreground/60 w-full text-center pr-[54px] tracking-tight">
          {title}
        </span>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
}
