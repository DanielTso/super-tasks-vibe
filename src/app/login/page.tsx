import { TerminalLogin } from "@/components/auth/TerminalLogin";
import { loginAction, registerAction } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(username: string, password: string) {
    "use server";

    const result = await loginAction({ username, password });

    if (result.error) {
      throw new Error(result.error);
    }

    redirect("/");
  }

  async function handleRegister(username: string, email: string, password: string) {
    "use server";

    const result = await registerAction({ username, email, password });

    if (result.error) {
      throw new Error(result.error);
    }
  }

  return (
    <TerminalLogin
      onLogin={handleLogin}
      onRegister={handleRegister}
    />
  );
}
