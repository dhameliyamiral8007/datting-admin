import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { getToken, setToken } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { LayoutDashboard, Users, Bell, Send, LogOut, Settings, Menu, X, Bot } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (!getToken()) throw redirect({ to: "/login" });
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/ai-users", label: "AI Users", icon: Bot },
  { to: "/admin/notifications", label: "Templates", icon: Bell },
  { to: "/admin/send", label: "Send Notification", icon: Send },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  pathname,
  logout,
  onNavClick,
}: {
  pathname: string;
  logout: () => void;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-bold text-base">
          S
        </div>
        <div>
          <div className="font-semibold leading-tight">SPARQ</div>
          <div className="text-xs text-muted-foreground">Admin Panel</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-border shrink-0">
        <Button variant="outline" className="w-full justify-start gap-2" onClick={logout}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function logout() {
    setToken(null);
    navigate({ to: "/login" });
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Toaster />

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0">
        <SidebarContent pathname={pathname} logout={logout} />
      </aside>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile Drawer Panel ── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 flex flex-col bg-card border-r border-border shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>

        <SidebarContent
          pathname={pathname}
          logout={logout}
          onNavClick={() => setDrawerOpen(false)}
        />
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Header */}
        <header className="md:hidden h-14 shrink-0 border-b border-border flex items-center justify-between px-4 bg-card sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="p-2"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary text-primary-foreground grid place-items-center font-bold text-sm">
                S
              </div>
              <span className="font-semibold text-sm">SPARQ Admin</span>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="p-2 text-muted-foreground" onClick={logout} aria-label="Logout">
            <LogOut className="w-4 h-4" />
          </Button>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}