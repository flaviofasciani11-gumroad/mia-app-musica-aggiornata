import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Crown } from "lucide-react";
import { useApp, searchTracks, type Track } from "@/lib/app-store";
import { Page, ProBadge, TrackRow } from "@/components/Shell";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "SONIQ — Home" }, { name: "description", content: "Le hit del momento su SONIQ, streaming musicale neon." },
    { property: "og:title", content: "SONIQ — Home" }, { property: "og:description", content: "Le hit del momento su SONIQ." },
  ] }),
  component: Home,
});

function AdBanner({ v }: { v: number }) {
  const ads = [
    { t: "NEON COLA", s: "Energia elettrica in lattina · -30% oggi", c: "Scopri" },
    { t: "HYPERBUDS X", s: "Cuffie wireless con cancellazione rumore", c: "Compra ora" },
  ][v]!;
  return (
    <div className="relative my-5 flex items-center justify-between overflow-hidden rounded-2xl bg-gradient-neon p-4 text-primary-foreground">
      <span className="absolute right-2 top-1 text-[9px] opacity-70">AD · Sponsorizzato</span>
      <div><p className="font-display text-lg font-black">{ads.t}</p><p className="text-xs opacity-90">{ads.s}</p></div>
      <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-foreground">{ads.c}</span>
    </div>
  );
}

function Home() {
  const app = useApp();
  const [hits, setHits] = useState<Track[]>([]);
  const [chill, setChill] = useState<Track[]>([]);
  useEffect(() => { searchTracks("pop").then(setHits).catch(() => {}); searchTracks("synthwave").then(setChill).catch(() => {}); }, []);
  return (
    <Page title="SONIQ" right={app.premium ? <ProBadge /> : <Link to="/checkout" className="flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-bold text-primary"><Crown className="h-3 w-3" />Premium</Link>}>
      <p className="text-muted-foreground">Ciao{app.user ? `, ${app.user.name}` : ""} 👾</p>
      {!app.premium && <AdBanner v={0} />}
      <h2 className="mb-3 mt-5 text-lg font-bold">Hit del momento</h2>
      <div className="-mx-5 flex gap-4 overflow-x-auto px-5 pb-2">
        {hits.slice(0, 10).map((t, i) => (
          <button key={t.id} onClick={() => app.play(hits, i)} className="w-36 shrink-0 text-left">
            <img src={t.cover} alt="" className="aspect-square w-full rounded-2xl object-cover shadow-glow transition hover:scale-105 animate-float-cover" style={{ animationDelay: `${i * 0.3}s` }} />
            <p className="mt-2 truncate text-sm font-semibold">{t.title}</p>
            <p className="truncate text-xs text-muted-foreground">{t.artist}</p>
          </button>
        ))}
      </div>
      {!app.premium && <AdBanner v={1} />}
      <h2 className="mb-2 mt-5 text-lg font-bold">Synthwave notturno</h2>
      {chill.slice(0, 8).map((t, i) => <TrackRow key={t.id} t={t} list={chill} i={i} />)}
      {!app.premium && <p className="mt-4 text-center text-xs text-muted-foreground">Brani FREE: {app.count}/{app.freeLimit}</p>}
    </Page>
  );
}
