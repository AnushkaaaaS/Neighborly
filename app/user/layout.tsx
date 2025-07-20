'use client';

import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  BookOpenCheck,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@lib/supabase";
import Link from "next/link";

export default function UserLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/user/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: "My Bookings", href: "/user/my-bookings", icon: <BookOpenCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-white relative overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-800 border-b border-slate-700">
        <h2 className="text-xl font-bold">Neighborly</h2>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu (shown when toggled) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700">
          <nav className="flex flex-col p-4 space-y-4">
            {navItems.map(({ name, href, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-3 p-2 rounded-md transition ${pathname === href ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {icon}
                <span>{name}</span>
              </Link>
            ))}
            <div className="pt-4 border-t border-slate-700 space-y-3">
              <Link
                href="#"
                className="flex items-center gap-3 p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 p-2 rounded-md text-red-400 hover:text-white hover:bg-slate-700 transition w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:flex md:w-64 bg-slate-800 p-6 flex-col justify-between fixed h-full z-40">
        <div>
          <h2 className="text-xl font-bold mb-10">Neighborly</h2>
          <nav className="space-y-4">
            {navItems.map(({ name, href, icon }) => (
              <Link
                key={name}
                href={href}
                className={`flex items-center gap-3 p-2 rounded-md transition ${pathname === href ? 'bg-emerald-600/20 text-emerald-400' : 'text-gray-300 hover:text-white hover:bg-slate-700'}`}
              >
                {icon}
                <span>{name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-4">
          <Link
            href="#"
            className="flex items-center gap-3 p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700 transition"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 p-2 rounded-md text-red-400 hover:text-white hover:bg-slate-700 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 pt-16 md:pt-0 md:ml-64 p-6 md:p-10 space-y-10 overflow-y-auto ${mobileMenuOpen ? 'hidden md:block' : ''}`}>
        {children}
      </main>
    </div>
  );
}