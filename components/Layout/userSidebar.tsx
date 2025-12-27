"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Share2,
  MessageSquare,
  Wallet,
  MapPin,
  BarChart3,
  X,
} from "lucide-react";

import logo from "@/assets/logo.svg";
import userImg from "@/assets/user.svg";
import { useAuthStore } from "@/store/auth.store";

interface SidebarProps {
  sidebarOpen: boolean;
  isMobile: boolean;
  isAnimating?: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface NavLinkItem {
  icon: React.ElementType;
  label: string;
  url: string;
}

export default function Sidebar({
  sidebarOpen,
  isMobile,
  setSidebarOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems: NavLinkItem[] = [
    { icon: Home, label: "Home", url: "/dashboard" },
    { icon: Share2, label: "My Splitz", url: "/dashboard/mysplitz" },
    { icon: MessageSquare, label: "Messages", url: "/dashboard/messages" },
    { icon: Wallet, label: "Wallet", url: "/dashboard/wallet" },
    { icon: MapPin, label: "Nearby", url: "/dashboard/filter" },
    { icon: BarChart3, label: "Analytics", url: "/dashboard/analytics" },
  ];

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-white border-r z-50
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static transition-transform`}
      >
        <div className="h-full flex flex-col p-4">

          {/* Mobile close */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
          )}

          {/* Logo */}
          <Image src={logo} alt="Logo" className="h-10 w-auto mb-8" />

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.url ||
                pathname.startsWith(item.url + "/");

              const Icon = item.icon;

              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 p-2 rounded-lg
                    ${
                      isActive
                        ? "bg-green-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  <Icon size={18} />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="flex items-center gap-3 mt-4 border-t pt-4">
            <Image
              src={userImg}
              alt="User"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold">
                {user?.name ?? "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email ?? ""}
              </p>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
