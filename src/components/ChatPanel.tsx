import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chat } from "@/lib/ai.functions";
import { recordActivity, type Kind } from "@/lib/study";

type Msg = { role: "user" | "assistant"; content: string };

export function ChatPanel({
  mode, subject, topic, greeting, botName, botEmoji, placeholder, extraActions,
}: {
  mode: "tutor" | "teach" | "explain"; subject: string; topic: string; greeting: string;
  botName: string; botEmoji: string; placeholder: string;
  extraActions?: (send: (text: string) => void, busy: boolean) => React.ReactNode;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", content: greeting }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const qc = useQueryClient();
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);
  useEffect(() => { if (!busy) inputRef.current?.focus(); }, [busy]);

  async function send(content: string) {
    if (!content.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content: content.trim() }];
    setMsgs(next); setText(""); setBusy(true);
    try {
      const reply = await chat({ data: { mode, subject, topic, messages: next.slice(-30) } });
      setMsgs([...next, { role: "assistant", content: reply }]);
      const userTurns = next.filter((m) => m.role === "user").length;
      if (!rewarded && userTurns >= 3) {
        setRewarded(true);
        const pts = await recordActivity(mode as Kind, subject || "General", topic || "Open chat");
        toast.success(`+${pts} points for studying!`);
        qc.invalidateQueries();
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
      setMsgs(next.slice(0, -1)); setText(content);
    } finally { setBusy(false); }
  }

  return (
    <div className="card-pop flex h-[min(70vh,640px)] flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {msgs.map((m, i) => m.role === "assistant" ? (
          <div key={i} className="flex gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-highlight text-lg">{botEmoji}</div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-muted-foreground">{botName}</div>
              <div className="prose-chat text-[15px] leading-relaxed"><ReactMarkdown>{m.content}</ReactMarkdown></div>
            </div>
          </div>
        ) : (
          <div key={i} className="flex justify-end">
            <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-[15px] text-primary-foreground">{m.content}</div>
          </div>
        ))}
        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" /> {botName} is thinking…</div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-border bg-muted/60 p-3">
        {extraActions && <div className="mb-2 flex flex-wrap gap-2">{extraActions(send, busy)}</div>}
        <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); send(text); }}>
          <Textarea ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={placeholder}
            className="min-h-0 resize-none bg-card"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(text); } }} />
          <Button type="submit" variant="pop" size="icon" className="size-11 shrink-0" disabled={busy || !text.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}
