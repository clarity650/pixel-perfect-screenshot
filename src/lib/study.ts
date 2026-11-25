import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const SUBJECTS = ["Biology", "Chemistry", "Physics", "Earth Science", "Mathematics", "Research", "ICT"] as const;

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle();
    if (error) throw error;
    return data;
  },
});

export const activitiesQuery = queryOptions({
  queryKey: ["activities"],
  queryFn: async () => {
    const { data, error } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(200);
    if (error) throw error;
    return data;
  },
});

export type Kind = "flashcards" | "quiz" | "guide" | "tutor" | "teach" | "explain";

export async function recordActivity(kind: Kind, subject: string, topic: string, score?: number, total?: number) {
  const { data, error } = await supabase.rpc("record_activity", {
    _kind: kind, _subject: subject, _topic: topic,
    ...(score !== undefined ? { _score: score } : {}),
    ...(total !== undefined ? { _total: total } : {}),
  });
  if (error) throw error;
  return data ?? 0;
}

export type Badge = { id: string; name: string; desc: string; emoji: string; earned: boolean };

export function computeBadges(
  profile: { points: number; streak: number } | null,
  acts: { kind: string; score: number | null; total: number | null; subject: string }[],
): Badge[] {
  const count = (k: string) => acts.filter((a) => a.kind === k).length;
  const perfect = acts.some((a) => a.kind === "quiz" && a.total && a.score === a.total);
  const subjects = new Set(acts.map((a) => a.subject)).size;
  const pts = profile?.points ?? 0;
  const streak = profile?.streak ?? 0;
  return [
    { id: "first", emoji: "🌱", name: "First Step", desc: "Finish any study activity", earned: acts.length >= 1 },
    { id: "cards", emoji: "🃏", name: "Card Shark", desc: "Review 5 flashcard sets", earned: count("flashcards") >= 5 },
    { id: "perfect", emoji: "🎯", name: "Bullseye", desc: "Get a perfect quiz score", earned: perfect },
    { id: "teacher", emoji: "🧑‍🏫", name: "Little Teacher", desc: "Teach Mate 3 times", earned: count("teach") >= 3 },
    { id: "curious", emoji: "❓", name: "Curious Mind", desc: "Use I Don't Get It 3 times", earned: count("explain") >= 3 },
    { id: "streak3", emoji: "🔥", name: "On Fire", desc: "Study 3 days in a row", earned: streak >= 3 },
    { id: "streak7", emoji: "⚡", name: "Unstoppable", desc: "Study 7 days in a row", earned: streak >= 7 },
    { id: "explorer", emoji: "🧭", name: "Explorer", desc: "Study 4 different subjects", earned: subjects >= 4 },
    { id: "pts500", emoji: "🏆", name: "Scholar", desc: "Earn 500 points", earned: pts >= 500 },
  ];
}

export function levelFor(points: number) {
  const level = Math.floor(points / 100) + 1;
  return { level, into: points % 100 };
}
