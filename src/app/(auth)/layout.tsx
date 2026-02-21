import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Super-Task Vibe",
  description: "Sign in to Super-Task Vibe",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {children}
    </div>
  );
}
