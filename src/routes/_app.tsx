import { useEffect } from "react";
import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { LoadingBlock } from "@/components/States";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const { loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: pathname }, replace: true });
    }
  }, [loading, isAuthenticated, navigate, pathname]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen">
        <LoadingBlock label="Preparing your EcoCharge workspace…" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
