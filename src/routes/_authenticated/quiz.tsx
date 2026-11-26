import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TopicForm, PageTitle, type TopicValue } from "@/components/TopicForm";
import { Button } from "@/components/ui/button";
import { makeQuiz, type QuizQ } from "@/lib/ai.functions";
import { recordActivity } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/quiz")({
  head: () => ({ meta: [{ title: "Practice Quiz — StudyMate AI" }, { name: "description", content: "AI practice quizzes with instant explanations." }, { property: "og:title", content: "Practice Quiz — StudyMate AI" }, { property: "og:description", content: "AI practice quizzes with instant explanations." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

type Diff = "easy" | "medium" | "hard";

function Page() {
  const [diff, setDiff] = useState<Diff>("medium");
  const [loading, setLoading] = useState(false);
  const [qs, setQs] = useState<QuizQ[] | null>(null);
  const [topic, setTopic] = useState<TopicValue | null>(null);
  const [picks, setPicks] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const qc = useQueryClient();

  async function gen(v: TopicValue) {
    setLoading(true);
    try {
      const q = await makeQuiz({ data: { subject: v.subject, topic: v.topic, difficulty: diff, ...(v.notes ? { notes: v.notes } : {}) } });
      setQs(q); setTopic(v); setPicks({}); setSubmitted(false);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setLoading(false); }
  }

  const score = qs ? qs.filter((q, i) => picks[i] === q.answer).length : 0;

  async function submit() {
    if (!qs || !topic) return;
    setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" });
    try { const pts = await recordActivity("quiz", topic.subject, topic.topic, score, qs.length); toast.success(`+${pts} points`); qc.invalidateQueries(); } catch { /* ignore */ }
  }

  if (!qs) return (
    <div className="mx-auto max-w-2xl">
      <PageTitle emoji="📝" title="Practice Quiz" sub="5 questions, instant feedback, points for every correct answer." />
      <TopicForm onSubmit={gen} loading={loading} cta="Start quiz">
        <div className="flex gap-2">{(["easy", "medium", "hard"] as const).map((d) => (
          <button key={d} type="button" onClick={() => setDiff(d)} className={`flex-1 rounded-xl border-2 py-2 text-sm font-semibold capitalize ${diff === d ? "border-primary bg-highlight" : "border-border"}`}>{d}</button>
        ))}</div>
      </TopicForm>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageTitle emoji="📝" title={topic?.topic ?? ""} sub={`${topic?.subject} · ${diff}`} />
      {submitted && (
        <div className="card-pop flex flex-wrap items-center justify-between gap-3 bg-highlight p-5">
          <div><div className="text-3xl font-extrabold">{score} / {qs.length}</div><div className="text-sm">{score === qs.length ? "Perfect! 🎯" : score >= qs.length * 0.6 ? "Nice work!" : "Keep going — review the explanations below."}</div></div>
          <div className="flex gap-2"><Button variant="outline" onClick={() => setQs(null)}>New quiz</Button><Button asChild variant="pop"><Link to="/explain">I don't get it</Link></Button></div>
        </div>
      )}
      {qs.map((q, i) => (
        <div key={i} className="card-pop p-5">
          <p className="font-semibold">{i + 1}. {q.question}</p>
          <div className="mt-3 grid gap-2">
            {q.choices.map((c, j) => {
              const picked = picks[i] === j; const right = j === q.answer;
              const cls = submitted ? (right ? "border-success bg-success/15" : picked ? "border-destructive bg-destructive/10" : "border-border opacity-70") : picked ? "border-primary bg-secondary" : "border-border hover:border-primary";
              return <button key={j} disabled={submitted} onClick={() => setPicks({ ...picks, [i]: j })} className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm transition-colors ${cls}`}>{String.fromCharCode(65 + j)}. {c}</button>;
            })}
          </div>
          {submitted && <p className="mt-3 rounded-lg bg-muted p-3 text-sm"><b>{picks[i] === q.answer ? "✓ Correct." : "✗ Not quite."}</b> {q.explanation}</p>}
        </div>
      ))}
      {!submitted && <Button variant="pop" size="lg" className="w-full" disabled={Object.keys(picks).length < qs.length} onClick={submit}>Submit answers</Button>}
    </div>
  );
}
