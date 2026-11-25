import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageTitle, TopicForm, type TopicValue } from "@/components/TopicForm";
import { ChatPanel } from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({ meta: [{ title: "AI Chat Tutor — StudyMate AI" }, { name: "description", content: "Ask your AI tutor anything about your lessons." }, { property: "og:title", content: "AI Chat Tutor — StudyMate AI" }, { property: "og:description", content: "Ask your AI tutor anything about your lessons." }] }),
  component: Page,
});

function Page() {
  const [t, setT] = useState<TopicValue | null>(null);
  if (!t) return (
    <div className="mx-auto max-w-2xl">
      <PageTitle emoji="💬" title="AI Chat Tutor" sub="Ask your AI tutor anything about your lessons." />
      <TopicForm onSubmit={setT} cta="Start" showNotes={false} />
    </div>
  );
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-3">
        <PageTitle emoji="💬" title="AI Chat Tutor" sub={`${t.subject} · ${t.topic}`} />
        <Button variant="outline" size="sm" onClick={() => setT(null)}>Change topic</Button>
      </div>
      <ChatPanel key={t.subject + t.topic} mode="tutor" subject={t.subject} topic={t.topic} botName="StudyMate Tutor" botEmoji="🦉"
        greeting={"Hi! I'm your StudyMate tutor. What are you studying, and what would you like help with?"} placeholder="Ask a question…"
        
        
        extraActions={(send, busy) => <Button variant="outline" size="sm" disabled={busy} onClick={() => send("Quiz me with one question on this topic.")}>🎲 Quiz me</Button>}
      />
    </div>
  );
}
