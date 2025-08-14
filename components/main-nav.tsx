"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useNotifications } from "@/contexts/notification-context";
import {
  FaHome,
  FaWallet,
  FaUser,
  FaShieldAlt,
  FaCog,
  FaBell,
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
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Navbar,
  NavBody,
  NavItems,
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
        {/* Left: Logo */}
        <div
          className={`flex items-center gap-2 shrink-0 min-w-[60px] transition-all duration-300 ${
            visible
              ? "opacity-100 scale-100"
              : "opacity-0 scale-0 pointer-events-none"
          }`}
        >
          <Link href="/dashboard">
            <FaRocket className="h-5 w-5 text-blue-500 drop-shadow-md" />
          </Link>
        </div>

        {/* Center: Nav Items */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <NavItems
            items={navItems}
            showLabels={visible}
            className="text-xs gap-1"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0 min-w-[120px] justify-end transition-all duration-300">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`relative transition-all duration-300 ${
                  visible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-blue-500/20"
                >
                  <FaBell className="h-5 w-5 text-white" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.slice(0, 5).map((n) => (
                <DropdownMenuItem key={n.id}>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">{n.title}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {n.message}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-blue-400 justify-center text-xs">
                View All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className={`transition-all duration-300 ${
                  visible ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              >
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-blue-400">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div>
                  <span className="text-xs">{user?.name}</span>
                  <p className="text-[10px] text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs">
                <FaUser className="mr-2 h-3 w-3" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <FaCog className="mr-2 h-3 w-3" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs">
                <FaShieldAlt className="mr-2 h-3 w-3" /> Security
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-500 text-xs"
              >
                <FaSignOutAlt className="mr-2 h-3 w-3" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </NavBody>

      {/* Mobile Nav */}
      <MobileNav className="md:hidden" visible>
        <MobileNavHeader>
          <Link href="/dashboard" className="flex items-center gap-2">
            <FaRocket className="h-5 w-5 text-blue-500" />
            {visible && (
              <span className="text-sm font-bold tracking-tight">
                TradeView
              </span>
            )}
          </Link>
          <MobileNavToggle
            isOpen={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          {navItems.map(({ name, link, icon: Icon }) => (
            <Link
              key={link}
              href={link}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-blue-400"
            >
              <Icon className="h-4 w-4" />
              {name}
            </Link>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}
