"use client";

import { TerminalLogin } from "@/components/auth/TerminalLogin";
import { loginUser, registerUser } from "@/lib/auth/actions";

export default function LoginPage() {
  const handleLogin = async (username: string, password: string) => {
    const result = await loginUser({ username, password });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    const result = await registerUser({ username, email, password });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <TerminalLogin onLogin={handleLogin} onRegister={handleRegister} />
    </div>
  );
}
