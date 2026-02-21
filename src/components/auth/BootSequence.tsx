"use client";

import { useState, useEffect } from "react";

interface BootSequenceProps {
  onComplete?: () => void;
  className?: string;
}

interface BootMessage {
  text: string;
  type: "info" | "success" | "warning" | "error";
  delay: number;
}

const bootMessages: BootMessage[] = [
  { text: "Booting Super-Task Vibe Kernel v2.0...", type: "info", delay: 500 },
  { text: "Loading modules: [auth, tasks, voice, ai]...", type: "info", delay: 800 },
  { text: "Loading authentication module...", type: "success", delay: 600 },
  { text: "Loading task management engine...", type: "success", delay: 400 },
  { text: "Loading AI voice assistant...", type: "success", delay: 400 },
  { text: "Mounting database...", type: "info", delay: 700 },
  { text: "Starting services...", type: "warning", delay: 500 },
  { text: "System ready.", type: "success", delay: 1000 },
];

export function BootSequence({ onComplete, className = "" }: BootSequenceProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState<number[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const [isComplete, setIsComplete] = useState(false);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence animation
  useEffect(() => {
    if (currentStep >= bootMessages.length) {
      setIsComplete(true);
      setTimeout(() => {
        onComplete?.();
      }, 500);
      return;
    }

    const timer = setTimeout(() => {
      setVisibleMessages((prev) => [...prev, currentStep]);
      setCurrentStep((prev) => prev + 1);
    }, bootMessages[currentStep].delay);

    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  const getMessageColor = (type: BootMessage["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  const getStatusIndicator = (type: BootMessage["type"]) => {
    switch (type) {
      case "success":
        return "OK";
      case "warning":
        return "WARN";
      case "error":
        return "FAIL";
      default:
        return "INFO";
    }
  };

  const getStatusColor = (type: BootMessage["type"]) => {
    switch (type) {
      case "success":
        return "text-green-400";
      case "warning":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-blue-400";
    }
  };

  return (
    <div className={`font-mono text-sm ${className}`}>
      <div className="space-y-1">
        {visibleMessages.map((index) => {
          const msg = bootMessages[index];
          return (
            <div key={index} className={getMessageColor(msg.type)}>
              <span className="text-gray-500">[</span>
              <span className={getStatusColor(msg.type)}>
                {getStatusIndicator(msg.type)}
              </span>
              <span className="text-gray-500">]</span>{" "}
              {msg.text}
            </div>
          );
        })}
        {!isComplete && (
          <div className="text-green-400 animate-pulse">
            {showCursor ? "_" : " "}
          </div>
        )}
      </div>
    </div>
  );
}
