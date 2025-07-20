'use client';

import { ReactNode, useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Wrench,
  Star,
  Settings,
  LogOut,
  Calendar,
  Menu,
  User,
  X
} from "lucide-react";
import { supabase } from "@lib/supabase";
import clsx from "clsx";

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAndSaveTokens = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (!user || error || !user.user_metadata?.is_provider) {
        router.push("/login");
        return;
      }

      const tokenParam = searchParams.get("token");
      if (tokenParam) {
        try {
          const tokens = JSON.parse(decodeURIComponent(tokenParam));
          const expiry = tokens.expiry_date || Date.now() + tokens.expires_in * 1000;

          await fetch("/api/google-auth/save-tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              access_token: tokens.access_token,
              refresh_token: tokens.refresh_token,
              expiry_date: expiry,
            }),
          });

          router.replace("/provider/dashboard");
        } catch (err) {
          console.error("Failed to save Google tokens", err);
        }
      }

      setLoading(false);
    };

    fetchUserAndSaveTokens();
  }, [router, searchParams]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );

  const navItems = [
    { name: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
          { name: "Your Profile", href: "/provider/profile", icon: User }, // ✅ New item

    { name: "Bookings", href: "/provider/bookings", icon: CalendarDays },
    { name: "Services", href: "/provider/services", icon: Wrench },
    { name: "Calendar", href: "/provider/calendar", icon: Calendar },
    { name: "Reviews", href: "/provider/reviews", icon: Star },

  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Mobile Top Navbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
        <h2 className="text-xl font-bold">Neighborly</h2>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar (overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <div 
            className="fixed top-16 right-0 w-64 h-[calc(100vh-4rem)] bg-slate-800 p-4 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="space-y-2 mb-6">
              {navItems.map(({ name, href, icon: Icon }) => {
                const isActive = pathname === href;

                return (
                  <a
                    key={name}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 text-sm transition rounded-md px-3 py-3",
                      isActive
                        ? "bg-slate-700 text-white font-semibold"
                        : "text-gray-300 hover:text-white hover:bg-slate-700"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{name}</span>
                  </a>
                );
              })}
            </nav>

            <div className="space-y-2 border-t border-slate-700 pt-4">
              <a
                href="/provider/settings"
                onClick={() => setMobileMenuOpen(false)}
                className={clsx(
                  "flex items-center gap-3 text-sm px-3 py-3 rounded-md transition",
                  pathname === "/provider/settings"
                    ? "bg-slate-700 text-white font-semibold"
                    : "text-gray-300 hover:text-white hover:bg-slate-700"
                )}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-sm text-red-400 hover:text-white px-3 py-3 transition w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-slate-800 p-6 flex-col justify-between fixed h-full">
        <div>
          <h2 className="text-xl font-bold mb-10">Neighborly</h2>
          <nav className="space-y-2">
            {navItems.map(({ name, href, icon: Icon }) => {
              const isActive = pathname === href;

              return (
                <a
                  key={name}
                  href={href}
                  className={clsx(
                    "flex items-center gap-3 text-sm transition rounded-md px-3 py-3",
                    isActive
                      ? "bg-slate-700 text-white font-semibold"
                      : "text-gray-300 hover:text-white hover:bg-slate-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{name}</span>
                </a>
              );
            })}
          </nav>
        </div>

        <div className="space-y-2 border-t border-slate-700 pt-4">
          <a
            href="/provider/settings"
            className={clsx(
              "flex items-center gap-3 text-sm px-3 py-3 rounded-md transition",
              pathname === "/provider/settings"
                ? "bg-slate-700 text-white font-semibold"
                : "text-gray-300 hover:text-white hover:bg-slate-700"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm text-red-400 hover:text-white px-3 py-3 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Page Content */}
      <main className={clsx(
        "pt-16 md:pt-0 md:ml-64 min-h-screen",
        mobileMenuOpen ? "blur-sm" : ""
      )}>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}