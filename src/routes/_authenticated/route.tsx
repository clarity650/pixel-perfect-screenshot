import { createFileRoute, Outlet, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/study";
import { LogOut } from "lucide-react";
import { activeStreak } from "@/lib/rewards";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: Layout,
});

const NAV = [
  { to: "/dashboard", label: "Home", e: "🏠" },
  { to: "/rewards", label: "Bunny & rewards", e: "🐰" },
  { to: "/flashcards", label: "Flashcards", e: "🃏" },
  { to: "/quiz", label: "Quiz", e: "📝" },
  { to: "/guide", label: "Guide", e: "🗺️" },
  { to: "/tutor", label: "Tutor", e: "💬" },
  { to: "/teach", label: "Teach AI", e: "🧑‍🏫" },
  { to: "/explain", label: "I Don't Get It", e: "❓" },
] as const;

function Layout() {
  const { data: p } = useQuery(profileQuery);
  const nav = useNavigate();
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-extrabold" style={{ fontFamily: "var(--font-display)" }}>StudyMate<span className="text-accent">.</span>AI</Link>
          <div className="ml-auto flex items-center gap-2 text-sm font-semibold">
            <span className="rounded-full bg-highlight px-2.5 py-0.5">🔥 {activeStreak(p)}</span>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-accent-foreground">⭐ {p?.points ?? 0}</span>
            <button aria-label="Sign out" className="rounded-full p-2 hover:bg-muted" onClick={async () => { await supabase.auth.signOut(); nav({ to: "/" }); }}><LogOut className="size-4" /></button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3 pb-2">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              activeProps={{ className: "bg-primary !text-primary-foreground" }}>
              <span className="mr-1">{n.e}</span>{n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8"><Outlet /></main>
    </div>
  );
}
