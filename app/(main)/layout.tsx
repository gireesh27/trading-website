// File: app/(main)/layout.tsx
import "../globals.css";
import { Providers } from "../providers";
import type { ReactNode } from "react";
import { Inter } from "next/font/google"
import { MainNav } from "@/components/main-nav";
const inter = Inter({ subsets: ["latin"] })
export const metadata = {
  title: "Dashboard",
  description: "Main layout for logged-in pages",
};

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <MainNav />
          <main >{children}</main>
        </Providers>
        
      </body>
    </html>
  );
}
