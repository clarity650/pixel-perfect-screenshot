import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle, TopicForm, type TopicValue } from "@/components/TopicForm";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/explain")({
  head: () => ({ meta: [{ title: "I Don't Get It — StudyMate AI" }, { name: "description", content: "Stuck? Get a simpler explanation, as many times as you need." }, { property: "og:title", content: "I Don't Get It — StudyMate AI" }, { property: "og:description", content: "Stuck? Get a simpler explanation, as many times as you need." }] }),
  component: Page,
});

function Page() {
  const [t, setT] = useState<TopicValue | null>(null);
  if (!t) return (
    <div className="mx-auto max-w-2xl">
      <PageTitle emoji="❓" title="I Don't Get It" sub="Stuck? Get a simpler explanation, as many times as you need." />
      <TopicForm onSubmit={setT} cta="Start" showNotes={false} />
    </div>
  );
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <PageTitle emoji="❓" title="I Don't Get It" sub={`${t.subject} · ${t.topic}`} />
        <Button variant="outline" size="sm" onClick={() => setT(null)}>Change topic</Button>
      </div>
      <ChatPanel key={t.subject + t.topic} mode="explain" subject={t.subject} topic={t.topic} botName="StudyMate" botEmoji="💡"
        greeting={"No worries — everyone gets stuck! Tell me what part confuses you, or just tap **I still don't get it** after any explanation."} placeholder="What's confusing you?"
        
        extraActions={(send, busy) => (<><Button variant="highlight" size="sm" disabled={busy} onClick={() => send("I still don't get it. Explain it another, simpler way.")}>🤔 I still don't get it</Button><Button variant="outline" size="sm" disabled={busy} onClick={() => send("Give me a real-life example.")}>🌏 Real-life example</Button></>)}
        
      />
    </div>
  );
}
