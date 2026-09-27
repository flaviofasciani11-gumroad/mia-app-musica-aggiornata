import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronLeft, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [
    { title: "Passa a Premium — SONIQ" }, { name: "description", content: "Abbonati a SONIQ Premium a 4,99€/mese." },
    { property: "og:title", content: "Passa a Premium — SONIQ" }, { property: "og:description", content: "SONIQ Premium a 4,99€/mese." },
  ] }),
  component: Checkout,
});

// NOTE: simulated checkout. Ready to be swapped with a real Stripe Checkout session.
function Checkout() {
  const app = useApp();
  const nav = useNavigate();
  const router = useRouter();
  const [f, setF] = useState({ name: "", card: "", exp: "", cvc: "" });
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [err, setErr] = useState("");
  const cardFmt = (v: string) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const expFmt = (v: string) => v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || f.card.replace(/\s/g, "").length !== 16 || f.exp.length !== 5 || f.cvc.length < 3) return setErr("Controlla i dati della carta");
    setErr(""); setState("loading");
    setTimeout(() => { app.upgrade(); setState("done"); }, 1800);
  };
  const cls = "w-full rounded-xl border bg-input px-4 py-3 outline-none transition focus:border-primary focus:shadow-glow";
  if (state === "done") return (
    <div className="flex min-h-screen animate-page-in flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 rounded-full bg-gradient-gold p-6 animate-pulse-glow"><Check className="h-12 w-12 text-gold-foreground" /></div>
      <h1 className="font-display text-3xl font-black text-gradient-neon">Benvenuto in PRO!</h1>
      <p className="mt-2 text-muted-foreground">Niente pubblicità, brani illimitati, EQ e audio HD sbloccati.</p>
      <button onClick={() => nav({ to: "/" })} className="mt-8 w-full rounded-2xl bg-gradient-neon py-4 font-bold text-primary-foreground">Inizia ad ascoltare</button>
    </div>
  );
  return (
    <div className="min-h-screen animate-page-in px-5 pb-10 pt-6">
      <button onClick={() => router.history.back()} className="mb-4"><ChevronLeft className="h-7 w-7" /></button>
      <h1 className="font-display text-2xl font-black text-gradient-neon">SONIQ Premium</h1>
      <div className="mt-4 rounded-2xl border bg-card p-5">
        <div className="flex items-baseline justify-between"><p className="font-semibold">Abbonamento mensile</p><p className="text-2xl font-black">4,99€</p></div>
        <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
          {["Zero pubblicità", "Brani illimitati", "Equalizzatore avanzato", "Audio HD 320kbps", "Backup cloud"].map((b) => <li key={b} className="flex items-center gap-2"><Check className="h-4 w-4 text-neon" />{b}</li>)}
        </ul>
      </div>
      <div className="relative mt-6 aspect-[1.6] overflow-hidden rounded-2xl bg-gradient-neon p-5 text-primary-foreground shadow-glow">
        <CreditCard className="h-8 w-8" />
        <p className="mt-6 font-mono text-xl tracking-widest">{f.card || "•••• •••• •••• ••••"}</p>
        <div className="mt-4 flex justify-between text-sm"><span className="uppercase">{f.name || "NOME TITOLARE"}</span><span>{f.exp || "MM/AA"}</span></div>
      </div>
      <form onSubmit={pay} className="mt-6 space-y-3">
        <input className={cls} placeholder="Nome sulla carta" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className={cls} placeholder="Numero carta" inputMode="numeric" value={f.card} onChange={(e) => setF({ ...f, card: cardFmt(e.target.value) })} />
        <div className="flex gap-3">
          <input className={cls} placeholder="MM/AA" inputMode="numeric" value={f.exp} onChange={(e) => setF({ ...f, exp: expFmt(e.target.value) })} />
          <input className={cls} placeholder="CVC" inputMode="numeric" value={f.cvc} onChange={(e) => setF({ ...f, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button disabled={state === "loading"} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-neon py-4 text-lg font-black text-primary-foreground shadow-glow transition active:scale-95">
          {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Paga 4,99€ e attiva"}
        </button>
        <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />Pagamento simulato · predisposto per Stripe</p>
      </form>
    </div>
  );
}
