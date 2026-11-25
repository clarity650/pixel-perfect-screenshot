import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TopicForm, PageTitle, type TopicValue } from "@/components/TopicForm";
import { Button } from "@/components/ui/button";
import { makeFlashcards, type Flashcard } from "@/lib/ai.functions";
import { recordActivity } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/flashcards")({
  head: () => ({ meta: [{ title: "AI Flashcards — StudyMate AI" }, { name: "description", content: "Turn any lesson into active-recall flashcards." }, { property: "og:title", content: "AI Flashcards — StudyMate AI" }, { property: "og:description", content: "Turn any lesson into active-recall flashcards." }] }),
  component: Page,
});

function Page() {
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<Flashcard[] | null>(null);
  const [topic, setTopic] = useState<TopicValue | null>(null);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const qc = useQueryClient();

  async function gen(v: TopicValue) {
    setLoading(true);
    try {
      const c = await makeFlashcards({ data: { subject: v.subject, topic: v.topic, ...(v.notes ? { notes: v.notes } : {}) } });
      setCards(c); setTopic(v); setI(0); setFlipped(false); setKnown(new Set()); setDone(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setLoading(false); }
  }

  async function next(gotIt: boolean) {
    if (!cards || !topic) return;
    const k = new Set(known); if (gotIt) k.add(i); else k.delete(i); setKnown(k);
    if (i + 1 < cards.length) { setI(i + 1); setFlipped(false); return; }
    setDone(true);
    try { const pts = await recordActivity("flashcards", topic.subject, topic.topic, k.size, cards.length); toast.success(`Set complete! +${pts} points`); qc.invalidateQueries(); } catch { /* ignore */ }
  }

  if (!cards) return (<div className="mx-auto max-w-2xl"><PageTitle emoji="🃏" title="AI Flashcards" sub="Type a topic (or paste your notes) and get 10 cards to test your memory." /><TopicForm onSubmit={gen} loading={loading} cta="Make my flashcards" /></div>);

  const card = cards[i];
  return (
    <div className="mx-auto max-w-2xl">
      <PageTitle emoji="🃏" title={topic?.topic ?? ""} sub={`${topic?.subject} · card ${Math.min(i + 1, cards.length)} of ${cards.length}`} />
      {done ? (
        <div className="card-pop p-8 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-3 text-2xl font-bold">You knew {known.size} of {cards.length}</h2>
          <p className="mt-1 text-muted-foreground">{known.size === cards.length ? "Perfect recall!" : "Review the ones you missed and try again."}</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="pop" onClick={() => { setI(0); setFlipped(false); setDone(false); }}>Review again</Button>
            <Button variant="outline" onClick={() => setCards(null)}>New topic</Button>
          </div>
        </div>
      ) : card && (
        <>
          <button className="flip block h-72 w-full text-left" onClick={() => setFlipped(!flipped)} aria-label="Flip card">
            <div className={`flip-inner h-full ${flipped ? "flipped" : ""}`}>
              <div className="flip-face card-pop grid place-items-center p-8 text-center"><div><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question</div><p className="mt-3 text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{card.front}</p><p className="mt-6 text-sm text-muted-foreground">Tap to reveal</p></div></div>
              <div className="flip-face flip-back card-pop grid place-items-center bg-secondary p-8 text-center"><div><div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Answer</div><p className="mt-3 text-xl">{card.back}</p></div></div>
            </div>
          </button>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="outline" size="lg" onClick={() => next(false)} disabled={!flipped}>Still learning</Button>
            <Button variant="pop" size="lg" onClick={() => next(true)} disabled={!flipped}>Got it ✓</Button>
          </div>
        </>
      )}
    </div>
  );
}
