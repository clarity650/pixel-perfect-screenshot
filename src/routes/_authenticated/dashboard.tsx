import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { profileQuery, activitiesQuery, computeBadges, levelFor } from "@/lib/study";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "My progress — StudyMate AI" }, { name: "description", content: "Your points, streak, badges and study history." }, { property: "og:title", content: "My progress — StudyMate AI" }, { property: "og:description", content: "Your points, streak, badges and study history." }] }),
  component: Dashboard,
});

const LABEL: Record<string, string> = { flashcards: "🃏 Flashcards", quiz: "📝 Quiz", guide: "🗺️ Study guide", tutor: "💬 Tutor chat", teach: "🧑‍🏫 Taught Mate", explain: "❓ I Don't Get It" };

function Dashboard() {
  const { data: p } = useQuery(profileQuery);
  const { data: acts = [] } = useQuery(activitiesQuery);
  const badges = computeBadges(p ?? null, acts);
  const { level, into } = levelFor(p?.points ?? 0);
  const quizzes = acts.filter((a) => a.kind === "quiz" && a.total);
  const bySubject = new Map<string, { s: number; t: number }>();
  for (const q of quizzes) { const v = bySubject.get(q.subject) ?? { s: 0, t: 0 }; v.s += q.score ?? 0; v.t += q.total ?? 0; bySubject.set(q.subject, v); }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Hi, <span className="marker">{p?.display_name ?? "Student"}</span> 👋</h1>
        <p className="mt-1 text-muted-foreground">What will you learn today?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-pop p-5"><div className="text-sm text-muted-foreground">Level</div><div className="text-4xl font-extrabold">{level}</div><Progress value={into} className="mt-3" /><div className="mt-1 text-xs text-muted-foreground">{100 - into} pts to level {level + 1}</div></div>
        <div className="card-pop p-5"><div className="text-sm text-muted-foreground">Study streak</div><div className="text-4xl font-extrabold">🔥 {p?.streak ?? 0}</div><div className="mt-2 text-xs text-muted-foreground">Study every day to keep it going</div></div>
        <div className="card-pop p-5"><div className="text-sm text-muted-foreground">Total points</div><div className="text-4xl font-extrabold">⭐ {p?.points ?? 0}</div><div className="mt-2 text-xs text-muted-foreground">{acts.length} study sessions</div></div>
      </div>

      <section>
        <h2 className="mb-3 text-2xl font-bold">Start studying</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {([["/flashcards","🃏","Flashcards"],["/quiz","📝","Quiz"],["/guide","🗺️","Guide"],["/tutor","💬","Tutor"],["/teach","🧑‍🏫","Teach AI"],["/explain","❓","I Don't Get It"]] as const).map(([to,e,l]) => (
            <Link key={to} to={to} className="rounded-2xl border-2 border-foreground bg-card p-4 text-center font-semibold transition-transform hover:-translate-y-1 hover:shadow-pop"><div className="text-3xl">{e}</div><div className="mt-1 text-sm">{l}</div></Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-pop p-5">
          <h2 className="mb-3 text-xl font-bold">Badges</h2>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((b) => (
              <div key={b.id} title={b.desc} className={`rounded-xl border-2 p-3 text-center ${b.earned ? "border-foreground bg-highlight" : "border-dashed border-border opacity-50 grayscale"}`}>
                <div className="text-2xl">{b.emoji}</div><div className="mt-1 text-xs font-semibold">{b.name}</div><div className="text-[10px] text-muted-foreground">{b.desc}</div>
              </div>
            ))}
          </div>
        </section>
        <section className="card-pop p-5">
          <h2 className="mb-3 text-xl font-bold">Quiz scores by subject</h2>
          {bySubject.size === 0 ? <p className="text-sm text-muted-foreground">Take a quiz to see where you're strong and what to review.</p> : (
            <div className="space-y-3">
              {[...bySubject].map(([s, v]) => { const pct = Math.round((v.s / v.t) * 100); return (
                <div key={s}><div className="flex justify-between text-sm"><span className="font-medium">{s}</span><span className={pct < 60 ? "text-destructive font-semibold" : "font-semibold"}>{pct}%{pct < 60 ? " · review this" : ""}</span></div><Progress value={pct} className="mt-1" /></div>
              ); })}
            </div>
          )}
          <h3 className="mb-2 mt-6 text-lg font-bold">Recent activity</h3>
          <ul className="divide-y text-sm">
            {acts.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-2 py-2">
                <span className="truncate">{LABEL[a.kind] ?? a.kind} · <span className="text-muted-foreground">{a.topic}</span>{a.total ? ` · ${a.score}/${a.total}` : ""}</span>
                <span className="shrink-0 font-semibold text-accent">+{a.points}</span>
              </li>
            ))}
            {acts.length === 0 && <li className="py-2 text-muted-foreground">Nothing yet — pick a tool above!</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}
