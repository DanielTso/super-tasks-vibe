"use client";

import { TerminalLogin } from "@/components/auth/TerminalLogin";
import { loginUser } from "@/lib/auth/actions";

export default function LoginPage() {
  const handleLogin = async (username: string, password: string) => {
    const result = await loginUser({ username, password });
    if (result.error) {
      throw new Error(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <TerminalLogin onLogin={handleLogin} />
    </div>
  );
}
