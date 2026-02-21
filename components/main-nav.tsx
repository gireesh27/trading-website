"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import {
  FaHome,
  FaWallet,
  FaExclamationTriangle,
  FaClock,
  FaChartPie,
  FaChartBar,
  FaNewspaper,
  FaSignOutAlt,
  FaRocket,
} from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Navbar,
  NavBody,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
} from "@/components/ui/resizable-navbar";

const navItems = [
  { name: "Dashboard", link: "/dashboard", icon: FaHome },
  { name: "Markets", link: "/markets", icon: FaChartBar },
  { name: "Crypto", link: "/crypto", icon: FaChartPie },
  { name: "Community", link: "/community", icon: FaNewspaper },
  { name: "Watchlist", link: "/watchlist", icon: FaChartBar },
  { name: "News", link: "/news", icon: FaNewspaper },
  { name: "Orders", link: "/orders", icon: FaClock },
  { name: "Alerts", link: "/alerts", icon: FaExclamationTriangle },
  { name: "Wallet", link: "/wallet", icon: FaWallet },
  { name: "Holdings", link: "/holdings", icon: FaChartPie },
];

export function MainNav() {
  const { user, logout } = useAuth();
  const { notifications, unreadCount } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/auth");
  };

  return (
    <Navbar
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${visible ? "py-3" : "py-1"}`}
    >
      {/* Desktop Nav */}
      <NavBody className="hidden md:flex items-center px-4 gap-4">
        {/* Center: Nav Items */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div className={`flex items-center ${visible ? "gap-1" : "gap-0.5"}`}>
            {navItems.map(({ name, link, icon: Icon }) => {
              const isActive = pathname === link;
              return (
                <Link
                  key={link}
                  href={link}
                  className={`group flex items-center gap-1 ${visible ? "px-3 py-2" : "px-2 py-1"
                    } rounded-lg transition-all duration-300 ease-in-out text-xs font-medium transform hover:scale-105
                    ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 dark:hover:text-indigo-400"
                    }`}
                >
                  <Icon
                    className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-white" : "group-hover:text-indigo-500"
                      }`}
                  />
                  {visible && <span className="whitespace-nowrap">{name}</span>}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 min-w-[120px] justify-end transition-all duration-300">
          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`transition-all duration-300 ${visible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                  }`}
              >
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-blue-400 hover:ring-indigo-400 transition-colors duration-200">
                  <AvatarImage
                    src={user?.image || "/images/user.png"} // fallback if no image
                    alt={user?.name || "User "}
                  />
                  <AvatarFallback>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div>
                  <span className="text-xs">{user?.name || "Guest"}</span>
                  <p className="text-[10px] text-muted-foreground">
                    {user?.email || "guest@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 text-xs focus:bg-red-50"
              >
                <FaSignOutAlt className="mr-2 h-3 w-3" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </NavBody>

      {/* Mobile Nav */}
      {/* ================= MOBILE NAV ================= */}
      <div className="md:hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 
    
    border-b border-zinc-800 backdrop-blur-xl">

          <Link href="/dashboard" className="flex items-center gap-2">
            <FaRocket className="h-5 w-5 text-indigo-500" />
            <span className="text-base font-semibold tracking-tight text-white">
              TradeView
            </span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-zinc-800 transition"
          >
            <div className="space-y-1">
              <span className={`block h-0.5 w-5 bg-white transition ${mobileOpen ? "rotate-45 translate-y-1.5" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${mobileOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 bg-white transition ${mobileOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
            </div>
          </button>
        </div>

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <div
          className={`fixed top-0 left-0 h-full w-[280px] 
    bg-gradient-to-b from-zinc-950 via-zinc-900 to-black
    border-r border-zinc-800
    shadow-2xl z-50 transform transition-transform duration-300 ease-out
    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <span className="text-lg font-semibold text-white">Menu</span>
            <button
              onClick={() => setMobileOpen(false)}
              className="text-zinc-400 hover:text-red-400 transition"
            >
              ✕
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1 px-3 py-4">
            {navItems.map(({ name, link, icon: Icon }) => {
              const isActive = pathname === link;

              return (
                <Link
                  key={link}
                  href={link}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
              ${isActive
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                >
                  <Icon
                    className={`h-4 w-4 ${isActive ? "text-white" : "text-indigo-400"
                      }`}
                  />
                  <span>{name}</span>
                </Link>
              );
            })}
          </div>

          {/* Bottom Section */}
          <div className="absolute bottom-0 w-full border-t border-zinc-800 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-500 transition"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </Navbar>
  );
}
