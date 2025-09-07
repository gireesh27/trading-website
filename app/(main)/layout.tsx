// File: app/(main)/layout.tsx
import "../globals.css";
import { Providers } from "../providers";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { MainNav } from "@/components/main-nav";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Trade-View",
  description: "Main layout for logged-in pages",
  icons: {
    icon: "/favicon.ico",
  },
}

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${inter.className} bg-[#131722] min-h-screen`}>
      {/* Navbar */}
      <MainNav />
      {/* Context Providers */}
      <Providers>
        <main className="pt-20">{children}</main> {/* adjust 20 to your navbar height */}
      </Providers>
    </div>
  );
}

