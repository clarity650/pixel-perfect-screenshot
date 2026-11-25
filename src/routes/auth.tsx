import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — StudyMate AI" },
      { name: "description", content: "Sign in or create your StudyMate AI student account." },
      { property: "og:title", content: "Sign in — StudyMate AI" },
      { property: "og:description", content: "Create your student account to save points, streaks and progress." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const G = () => (
  <svg aria-hidden="true" width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
);

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (data.session) nav({ to: "/dashboard" }); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { if (s) nav({ to: "/dashboard" }); });
    return () => data.subscription.unsubscribe();
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/dashboard", data: { display_name: name } } });
        if (error) throw error;
        setSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) { toast.error(err instanceof Error ? err.message : "Could not sign in"); }
    finally { setBusy(false); }
  }

  async function oauth(p: "google" | "lovable") {
    const r = await lovable.auth.signInWithOAuth(p, { redirect_uri: window.location.origin + "/auth" });
    if (r.error) toast.error(r.error.message ?? "Sign-in failed");
  }

  return (
    <div className="grid min-h-screen place-items-center px-5 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 block text-center text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>StudyMate<span className="text-accent">.</span>AI</Link>
        <div className="card-pop p-6">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl">📬</div>
              <h1 className="mt-3 text-2xl font-bold">Check your email</h1>
              <p className="mt-2 text-muted-foreground">We sent a confirmation link to <b>{email}</b>. Click it to start studying.</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{mode === "in" ? "Welcome back!" : "Create your account"}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Save your points, streaks and progress.</p>
              <div className="mt-5 grid gap-2">
                <Button type="button" variant="outline" className="h-11 border-[#747775] bg-white text-[#1F1F1F] hover:bg-white/90" onClick={() => oauth("google")}><G /> Continue with Google</Button>
                <Button type="button" variant="outline" className="h-11" onClick={() => oauth("lovable")}><LovableMark /> Continue with Lovable</Button>
              </div>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground"><div className="h-px flex-1 bg-border" />or with email<div className="h-px flex-1 bg-border" /></div>
              <form onSubmit={submit} className="space-y-3">
                {mode === "up" && (
                  <div className="space-y-1.5"><Label htmlFor="name">Your name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} /></div>
                )}
                <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
                <div className="space-y-1.5"><Label htmlFor="pw">Password</Label><Input id="pw" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
                <Button type="submit" variant="pop" className="h-11 w-full" disabled={busy}>{mode === "in" ? "Sign in" : "Create account"}</Button>
              </form>
              <p className="mt-4 text-center text-sm">
                {mode === "in" ? "New here? " : "Already have an account? "}
                <button className="font-semibold text-primary underline" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? "Create an account" : "Sign in"}</button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
