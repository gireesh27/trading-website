// File: app/(main)/layout.tsx
import "../globals.css";
import { Providers } from "../providers";
import type { ReactNode } from "react";
import { MainNav } from "@/components/main-nav";

export const metadata = {
  title: "Dashboard",
  description: "Main layout for logged-in pages",
};

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-[#0f1115] text-white relative overflow-hidden">
        {/* Glow/ambient light gradient effects */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-purple-500 opacity-30 rounded-full blur-[160px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-400 opacity-20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pink-500 opacity-10 rounded-full blur-[100px]" />
        </div>

        <Providers>
          <MainNav />
          <main className="p-4 md:p-6">{children}</main>
        </Providers>
        
      </body>
    </html>
  );
}
