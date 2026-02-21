"use client";

import { motion } from "framer-motion";
import { Mic, MicOff, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { useVoiceOutput } from "@/hooks/useVoiceOutput";

interface VoiceAssistantProps {
  onClose?: () => void;
}

export function VoiceAssistant({ onClose }: VoiceAssistantProps) {
  const [lastTranscript, setLastTranscript] = useState("");
  const { speak, isPlaying } = useVoiceOutput();

  const { isListening, startListening, stopListening } = useVoiceInput(
    (transcript) => {
      setLastTranscript(transcript);
      speak(`I heard you say: ${transcript}. I'm on it!`);
    }
  );

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-16 right-4 z-[70] w-72 bg-card rounded-[10px] p-5 border border-border menu-shadow"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Voice Assistant
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <motion.button
          onClick={isListening ? stopListening : startListening}
          animate={isListening ? { scale: [1, 1.08, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-2 ${
            isListening
              ? "bg-destructive/15 text-destructive border-destructive/40"
              : "bg-muted text-foreground border-border"
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </motion.button>

        <div className="text-center">
          <p className="text-[11px] text-muted-foreground mb-1">
            {isListening ? "Listening..." : isPlaying ? "Speaking..." : "Tap to speak"}
          </p>
          <p className="text-[13px] text-foreground font-medium italic min-h-[20px]">
            {lastTranscript ? `"${lastTranscript}"` : "How can I help?"}
          </p>
        </div>

        {isPlaying && (
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [6, 20, 6] }}
                transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                className="w-0.5 bg-primary rounded-full"
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
