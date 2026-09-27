import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, LogOut, Crown } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Page, ProBadge, TrackRow } from "@/components/Shell";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [
    { title: "Profilo — SONIQ" }, { name: "description", content: "Accedi, cronologia e preferiti su SONIQ." },
    { property: "og:title", content: "Profilo — SONIQ" }, { property: "og:description", content: "Il tuo profilo SONIQ." },
  ] }),
  component: Profile,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#4285F4" d="M23.49 12.27c0-.82-.07-1.64-.23-2.43H12v4.6h6.46a5.52 5.52 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.8Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.93l-3.88-3c-1.08.73-2.47 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.55.38-2.27V6.64H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.36l4-3.09Z" />
      <path fill="#EA4335" d="M12 4.75c1.76 0 3.33.6 4.57 1.78l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.64l4 3.09C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M16.37 12.63c.02 2.3 2.02 3.07 2.04 3.08-.02.05-.32 1.09-1.05 2.16-.63.93-1.29 1.85-2.32 1.87-1.01.02-1.34-.6-2.5-.6-1.16 0-1.52.58-2.48.62-1 .04-1.75-1-2.39-1.92-1.31-1.88-2.31-5.31-1.93-7.62.19-1.16.75-2.24 1.61-2.94.76-.63 1.75-1.1 2.76-1.12 1.08-.02 2.1.73 2.5.73.4 0 1.62-.9 2.74-.77.47.02 1.78.19 2.62 1.43-.07.04-1.56.91-1.54 2.73ZM14.2 6.3c.58-.7.97-1.68.86-2.65-.83.03-1.84.55-2.44 1.25-.54.62-1.01 1.62-.88 2.57.93.07 1.88-.48 2.46-1.17Z" />
    </svg>
  );
}

function Auth() {
  const app = useApp();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");
  const [oauthBusy, setOauthBusy] = useState<"google" | "apple" | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(f.email)) return setErr("Email non valida");
    if (f.password.length < 6) return setErr("Password di almeno 6 caratteri");
    if (mode === "signup" && !f.name.trim()) return setErr("Inserisci il nome");
    setErr(mode === "login" ? app.login(f.email, f.password) ?? "" : app.signup(f.name.trim().slice(0, 50), f.email, f.password) ?? "");
  };
  const oauth = async (provider: "google" | "apple") => {
    setErr("");
    setOauthBusy(provider);
    const message = await app.loginWithProvider(provider);
    if (message) setErr(message);
    setOauthBusy(null);
  };
  const cls = "w-full rounded-xl border bg-input px-4 py-3 outline-none focus:border-primary";
  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border bg-card p-5">
      <div className="mb-2 flex rounded-xl bg-muted p-1">
        {(["login", "signup"] as const).map((m) => <button type="button" key={m} onClick={() => setMode(m)} className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === m ? "bg-primary text-primary-foreground" : ""}`}>{m === "login" ? "Accedi" : "Registrati"}</button>)}
      </div>
      <button type="button" onClick={() => oauth("google")} disabled={oauthBusy !== null} className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#dadce0] bg-white px-4 py-3 text-sm font-semibold text-[#3c4043] shadow-sm transition hover:bg-[#f8f9fa] disabled:opacity-60">
        <GoogleMark />
        {oauthBusy === "google" ? "Apertura Google…" : "Accedi con Google"}
      </button>
      <button type="button" onClick={() => oauth("apple")} disabled={oauthBusy !== null} className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 disabled:opacity-60">
        <AppleMark />
        {oauthBusy === "apple" ? "Apertura Apple…" : "Accedi con Apple"}
      </button>
      <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-widest text-muted-foreground">
        <span className="h-px flex-1 bg-border" />oppure con email<span className="h-px flex-1 bg-border" />
      </div>
      {mode === "signup" && <input className={cls} placeholder="Nome" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />}
      <input className={cls} placeholder="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      <input className={cls} placeholder="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      {err && <p className="text-sm text-destructive">{err}</p>}
      <button className="w-full rounded-xl bg-gradient-neon py-3 font-bold text-primary-foreground">{mode === "login" ? "Accedi" : "Crea account"}</button>
    </form>
  );
}

function Profile() {
  const app = useApp();
  return (
    <Page title="Profilo" right={<Link to="/settings" aria-label="Impostazioni"><Settings className="h-6 w-6" /></Link>}>
      {!app.user ? <Auth /> : (
        <div className="flex items-center gap-4 rounded-2xl border bg-card p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-neon font-display text-2xl font-black text-primary-foreground">{app.user.name[0]?.toUpperCase()}</div>
          <div className="flex-1"><p className="flex items-center gap-2 text-lg font-bold">{app.user.name} {app.premium && <ProBadge />}</p><p className="text-sm text-muted-foreground">{app.user.email}</p></div>
          <button onClick={app.logout} aria-label="Esci"><LogOut className="h-5 w-5 text-muted-foreground" /></button>
        </div>
      )}
      {!app.premium && <Link to="/checkout" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-gold py-3 font-bold text-gold-foreground"><Crown className="h-5 w-5" />Passa a Premium · 4,99€/mese</Link>}
      <h2 className="mb-2 mt-6 text-lg font-bold">Preferiti ({app.favorites.length})</h2>
      {app.favorites.slice(0, 5).map((t, i) => <TrackRow key={t.id} t={t} list={app.favorites} i={i} />)}
      <h2 className="mb-2 mt-6 text-lg font-bold">Cronologia ascolti</h2>
      {app.history.length === 0 && <p className="text-sm text-muted-foreground">Nessun brano ascoltato.</p>}
      {app.history.slice(0, 20).map((t, i) => <TrackRow key={t.id} t={t} list={app.history} i={i} />)}
    </Page>
  );
}
