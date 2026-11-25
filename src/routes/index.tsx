import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StudyMate AI — Your AI study buddy" },
      { name: "description", content: "Flashcards, quizzes, study guides, an AI chat tutor and Teach-to-AI mode that make studying personal." },
      { property: "og:title", content: "StudyMate AI — Your AI study buddy" },
      { property: "og:description", content: "Personalized AI learning support for students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { e: "🃏", t: "AI Flashcards", d: "Turn any lesson into active-recall cards." },
  { e: "📝", t: "Practice Quizzes", d: "Check yourself with instant explanations." },
  { e: "🗺️", t: "Study Guides", d: "Key terms, examples and a 20-minute plan." },
  { e: "💬", t: "AI Chat Tutor", d: "Ask anything, anytime, step by step." },
  { e: "🧑‍🏫", t: "Teach-to-AI", d: "Explain it to Mate — the best way to learn." },
  { e: "❓", t: "I Don't Get It", d: "Re-explained simpler, every time you ask." },
];

function Landing() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <header className="flex items-center justify-between">
        <div className="font-display text-xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>StudyMate<span className="text-accent">.</span>AI</div>
        <Button asChild variant="outline"><Link to="/auth">Sign in</Link></Button>
      </header>

      <section className="grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <div>
          <p className="mb-4 inline-block rounded-full bg-highlight px-3 py-1 text-sm font-semibold">Your personal AI study buddy</p>
          <h1 className="text-5xl font-extrabold leading-[1.05] sm:text-6xl">
            Study smarter with a <span className="marker">mate</span> who never gets tired of your questions.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            StudyMate AI turns your lessons into flashcards, quizzes and guides — and lets you learn by teaching.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="pop" size="lg"><Link to="/auth">Start studying — it's free</Link></Button>
          </div>
        </div>
        <div className="card-pop rotate-1 p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flashcard · Biology</div>
          <p className="mt-3 font-display text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>What is the phenotypic ratio of a monohybrid cross?</p>
          <div className="mt-6 rounded-xl border-2 border-dashed border-border bg-muted p-4 text-sm">3 : 1 — three dominant to one recessive.</div>
          <div className="mt-6 flex items-center justify-between text-sm">
            <span className="font-semibold">🔥 5-day streak</span><span className="rounded-full bg-accent px-3 py-1 font-semibold text-accent-foreground">+15 pts</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.t} className="rounded-2xl border-2 border-border bg-card p-5 shadow-soft">
            <div className="text-3xl">{f.e}</div>
            <h3 className="mt-3 text-xl font-bold">{f.t}</h3>
            <p className="mt-1 text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
