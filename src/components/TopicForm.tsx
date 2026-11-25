import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SUBJECTS } from "@/lib/study";
import { Loader2 } from "lucide-react";

export type TopicValue = { subject: string; topic: string; notes: string };

export function TopicForm({
  onSubmit, loading, cta, showNotes = true, children,
}: {
  onSubmit: (v: TopicValue) => void; loading?: boolean; cta: string; showNotes?: boolean; children?: React.ReactNode;
}) {
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <form
      className="card-pop space-y-4 p-5"
      onSubmit={(e) => { e.preventDefault(); if (topic.trim()) onSubmit({ subject, topic: topic.trim(), notes: notes.trim() }); }}
    >
      <div className="space-y-2">
        <Label>Subject</Label>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => (
            <button type="button" key={s} onClick={() => setSubject(s)}
              className={`rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors ${subject === s ? "border-foreground bg-primary text-primary-foreground" : "border-border bg-card hover:border-foreground"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="topic">Topic</Label>
        <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Mendelian genetics, Mole concept, Projectile motion" maxLength={200} />
      </div>
      {showNotes && (
        <div className="space-y-2">
          <Label htmlFor="notes">Your notes <span className="text-muted-foreground">(optional, paste from your module)</span></Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} maxLength={8000} />
        </div>
      )}
      {children}
      <Button type="submit" variant="pop" size="lg" disabled={loading || !topic.trim()}>
        {loading && <Loader2 className="animate-spin" />} {cta}
      </Button>
    </form>
  );
}

export function PageTitle({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold sm:text-4xl"><span className="mr-2">{emoji}</span>{title}</h1>
      <p className="mt-1 text-muted-foreground">{sub}</p>
    </div>
  );
}
