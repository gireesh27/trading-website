import type { ReactNode } from "react";
import { MainNav } from "@/components/main-nav";


export const metadata = {
  title: "Trade-View",
  description: "Main layout for logged-in pages",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#131722]">
      {/* Navbar */}
      <MainNav />
      <main className="pt-20">{children}</main>
    </div>
  );
}

