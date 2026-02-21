"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TagBadge, getTagColor } from "./tag-badge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  tags,
  onChange,
  placeholder = "Add a tag...",
  maxTags = 10,
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInputValue("");
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue.trim()) {
      addTag(inputValue);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 p-2 rounded-md border bg-input min-h-[38px]",
        isFocused && "ring-1 ring-ring border-ring",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => inputRef.current?.focus()}
    >
      <Tag className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          tag={tag}
          color={getTagColor(tag)}
          size="sm"
          onRemove={disabled ? undefined : () => removeTag(tag)}
        />
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : ""}
        disabled={disabled || tags.length >= maxTags}
        className="flex-1 min-w-[80px] bg-transparent border-none h-6 px-1 text-[13px] focus-visible:ring-0 placeholder:text-muted-foreground"
      />
    </div>
  );
}
