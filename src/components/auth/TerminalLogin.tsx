"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TerminalLoginProps {
  onLogin?: (username: string, password: string) => Promise<void>;
  onRegister?: (username: string, email: string, password: string) => Promise<void>;
}

export function TerminalLogin({ onLogin, onRegister }: TerminalLoginProps) {
  const router = useRouter();
  const [bootSequence, setBootSequence] = useState(true);
  const [bootStep, setBootStep] = useState(0);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState<
    "username" | "email" | "password" | "confirm" | "loading" | "success" | "error"
  >("username");
  const [error, setError] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  // Boot sequence animation
  useEffect(() => {
    if (!bootSequence) return;

    const bootSteps = [
      { delay: 500, message: "Booting Super-Task Vibe Kernel v2.0..." },
      { delay: 800, message: "Loading authentication module..." },
      { delay: 600, message: "Loading task management engine..." },
      { delay: 400, message: "Loading AI voice assistant..." },
      { delay: 700, message: "Mounting database..." },
      { delay: 500, message: "Starting services..." },
      { delay: 1000, message: "System ready." },
    ];

    let currentStep = 0;
    const runBootSequence = async () => {
      for (const step of bootSteps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        setBootStep(currentStep + 1);
        currentStep++;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBootSequence(false);
    };

    runBootSequence();
  }, [bootSequence]);

  // Focus input on step change
  useEffect(() => {
    if (!bootSequence && step !== "loading" && step !== "success") {
      inputRef.current?.focus();
    }
  }, [step, bootSequence]);

  const handleKeyDown = useCallback(
    async (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();

        if (mode === "login") {
          if (step === "username") {
            if (formData.username.trim()) {
              // Check if user typed "register" to switch to registration mode
              if (formData.username.trim().toLowerCase() === "register") {
                setMode("register");
                setStep("username");
                setFormData({ username: "", email: "", password: "", confirmPassword: "" });
                setError("Registration mode activated. Enter your desired username.");
              } else {
                setStep("password");
                setError("");
              }
            }
          } else if (step === "password") {
            if (formData.password.trim()) {
              setStep("loading");
              setError("");

              try {
                if (onLogin) {
                  await onLogin(formData.username, formData.password);
                }
                setStep("success");
                setTimeout(() => {
                  router.push("/");
                }, 1000);
              } catch (err) {
                setStep("error");
                setError(err instanceof Error ? err.message : "Authentication failed");
                setTimeout(() => {
                  setStep("username");
                  setFormData({ username: "", email: "", password: "", confirmPassword: "" });
                }, 2000);
              }
            }
          }
        } else {
          // Registration flow
          if (step === "username") {
            if (formData.username.trim()) {
              setStep("email");
              setError("");
            }
          } else if (step === "email") {
            if (formData.email.trim()) {
              // Basic email validation
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(formData.email)) {
                setError("Invalid email format");
                return;
              }
              setStep("password");
              setError("");
            }
          } else if (step === "password") {
            if (formData.password.trim()) {
              if (formData.password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
              }
              setStep("confirm");
              setError("");
            }
          } else if (step === "confirm") {
            if (formData.confirmPassword === formData.password) {
              setStep("loading");
              setError("");

              try {
                if (onRegister) {
                  await onRegister(formData.username, formData.email, formData.password);
                }
                setMode("login");
                setStep("username");
                setFormData({ username: "", email: "", password: "", confirmPassword: "" });
                setError("Account created! Please login.");
              } catch (err) {
                setStep("error");
                setError(err instanceof Error ? err.message : "Registration failed");
                setTimeout(() => {
                  setStep("username");
                }, 2000);
              }
            } else {
              setError("Passwords do not match");
              setStep("password");
            }
          }
        }
      }
    },
    [formData, step, mode, onLogin, onRegister, router]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Boot sequence messages
  const bootMessages = [
    "Booting Super-Task Vibe Kernel v2.0...",
    "Loading authentication module...",
    "Loading task management engine...",
    "Loading AI voice assistant...",
    "Mounting database...",
    "Starting services...",
    "System ready.",
  ];

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Terminal Container */}
      <div className="w-full max-w-2xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden border border-gray-700">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center gap-2 border-b border-gray-700">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="ml-4 text-sm text-gray-400">super-task-vibe — bash — 80x24</span>
        </div>

        {/* Terminal Content */}
        <div className="p-6 min-h-[400px] bg-black">
          {/* Boot Sequence */}
          {bootSequence && (
            <div className="space-y-1">
              {bootMessages.slice(0, bootStep).map((msg, i) => (
                <div key={i} className="text-green-400 text-sm">
                  <span className="text-gray-500">[</span>
                  <span className="text-blue-400">OK</span>
                  <span className="text-gray-500">]</span> {msg}
                </div>
              ))}
              {bootStep < bootMessages.length && (
                <div className="text-green-400 text-sm animate-pulse">_</div>
              )}
            </div>
          )}

          {/* Login/Register Form */}
          {!bootSequence && (
            <div className="space-y-4">
              {/* ASCII Art Logo */}
              <pre className="text-green-400 text-xs md:text-sm leading-tight mb-6">
{`
  ____                       _         _                  _     _
 / ___| _   _ _ __   ___ _ __| |_ _   _| |__   __   __ _| |__ | |_
 \\___ \\| | | | '_ \\ / _ \\ '__| __| | | | '_ \\ / _ \\/ _\\| '_ \\| __|
  ___) | |_| | |_) |  __/ |  | |_| |_| | |_) | (_) | (_| | | | | |_
 |____/ \\__, | .__/ \\___|_|   \\__|\\__, |_.__/ \\___/ \\__,_|_| |_|\\__|
        |___/|_|                   |___/
`}
              </pre>

              {/* Welcome Message */}
              <div className="text-gray-400 text-sm mb-4">
                Welcome to Super-Task Vibe v2.0
                {mode === "register" && (
                  <span className="text-yellow-400 ml-2">[REGISTRATION MODE]</span>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-red-400 text-sm bg-red-900/20 p-2 rounded border border-red-800">
                  <span className="text-red-500">✗</span> {error}
                </div>
              )}

              {/* Success Message */}
              {step === "success" && (
                <div className="text-green-400 text-sm bg-green-900/20 p-2 rounded border border-green-800">
                  <span className="text-green-500">✓</span> Authentication successful. Redirecting...
                </div>
              )}

              {/* Username Input */}
              {(step === "username" || (step === "password" && mode === "login")) && (
                <div className="flex items-center gap-2">
                  <span className="text-green-400 whitespace-nowrap">
                    super-task login:
                  </span>
                  {step === "username" ? (
                    <input
                      ref={inputRef}
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                      autoFocus
                      spellCheck={false}
                      autoComplete="username"
                    />
                  ) : (
                    <span className="text-green-400">{formData.username}</span>
                  )}
                  {step === "username" && (
                    <span
                      className={cn(
                        "w-2 h-4 bg-green-400",
                        cursorVisible ? "opacity-100" : "opacity-0"
                      )}
                    />
                  )}
                </div>
              )}

              {/* Registration: Username Input */}
              {mode === "register" && step === "username" && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 whitespace-nowrap">
                    register username:
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                    autoFocus
                    spellCheck={false}
                    autoComplete="username"
                  />
                  <span
                    className={cn(
                      "w-2 h-4 bg-green-400",
                      cursorVisible ? "opacity-100" : "opacity-0"
                    )}
                  />
                </div>
              )}

              {/* Registration: Email Input */}
              {mode === "register" && step === "email" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      Username:
                    </span>
                    <span className="text-gray-400">{formData.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 whitespace-nowrap">
                      register email:
                    </span>
                    <input
                      ref={inputRef}
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                      autoFocus
                      spellCheck={false}
                      autoComplete="email"
                    />
                    <span
                      className={cn(
                        "w-2 h-4 bg-green-400",
                        cursorVisible ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Registration: Password Input */}
              {mode === "register" && step === "password" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      Username:
                    </span>
                    <span className="text-gray-400">{formData.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      Email:
                    </span>
                    <span className="text-gray-400">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 whitespace-nowrap">
                      register password:
                    </span>
                    <input
                      ref={inputRef}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                      autoFocus
                      spellCheck={false}
                      autoComplete="new-password"
                    />
                    <span
                      className={cn(
                        "w-2 h-4 bg-green-400",
                        cursorVisible ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Registration: Confirm Password Input */}
              {mode === "register" && step === "confirm" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      Username:
                    </span>
                    <span className="text-gray-400">{formData.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      Email:
                    </span>
                    <span className="text-gray-400">{formData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 whitespace-nowrap">
                      Confirm password:
                    </span>
                    <input
                      ref={inputRef}
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                      autoFocus
                      spellCheck={false}
                      autoComplete="new-password"
                    />
                    <span
                      className={cn(
                        "w-2 h-4 bg-green-400",
                        cursorVisible ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Login: Password Input */}
              {mode === "login" && step === "password" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      super-task login:
                    </span>
                    <span className="text-green-400">{formData.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-400 whitespace-nowrap">
                      Password:
                    </span>
                    <input
                      ref={inputRef}
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent text-green-400 outline-none font-mono"
                      autoFocus
                      spellCheck={false}
                      autoComplete="current-password"
                    />
                    <span
                      className={cn(
                        "w-2 h-4 bg-green-400",
                        cursorVisible ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Loading State */}
              {step === "loading" && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <span className="animate-spin">⟳</span>
                  <span>{mode === "login" ? "Authenticating..." : "Creating account..."}</span>
                </div>
              )}

              {/* Help Text */}
              <div className="text-gray-600 text-xs mt-8">
                Type your username and press Enter. Type your password and press Enter to login.
                <br />
                No account? Type &quot;register&quot; as username to create one.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-gray-600 text-xs text-center">
        Super-Task Vibe v2.0 | Built with Next.js + React + Turso
      </div>
    </div>
  );
}
