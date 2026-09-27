import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Search as SearchIcon, Loader2, ArrowRight, UserRound } from "lucide-react";
import { searchTracks, type Track } from "@/lib/app-store";
import { findArtists } from "@/lib/artists.functions";
import { AddToPlaylist, Page, TrackRow } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [
    { title: "Cerca artisti e brani — SONIQ" }, { name: "description", content: "Trova un artista e scopri le sue canzoni più popolari, la discografia e le ultime uscite." },
    { property: "og:title", content: "Cerca artisti e brani — SONIQ" }, { property: "og:description", content: "Esplora artisti, discografie e nuovi brani su SONIQ." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");
  const [mode, setMode] = useState<"artists" | "tracks">("artists");
  const fetchArtists = useServerFn(findArtists);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [trackError, setTrackError] = useState(false);
  useEffect(() => { const timer = setTimeout(() => setTerm(q.trim().slice(0, 80)), 350); return () => clearTimeout(timer); }, [q]);
  const { data: artists = [], isFetching, isError, refetch } = useQuery({
    queryKey: ["artists", term], queryFn: () => fetchArtists({ data: { query: term } }),
    enabled: mode === "artists" && term.length >= 2, staleTime: 1000 * 60 * 10, retry: 1,
  });
  useEffect(() => {
    if (mode !== "tracks" || term.length < 2) return;
    let canceled = false;
    setLoadingTracks(true); setTrackError(false);
    searchTracks(term).then((results) => { if (!canceled) setTracks(results); }).catch(() => { if (!canceled) { setTracks([]); setTrackError(true); } }).finally(() => { if (!canceled) setLoadingTracks(false); });
    return () => { canceled = true; };
  }, [mode, term]);
  const waiting = term !== q.trim().slice(0, 80);
  return <Page title="Cerca">
    <div className="relative mb-5">
      <SearchIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      <Input autoFocus value={q} onChange={(event) => setQ(event.target.value)} placeholder="Cerca un artista o un brano" aria-label="Cerca un artista o un brano" className="h-14 rounded-md bg-input pl-12 pr-12 text-base focus-visible:ring-primary" />
      {(isFetching || loadingTracks || waiting && q.length >= 2) && <Loader2 className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-neon" />}
    </div>
    <div className="mb-5 flex border-b" role="tablist" aria-label="Tipo di ricerca">
      <Button role="tab" aria-selected={mode === "artists"} onClick={() => setMode("artists")} variant="ghost" className={`h-11 flex-1 rounded-none border-b-2 ${mode === "artists" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Artisti</Button>
      <Button role="tab" aria-selected={mode === "tracks"} onClick={() => setMode("tracks")} variant="ghost" className={`h-11 flex-1 rounded-none border-b-2 ${mode === "tracks" ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>Brani</Button>
    </div>
    {term.length < 2 || waiting ? <p className="py-8 text-center text-sm text-muted-foreground">{term.length < 2 && !waiting ? "Cerca il nome di un artista per esplorare la sua musica." : ""}</p> : mode === "artists" ? <>
      {isError ? <div className="py-8 text-center"><p className="mb-4 text-sm text-muted-foreground">Ricerca non disponibile. Riprova.</p><Button variant="outline" onClick={() => refetch()}>Riprova</Button></div> : !isFetching && artists.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nessun artista trovato. Prova un altro nome.</p> :
      <div className="divide-y divide-border/60">{artists.map((artist) => <Link key={artist.id} to="/artist/$id" params={{ id: String(artist.id) }} className="flex items-center gap-4 py-3 transition hover:text-primary">
        {artist.picture ? <img src={artist.picture} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" /> : <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted"><UserRound className="h-6 w-6" /></div>}
        <div className="min-w-0 flex-1"><p className="font-semibold leading-snug">{artist.name}</p><p className="mt-1 text-xs text-muted-foreground">Artista · {new Intl.NumberFormat("it-IT").format(artist.fans)} fan</p></div><ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </Link>)}</div>}
    </> : <>{trackError ? <p className="py-8 text-center text-sm text-muted-foreground">Brani non disponibili. Riprova.</p> : !loadingTracks && tracks.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nessun brano trovato.</p> : tracks.map((track, i) => <TrackRow key={track.id} t={track} list={tracks} i={i} extra={<AddToPlaylist t={track} />} />)}</>}
  </Page>;
}
