"use client";

import { useState } from "react";

export function useVoiceOutput() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = async (text: string) => {
    if (!text) return;
    
    setIsPlaying(true);
    try {
      const response = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Voice synthesis failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Voice output error:", error);
      setIsPlaying(false);
    }
  };

  return { speak, isPlaying };
}
