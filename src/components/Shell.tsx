import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, Search, ListMusic, User, Play, Pause, SkipForward, X, Crown, Lock, Tv, Heart, Plus, SkipBack } from "lucide-react";
import { useApp, type Track } from "@/lib/app-store";

export function ProBadge() {
  return <span className="inline-flex items-center gap-1 rounded-full bg-gradient-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground"><Crown className="h-3 w-3" />PRO</span>;
}

export function Page({ title, children, right }: { title: string; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="animate-page-in px-5 pb-44 pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gradient-neon">{title}</h1>{right}
      </div>
      {children}
    </div>
  );
}

export function TrackRow({ t, list, i, extra }: { t: Track; list: Track[]; i: number; extra?: ReactNode }) {
  const app = useApp();
  const active = app.current?.id === t.id;
  return (
    <div className={`flex items-center gap-3 rounded-xl p-2 transition hover:bg-muted ${active ? "bg-muted" : ""}`}>
      <button onClick={() => app.play(list, i)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <img src={t.cover} alt="" className={`h-12 w-12 rounded-lg object-cover ${active && app.playing ? "animate-pulse-glow" : ""}`} />
        <div className="min-w-0">
          <p className={`truncate font-medium ${active ? "text-neon" : ""}`}>{t.title}</p>
          <p className="truncate text-sm text-muted-foreground">{t.artist}</p>
        </div>
      </button>
      <button onClick={() => app.toggleFav(t)} aria-label="Preferito"><Heart className={`h-5 w-5 ${app.isFav(t) ? "fill-primary text-primary" : "text-muted-foreground"}`} /></button>
      {extra}
    </div>
  );
}

export function AddToPlaylist({ t }: { t: Track }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Aggiungi a playlist"><Plus className="h-5 w-5 text-muted-foreground" /></button>
      {open && (
        <div className="absolute right-0 top-7 z-30 w-48 rounded-xl border bg-card p-2 shadow-glow">
          {app.playlists.length === 0 && <p className="p-2 text-xs text-muted-foreground">Crea prima una playlist</p>}
          {app.playlists.map((p) => (
            <button key={p.id} onClick={() => { app.addToPlaylist(p.id, t); setOpen(false); }} className="block w-full truncate rounded-lg p-2 text-left text-sm hover:bg-muted">{p.name}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function MiniPlayer() {
  const app = useApp();
  const t = app.current;
  if (!t) return null;
  return (
    <div className="fixed inset-x-0 bottom-[68px] z-30 mx-auto max-w-md px-3">
      <div className="overflow-hidden rounded-2xl border bg-card shadow-glow">
        <div className="flex items-center gap-3 p-2">
          <Link to="/player" className="flex min-w-0 flex-1 items-center gap-3">
            <img src={t.cover} alt="" className={`h-11 w-11 rounded-full object-cover ${app.playing ? "animate-spin-slow" : ""}`} />
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{t.title}</p><p className="truncate text-xs text-muted-foreground">{t.artist}</p></div>
          </Link>
          <button onClick={app.toggle} className="rounded-full bg-primary p-2 text-primary-foreground">{app.playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}</button>
          <button onClick={app.next}><SkipForward className="h-5 w-5" /></button>
        </div>
        <div className="h-0.5 bg-muted"><div className="h-full bg-gradient-neon" style={{ width: `${(app.progress / (app.duration || 1)) * 100}%` }} /></div>
      </div>
    </div>
  );
}

function Nav() {
  const { pathname } = useLocation();
  const items = [{ to: "/", icon: Home, l: "Home" }, { to: "/search", icon: Search, l: "Cerca" }, { to: "/playlists", icon: ListMusic, l: "Playlist" }, { to: "/profile", icon: User, l: "Profilo" }] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-md justify-around border-t bg-background/90 py-2 backdrop-blur">
      {items.map(({ to, icon: I, l }) => {
        const a = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 px-3 text-xs transition ${a ? "text-neon" : "text-muted-foreground"}`}><I className={`h-6 w-6 ${a ? "drop-shadow-[0_0_6px_currentColor]" : ""}`} />{l}</Link>;
      })}
    </nav>
  );
}

function PaywallModal() {
  const app = useApp();
  const nav = useNavigate();
  const [sec, setSec] = useState(3);
  useEffect(() => { if (!app.paywall) return; setSec(3); const t = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000); return () => clearInterval(t); }, [app.paywall]);
  if (!app.paywall || app.premium) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-overlay p-6 text-center backdrop-blur-md animate-in fade-in">
      {sec === 0 ? <button onClick={() => app.setPaywall(false)} className="absolute right-5 top-5 text-muted-foreground" aria-label="Chiudi"><X className="h-5 w-5" /></button>
        : <span className="absolute right-5 top-5 text-xs text-muted-foreground">{sec}</span>}
      <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-neon animate-pulse-glow"><Crown className="h-14 w-14 text-primary-foreground" /></div>
      <h2 className="font-display text-3xl font-black text-gradient-neon">SONIQ PREMIUM</h2>
      <p className="mt-3 text-muted-foreground">Musica senza limiti, zero pubblicità, audio HD 320kbps, equalizzatore avanzato e backup cloud.</p>
      <p className="mt-6 text-5xl font-black">4,99€<span className="text-lg font-normal text-muted-foreground">/mese</span></p>
      <button onClick={() => { app.setPaywall(false); nav({ to: "/checkout" }); }} className="mt-8 w-full max-w-sm rounded-2xl bg-gradient-neon py-5 text-xl font-black text-primary-foreground shadow-glow transition active:scale-95">Passa a Premium Ora</button>
    </div>
  );
}

function LimitModal() {
  const app = useApp();
  const nav = useNavigate();
  const [ad, setAd] = useState<number | null>(null);
  useEffect(() => { if (ad === null) return; if (ad === 0) { app.unlockWithAd(); setAd(null); return; } const t = setTimeout(() => setAd(ad - 1), 1000); return () => clearTimeout(t); }, [ad, app]);
  if (!app.limitHit || app.premium) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-overlay p-6 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-3xl border bg-card p-6 text-center shadow-glow">
        {ad !== null ? (
          <>
            <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-gradient-neon"><p className="font-display text-xl font-black text-primary-foreground">NEON COLA<br /><span className="text-sm font-normal">Energia elettrica in lattina</span></p></div>
            <p className="text-sm text-muted-foreground">Pubblicità · sblocco tra {ad}s</p>
          </>
        ) : (
          <>
            <Lock className="mx-auto mb-3 h-12 w-12 text-primary" />
            <p className="text-lg font-bold">Hai raggiunto il limite FREE. Passa a Premium o guarda una pubblicità per sbloccare altri 10 brani</p>
            <button onClick={() => { app.setLimitHit(false); nav({ to: "/checkout" }); }} className="mt-6 w-full rounded-xl bg-gradient-neon py-3 font-bold text-primary-foreground">Passa a Premium</button>
            <button onClick={() => setAd(5)} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border py-3 font-medium"><Tv className="h-4 w-4" />Guarda una pubblicità</button>
          </>
        )}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const hideChrome = pathname === "/player" || pathname === "/checkout";
  return (
    <div className="mx-auto min-h-screen max-w-md">
      <div key={pathname}>{children}</div>
      {!hideChrome && <><MiniPlayer /><Nav /></>}
      <PaywallModal />
      <LimitModal />
    </div>
  );
}

export { SkipBack };
