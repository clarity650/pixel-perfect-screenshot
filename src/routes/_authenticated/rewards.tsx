import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Flame, Gift, LockKeyhole, RotateCcw, Sparkles, ArrowRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Bunny } from "@/components/Bunny";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { profileQuery } from "@/lib/study";
import { activeStreak, asFur, asOutfit, FURS, isOutfitUnlocked, manilaDate, OUTFITS, type Fur, type OutfitId } from "@/lib/rewards";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({ meta: [
    { title: "Bunny & rewards — StudyMate AI" },
    { name: "description", content: "Earn daily study rewards, unlock bunny outfits and personalize your study companion." },
    { property: "og:title", content: "Bunny & rewards — StudyMate AI" },
    { property: "og:description", content: "Your study-day rewards and bunny wardrobe." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: Rewards,
});

function Rewards() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const qc = useQueryClient();
  const [fur, setFur] = useState<Fur>(() => asFur(profile?.bunny_fur));
  const [outfit, setOutfit] = useState<OutfitId>(() => asOutfit(profile?.bunny_outfit));
  const [filter, setFilter] = useState<"all" | "unlocked">("all");
  const [saving, setSaving] = useState(false);
  const days = profile?.study_days ?? 0;
  const streak = activeStreak(profile);
  const todayDone = profile?.last_study_date === manilaDate();
  const selection = OUTFITS.find((o) => o.id === outfit) ?? OUTFITS[0];
  const unlocked = isOutfitUnlocked(outfit, days);
  const changed = fur !== asFur(profile?.bunny_fur) || outfit !== asOutfit(profile?.bunny_outfit);
  const next = OUTFITS.find((o) => o.days > days);
  const unlockedCount = OUTFITS.filter((o) => isOutfitUnlocked(o.id, days)).length;

  async function save() {
    if (!unlocked || saving || !profile) return;
    setSaving(true);
    try {
      const { error } = await supabase.rpc("save_bunny", { _fur: fur, _outfit: outfit });
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: profileQuery.queryKey });
      toast.success("Your bunny’s look is saved!");
    } catch { toast.error("Couldn’t save this look. Please try again."); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary"><Gift className="size-4" /> A little joy for showing up</p><h1 className="text-4xl sm:text-5xl">Bunny & rewards</h1></div>
        <div className="flex items-center gap-2 rounded-full bg-highlight px-4 py-2 text-sm font-semibold"><Flame className="size-4 text-primary" /> {streak}-day streak</div>
      </div>

      <section aria-label="Consistency rewards" className="grid gap-4 border-y border-border py-5 sm:grid-cols-3">
        <div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/25"><Check className="size-5 text-success" /></span><div><div className="font-semibold">{todayDone ? "Today’s bonus earned" : "Today’s study bonus"}</div><div className="text-sm text-muted-foreground">{todayDone ? "+10 points · lovely work!" : "+10 points · your first activity today"}</div></div></div>
        <div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-highlight"><Flame className="size-5 text-primary" /></span><div><div className="font-semibold">Keep your streak growing</div><div className="text-sm text-muted-foreground">3 days: +25 pts · 7 days: +50 pts</div></div></div>
        <div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary"><Sparkles className="size-5" /></span><div><div className="font-semibold">{days} study {days === 1 ? "day" : "days"} collected</div><div className="text-sm text-muted-foreground">{unlockedCount} of {OUTFITS.length} outfits unlocked</div></div></div>
      </section>

      <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <section aria-label="Your bunny" className="text-center lg:sticky lg:top-36">
          <div className="flex min-h-7 justify-center text-xs font-semibold text-primary" aria-live="polite">{!unlocked ? <span className="flex items-center gap-1.5"><LockKeyhole className="size-3.5" /> Trying on · not yet unlocked</span> : changed ? "Trying on a new look" : "Your saved look"}</div>
          <div className="mx-auto h-80 w-full max-w-80 sm:h-96 sm:max-w-96"><Bunny fur={fur} outfit={outfit} /></div>
          <h2 className="text-2xl">{selection.name}</h2>
          <div className="mt-4 flex justify-center gap-3" role="group" aria-label="Bunny fur color">
            {FURS.map((f) => <Button key={f.id} variant="outline" size="icon" title={`${f.name} fur`} aria-label={`${f.name} fur`} aria-pressed={fur === f.id} disabled={saving} onClick={() => setFur(f.id)} className={`fur-swatch-${f.id} rounded-full border-2 ${fur === f.id ? "border-primary ring-2 ring-ring/20" : "border-border"}`}>{fur === f.id && <Check />}</Button>)}
          </div>
          <div className="mx-auto mt-5 flex max-w-sm justify-center gap-2">
            <Button variant="pop" className="min-w-48" disabled={!unlocked || !changed || saving || !profile} onClick={save}>{saving ? <><LoaderCircle className="animate-spin" /> Saving…</> : !unlocked ? <><LockKeyhole /> {Math.max(0, selection.days - days)} more study {selection.days - days === 1 ? "day" : "days"}</> : changed ? <><Check /> Save look</> : <><Check /> Look saved</>}</Button>
            <Button variant="outline" size="icon" title="Reset to saved look" aria-label="Reset to saved look" disabled={!changed || saving} onClick={() => { setFur(asFur(profile?.bunny_fur)); setOutfit(asOutfit(profile?.bunny_outfit)); }}><RotateCcw /></Button>
          </div>
          {next ? <div className="mx-auto mt-7 max-w-sm text-left"><div className="mb-2 flex justify-between gap-2 text-sm"><span>Next: <strong>{next.name}</strong></span><span className="shrink-0 text-muted-foreground">{days}/{next.days} days</span></div><Progress value={(days / next.days) * 100} /></div> : <p className="mt-7 text-sm font-semibold text-success">Your wardrobe is complete!</p>}
        </section>

        <section aria-label="Bunny wardrobe">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl">The wardrobe</h2><div className="flex rounded-full bg-muted p-1" role="group" aria-label="Wardrobe filter"><Button variant={filter === "all" ? "secondary" : "ghost"} size="sm" className="rounded-full" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>All outfits</Button><Button variant={filter === "unlocked" ? "secondary" : "ghost"} size="sm" className="rounded-full" aria-pressed={filter === "unlocked"} onClick={() => setFilter("unlocked")}>Unlocked</Button></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {OUTFITS.filter((o) => filter === "all" || isOutfitUnlocked(o.id, days)).map((o) => {
              const earned = isOutfitUnlocked(o.id, days);
              return <Button key={o.id} variant="outline" disabled={saving} aria-label={`Try on ${o.name}`} aria-pressed={outfit === o.id} onClick={() => setOutfit(o.id)} className={`relative h-auto min-w-0 flex-col gap-0 whitespace-normal rounded-2xl p-3 text-center transition-colors ${outfit === o.id ? "border-primary bg-highlight/30 ring-1 ring-primary" : "bg-card hover:bg-secondary/20"}`}>
                <span className="absolute right-3 top-3">{earned ? <Check className="size-3.5 text-success" /> : <LockKeyhole className="size-3.5 text-muted-foreground" />}</span>
                <span className="block h-32 w-full sm:h-36"><Bunny small fur={fur} outfit={o.id} /></span>
                <span className="mt-2 block font-semibold">{o.name}</span><span className={`mt-1 block text-xs ${earned ? "text-success" : "text-muted-foreground"}`}>{earned ? "Unlocked" : o.detail}</span>
              </Button>;
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5"><span className="text-sm text-muted-foreground">{todayDone ? "A little progress, every day." : "Your next study day is waiting."}</span><Button asChild variant="outline" size="sm"><Link to="/dashboard">{todayDone ? "Keep studying" : "Start studying"}<ArrowRight /></Link></Button></div>
        </section>
      </div>
    </div>
  );
}