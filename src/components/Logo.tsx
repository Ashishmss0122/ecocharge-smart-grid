import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="relative grid size-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/40 transition-transform group-hover:scale-105">
        <Zap className="size-5 text-primary" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl bg-primary/20 blur-md" aria-hidden />
      </span>
      {!compact && (
        <span className="font-display text-lg font-bold tracking-tight">
          ECO<span className="text-primary">CHARGE</span>
        </span>
      )}
    </Link>
  );
}
