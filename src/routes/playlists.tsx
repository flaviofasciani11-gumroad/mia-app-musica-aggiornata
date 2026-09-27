import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2, X, ChevronDown, Heart } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { Page, TrackRow } from "@/components/Shell";

export const Route = createFileRoute("/playlists")({
  head: () => ({ meta: [
    { title: "Le tue playlist — SONIQ" }, { name: "description", content: "Crea e gestisci le tue playlist personali." },
    { property: "og:title", content: "Le tue playlist — SONIQ" }, { property: "og:description", content: "Crea e gestisci le tue playlist." },
  ] }),
  component: Playlists,
});

function Playlists() {
  const app = useApp();
  const [name, setName] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  return (
    <Page title="Playlist">
      <form onSubmit={(e) => { e.preventDefault(); const n = name.trim().slice(0, 50); if (n) { app.createPlaylist(n); setName(""); } }} className="mb-5 flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={50} placeholder="Nome nuova playlist" className="flex-1 rounded-xl border bg-input px-4 py-3 outline-none focus:border-primary" />
        <button className="rounded-xl bg-gradient-neon px-4 text-primary-foreground" aria-label="Crea"><Plus /></button>
      </form>
      <Section id="fav" title="Preferiti" count={app.favorites.length} open={open} setOpen={setOpen} icon={<Heart className="h-5 w-5 fill-primary text-primary" />}>
        {app.favorites.map((t, i) => <TrackRow key={t.id} t={t} list={app.favorites} i={i} />)}
      </Section>
      {app.playlists.map((p) => (
        <Section key={p.id} id={p.id} title={p.name} count={p.tracks.length} open={open} setOpen={setOpen}
          action={<button onClick={() => app.deletePlaylist(p.id)} aria-label="Elimina"><Trash2 className="h-4 w-4 text-destructive" /></button>}>
          {p.tracks.length === 0 && <p className="p-2 text-sm text-muted-foreground">Aggiungi brani da Cerca o dal Player.</p>}
          {p.tracks.map((t, i) => <TrackRow key={t.id} t={t} list={p.tracks} i={i} extra={<button onClick={() => app.removeFromPlaylist(p.id, t.id)} aria-label="Rimuovi"><X className="h-5 w-5 text-muted-foreground" /></button>} />)}
        </Section>
      ))}
    </Page>
  );
}

function Section({ id, title, count, open, setOpen, children, action, icon }: any) {
  const isOpen = open === id;
  return (
    <div className="mb-3 rounded-2xl border bg-card">
      <div className="flex items-center gap-3 p-4">
        <button onClick={() => setOpen(isOpen ? null : id)} className="flex flex-1 items-center gap-3 text-left">
          {icon ?? <div className="h-10 w-10 rounded-lg bg-gradient-neon" />}
          <div className="flex-1"><p className="font-semibold">{title}</p><p className="text-xs text-muted-foreground">{count} brani</p></div>
          <ChevronDown className={`h-5 w-5 transition ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {action}
      </div>
      {isOpen && <div className="animate-page-in px-2 pb-2">{children}</div>}
    </div>
  );
}
