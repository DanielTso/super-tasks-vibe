import type { Metadata } from "next";
import { Wallpaper } from "@/components/Wallpaper";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Super-Task Vibe",
  description: "Personal macOS-inspired Task Manager",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full dark">
      <body className="h-full antialiased">
        <Wallpaper />
        {children}
      </body>
    </html>
  );
}
