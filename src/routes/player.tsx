import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ChevronDown, Heart, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { fmt, useApp } from "@/lib/app-store";
import { AddToPlaylist } from "@/components/Shell";

export const Route = createFileRoute("/player")({
  head: () => ({ meta: [
    { title: "In riproduzione — SONIQ" }, { name: "description", content: "Il player di SONIQ." },
    { property: "og:title", content: "In riproduzione — SONIQ" }, { property: "og:description", content: "Il player di SONIQ." },
  ] }),
  component: Player,
});

function Player() {
  const app = useApp();
  const router = useRouter();
  const t = app.current;
  return (
    <div className="flex min-h-screen animate-page-in flex-col px-6 pb-10 pt-6">
      <div className="flex items-center justify-between">
        <button onClick={() => router.history.back()} aria-label="Indietro"><ChevronDown className="h-7 w-7" /></button>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">In riproduzione {app.hd && app.premium && "· HD 320kbps"}</p>
        <div className="w-7" />
      </div>
      {!t ? <p className="m-auto text-muted-foreground">Nessun brano. Cerca qualcosa da ascoltare!</p> : (
        <>
          <div className="relative mx-auto my-10 aspect-square w-full max-w-xs">
            <div className={`absolute inset-0 rounded-full bg-gradient-neon blur-2xl ${app.playing ? "animate-pulse-glow opacity-70" : "opacity-30"}`} />
            <img src={t.cover} alt="" className={`relative h-full w-full rounded-full border-4 border-primary object-cover ${app.playing ? "animate-spin-slow" : ""}`} />
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0"><h2 className="truncate text-2xl font-bold">{t.title}</h2><p className="text-muted-foreground">{t.artist}</p></div>
            <div className="flex items-center gap-4">
              <AddToPlaylist t={t} />
              <button onClick={() => app.toggleFav(t)}><Heart className={`h-6 w-6 ${app.isFav(t) ? "fill-primary text-primary" : ""}`} /></button>
            </div>
          </div>
          <input type="range" min={0} max={app.duration || Math.max(app.progress, 1)} step={0.1} value={app.progress} onChange={(e) => app.seek(+e.target.value)} className="mt-6 w-full accent-primary" />
          <div className="flex justify-between text-xs text-muted-foreground"><span>{fmt(app.progress)}</span><span>{fmt(app.duration)}</span></div>
          <div className="mt-6 flex items-center justify-center gap-10">
            <button onClick={app.prev}><SkipBack className="h-8 w-8" /></button>
            <button onClick={app.toggle} className="rounded-full bg-gradient-neon p-5 text-primary-foreground shadow-glow transition active:scale-90">{app.playing ? <Pause className="h-9 w-9" /> : <Play className="h-9 w-9" />}</button>
            <button onClick={app.next}><SkipForward className="h-8 w-8" /></button>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">Riproduzione del brano per intero</p>
        </>
      )}
    </div>
  );
}
