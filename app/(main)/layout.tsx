import "../globals.css";
import { Providers } from "../providers";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { MainNav } from "@/components/main-nav";
import { AuthProvider, useAuth } from "@/contexts/auth-context";

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
       <AuthProvider>
        <main className="pt-20">{children}</main>
      </AuthProvider>
    </div>
  );
}

