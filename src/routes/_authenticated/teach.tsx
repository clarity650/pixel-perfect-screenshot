import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle, TopicForm, type TopicValue } from "@/components/TopicForm";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/teach")({
  head: () => ({ meta: [{ title: "Teach-to-AI — StudyMate AI" }, { name: "description", content: "Learn by teaching: explain a topic to Mate in your own words." }, { property: "og:title", content: "Teach-to-AI — StudyMate AI" }, { property: "og:description", content: "Learn by teaching: explain a topic to Mate in your own words." }] }),
  component: Page,
});

function Page() {
  const [t, setT] = useState<TopicValue | null>(null);
  if (!t) return (
    <div className="mx-auto max-w-2xl">
      <PageTitle emoji="🧑‍🏫" title="Teach-to-AI" sub="Learn by teaching: explain a topic to Mate in your own words." />
      <TopicForm onSubmit={setT} cta="Start" showNotes={false} />
    </div>
  );
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <PageTitle emoji="🧑‍🏫" title="Teach-to-AI" sub={`${t.subject} · ${t.topic}`} />
        <Button variant="outline" size="sm" onClick={() => setT(null)}>Change topic</Button>
      </div>
      <ChatPanel key={t.subject + t.topic} mode="teach" subject={t.subject} topic={t.topic} botName="Mate" botEmoji="🐣"
        greeting={"Hi teacher! 👋 I'm Mate and I don't know anything about this topic yet. Can you explain it to me like I'm new? What is it about?"} placeholder="Explain it in your own words…"
        extraActions={(send, busy) => <Button variant="highlight" size="sm" disabled={busy} onClick={() => send("FEEDBACK")}>📋 How did I teach?</Button>}
        
        
      />
    </div>
  );
}
