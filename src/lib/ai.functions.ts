import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MODEL = "openai/gpt-6.1-sol" as const;

const BASE = `You are StudyMate AI, a friendly, accurate study helper for Grade 9 Science, Technology and Engineering (STE) students in the Philippines (DepEd curriculum). Use clear, simple English suitable for 14-15 year olds. Be factually careful; if unsure, say so.`;

async function ask(instructions: string, input: { role: "user" | "assistant"; content: string }[]) {
  const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
  try {
    const res = await generateResponse({ model: MODEL, instructions: `${BASE}\n\n${instructions}`, input });
    const parts: string[] = [];
    for (const item of (res as { output?: unknown[] }).output ?? []) {
      const it = item as { type?: string; content?: { type?: string; text?: string }[] };
      if (it.type === "message") for (const c of it.content ?? []) if (c.type === "output_text" && c.text) parts.push(c.text);
    }
    return parts.join("\n").trim();
  } catch (e) {
    if (e instanceof GatewayError) {
      console.error("AI error", e.code, e.httpStatus);
      if (e.httpStatus === 429) throw new Error("StudyMate is busy right now. Please try again in a minute.");
      if (e.httpStatus === 402) throw new Error("AI credits have run out. Please tell your teacher or app owner.");
    }
    throw new Error("StudyMate couldn't answer just now. Please try again.");
  }
}

function parseJson<T>(text: string): T {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (m?.[1] ?? text).trim();
  const start = raw.search(/[[{]/);
  return JSON.parse(raw.slice(start)) as T;
}

const topicInput = z.object({
  subject: z.string().min(1).max(60),
  topic: z.string().min(1).max(200),
  notes: z.string().max(8000).optional(),
});
const ctx = (d: z.infer<typeof topicInput>) =>
  `Subject: ${d.subject}\nTopic: ${d.topic}${d.notes ? `\nStudent's notes/lesson text:\n${d.notes}` : ""}`;

export type Flashcard = { front: string; back: string };
export const makeFlashcards = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => topicInput.parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      `Create 10 active-recall flashcards. Front: a short question or term. Back: a concise answer (max 2 sentences). Reply ONLY with JSON: {"cards":[{"front":"...","back":"..."}]}`,
      [{ role: "user", content: ctx(data) }],
    );
    return parseJson<{ cards: Flashcard[] }>(text).cards.slice(0, 15);
  });

export type QuizQ = { question: string; choices: string[]; answer: number; explanation: string };
export const makeQuiz = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => topicInput.extend({ difficulty: z.enum(["easy", "medium", "hard"]) }).parse(d))
  .handler(async ({ data }) => {
    const text = await ask(
      `Write a ${data.difficulty} 5-question multiple-choice practice quiz. Each has 4 choices, the index (0-3) of the correct one, and a 1-2 sentence explanation. Reply ONLY with JSON: {"questions":[{"question":"...","choices":["a","b","c","d"],"answer":0,"explanation":"..."}]}`,
      [{ role: "user", content: ctx(data) }],
    );
    return parseJson<{ questions: QuizQ[] }>(text).questions.slice(0, 10);
  });

export const makeGuide = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => topicInput.parse(d))
  .handler(async ({ data }) =>
    ask(
      `Write a personalized study guide in Markdown with these sections: ## Big Idea (2-3 sentences), ## Key Terms (bulleted, bold term + meaning), ## Step-by-Step Explanation, ## Worked Example (if applicable), ## Common Mistakes, ## Quick Self-Check (3 questions, answers hidden at the end under "Answers"), ## 20-Minute Study Plan.`,
      [{ role: "user", content: ctx(data) }],
    ),
  );

const chatInput = z.object({
  mode: z.enum(["tutor", "teach", "explain"]),
  subject: z.string().max(60),
  topic: z.string().max(200),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(6000) })).min(1).max(40),
});

const MODES = {
  tutor: `Act as a patient AI chat tutor. Answer the student's questions about the topic, check understanding with a short follow-up question, and guide them to think rather than just giving homework answers. Use Markdown.`,
  explain: `This is the "I Don't Get It" helper. The student is confused. Explain the concept again in a DIFFERENT, simpler way each time: use an everyday Filipino-context analogy, short steps, and one tiny example. Keep it under 180 words. End by asking which part is still unclear. Use Markdown.`,
  teach: `This is Teach-to-AI mode (the Protégé Effect). YOU are a curious student named "Mate" who does NOT know the topic. The real student is your teacher. Ask simple, genuine questions, ask them to explain in their own words, and gently ask "why?" or "can you give an example?". Never lecture or give the full answer. If they say something wrong, act confused and ask a question that leads them to notice it. Keep replies short (2-4 sentences). If the student writes "FEEDBACK", step out of character and give: ## How well you taught it (score out of 10), ## What you explained clearly, ## What was missing or incorrect, ## What to review next.`,
} as const;

export const chat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => chatInput.parse(d))
  .handler(async ({ data }) =>
    ask(`${MODES[data.mode]}\n\nSubject: ${data.subject || "General"}. Topic: ${data.topic || "whatever the student brings up"}.`, data.messages),
  );
