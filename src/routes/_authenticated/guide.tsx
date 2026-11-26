import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TopicForm, PageTitle, type TopicValue } from "@/components/TopicForm";
import { Button } from "@/components/ui/button";
import { makeGuide } from "@/lib/ai.functions";
import { recordActivity } from "@/lib/study";

export const Route = createFileRoute("/_authenticated/guide")({
  head: () => ({ meta: [{ title: "Study Guide — StudyMate AI" }, { name: "description", content: "Personalized AI study guides with key terms, examples and a study plan." }, { property: "og:title", content: "Study Guide — StudyMate AI" }, { property: "og:description", content: "Personalized AI study guides with key terms, examples and a study plan." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] }),
  component: Page,
});

function Page() {
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<string | null>(null);
  const [topic, setTopic] = useState<TopicValue | null>(null);
  const qc = useQueryClient();
  async function gen(v: TopicValue) {
    setLoading(true);
    try {
      const g = await makeGuide({ data: { subject: v.subject, topic: v.topic, ...(v.notes ? { notes: v.notes } : {}) } });
      setGuide(g); setTopic(v);
      const pts = await recordActivity("guide", v.subject, v.topic); toast.success(`+${pts} points`); qc.invalidateQueries();
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } finally { setLoading(false); }
  }
  if (!guide) return (<div className="mx-auto max-w-2xl"><PageTitle emoji="🗺️" title="Study Guide" sub="Get a clear, personalized guide for any lesson." /><TopicForm onSubmit={gen} loading={loading} cta="Make my study guide" /></div>);
  return (
    <div className="mx-auto max-w-3xl">
      <PageTitle emoji="🗺️" title={topic?.topic ?? ""} sub={topic?.subject ?? ""} />
      <article className="card-pop prose-chat p-6 sm:p-8"><ReactMarkdown>{guide}</ReactMarkdown></article>
      <div className="mt-4 flex gap-3"><Button variant="outline" onClick={() => setGuide(null)}>New topic</Button><Button variant="highlight" onClick={() => window.print()}>Print</Button></div>
    </div>
  );
}
