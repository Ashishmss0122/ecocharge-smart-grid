import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  BarChart3,
  Building2,
  Clock,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Menu,
  Shield,
  UserRound,
  X,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABEL } from "@/services/types";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard };

const BASE_NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/stations", label: "Find Stations", icon: MapPinned },
  { to: "/history", label: "History", icon: Clock },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { profile, roles, signOut } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const nav = [...BASE_NAV];
  if (roles.includes("station_owner"))
    nav.splice(3, 0, { to: "/owner", label: "My Stations", icon: Building2 });
  if (roles.includes("admin"))
    nav.splice(3, 0, { to: "/admin", label: "Admin Console", icon: Shield });

  async function handleSignOut() {
    await signOut();
    router.navigate({ to: "/", replace: true });
  }

  const primaryRole = roles.includes("admin")
    ? "admin"
    : roles.includes("station_owner")
      ? "station_owner"
      : "ev_user";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden border-r border-border bg-card/40 lg:flex lg:h-screen lg:flex-col lg:sticky lg:top-0">
        <div className="px-6 py-6">
          <Logo />
        </div>
        <SidebarNav items={nav} />
        <UserBox
          name={profile?.name ?? "EcoCharge user"}
          role={ROLE_LABEL[primaryRole]}
          onSignOut={handleSignOut}
        />
      </aside>

      <div className="lg:hidden">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-xl border border-border"
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        {open && (
          <div className="border-b border-border bg-card/70 backdrop-blur-xl">
            <SidebarNav items={nav} onNavigate={() => setOpen(false)} />
            <UserBox
              name={profile?.name ?? "EcoCharge user"}
              role={ROLE_LABEL[primaryRole]}
              onSignOut={handleSignOut}
            />
          </div>
        )}
      </div>

      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
    </div>
  );
}

function SidebarNav({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 px-3 py-2">
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeProps={{ className: "bg-primary/12 text-primary" }}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function UserBox({
  name,
  role,
  onSignOut,
}: {
  name: string;
  role: string;
  onSignOut: () => void;
}) {
  return (
    <div className="border-t border-border p-4">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="mt-3 w-full" onClick={onSignOut}>
        <LogOut className="size-4" /> Sign out
      </Button>
    </div>
  );
}

export { BarChart3 };
