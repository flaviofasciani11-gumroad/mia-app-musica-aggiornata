import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowUpRight, Disc3, Headphones, Loader2, Music2, RotateCw } from "lucide-react";
import { getArtistProfile } from "@/lib/artists.functions";
import { Button } from "@/components/ui/button";

type Release = { id: string; title: string; year: string; date: string };

export const Route = createFileRoute("/artist/$id")({
  head: () => ({ meta: [
    { title: "Profilo artista — SONIQ" }, { name: "description", content: "Scopri i brani più popolari, la discografia e le ultime uscite dei tuoi artisti preferiti." },
    { property: "og:title", content: "Profilo artista — SONIQ" }, { property: "og:description", content: "Brani popolari, discografia e nuove uscite: esplora gli artisti su SONIQ." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ArtistPage,
});

function ReleaseList({ releases, empty }: { releases: Release[]; empty: string }) {
  return releases.length ? <div className="divide-y divide-border/60">{releases.map((release) => <div key={release.id} className="flex items-baseline justify-between gap-4 py-3">
    <span className="min-w-0 font-medium leading-snug">{release.title}</span><span className="shrink-0 text-sm tabular-nums text-muted-foreground">{release.year}</span>
  </div>)}</div> : <p className="py-3 text-sm text-muted-foreground">{empty}</p>;
}

function ArtistPage() {
  const { id } = Route.useParams();
  const fetchArtist = useServerFn(getArtistProfile);
  const artistId = Number(id);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["artist-profile", artistId],
    queryFn: () => fetchArtist({ data: { id: artistId } }),
    enabled: Number.isSafeInteger(artistId) && artistId > 0,
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });

  if (!Number.isSafeInteger(artistId) || artistId <= 0) return <div className="px-5 pt-8"><p>Artista non valido.</p><Link to="/search" className="text-primary underline">Torna alla ricerca</Link></div>;
  if (isPending) return <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary"/><p>Caricamento artista…</p></div>;
  if (isError || !data) return <div className="px-5 pt-8"><p className="mb-4">Non è stato possibile caricare l'artista. Riprova tra poco.</p><Button onClick={() => refetch()} variant="outline"><RotateCw />Riprova</Button><Link to="/search" className="ml-4 text-primary underline">Cerca un altro artista</Link></div>;

  return <div className="animate-page-in pb-44">
    <div className="relative isolate overflow-hidden bg-card">
      {data.picture && <img src={data.picture} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover object-top opacity-50" />}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/40 to-transparent" />
      <div className="flex min-h-72 flex-col justify-between px-5 pb-6 pt-6 sm:min-h-80">
        <Link to="/search" className="flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur" aria-label="Torna alla ricerca"><ArrowLeft className="h-5 w-5" /></Link>
        <div><p className="mb-2 text-xs font-bold uppercase text-neon">Artista · SONIQ</p><h1 className="break-words text-4xl font-black leading-tight text-foreground">{data.name}</h1><p className="mt-2 text-sm text-foreground/80">{new Intl.NumberFormat("it-IT").format(data.fans)} fan su Deezer</p></div>
      </div>
    </div>
    <div className="space-y-10 px-5 pt-7">
      <section aria-labelledby="top-tracks">
        <div className="mb-4 flex items-center gap-2"><Headphones className="h-5 w-5 text-neon"/><h2 id="top-tracks" className="text-xl font-bold">Top 5 brani più ascoltati</h2></div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">Classifica di popolarità Deezer. Il totale degli stream globali non è pubblicamente verificabile: non mostriamo stime inventate.</p>
        {data.top.length ? <ol className="divide-y divide-border/60">{data.top.map((track, i) => <li key={track.id} className="flex items-center gap-3 py-3">
          <span className="w-5 shrink-0 text-lg font-bold tabular-nums text-muted-foreground">{i + 1}</span>
          {track.cover ? <img src={track.cover} alt="" className="h-12 w-12 shrink-0 rounded object-cover"/> : <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted"><Music2 className="h-5 w-5" /></div>}
          <div className="min-w-0 flex-1"><p className="font-medium leading-snug">{track.title}</p><p className="mt-0.5 text-xs text-muted-foreground">Stream globali: dato non disponibile</p></div>
          {track.link && <a href={track.link} target="_blank" rel="noopener noreferrer" aria-label={`Apri ${track.title} su Deezer`} className="shrink-0 text-muted-foreground hover:text-primary"><ArrowUpRight className="h-5 w-5"/></a>}
        </li>)}</ol> : <p className="text-sm text-muted-foreground">Nessun brano disponibile nel catalogo.</p>}
      </section>

      <section aria-labelledby="discography">
        <div className="mb-2 flex items-center gap-2"><Disc3 className="h-5 w-5 text-neon"/><h2 id="discography" className="text-xl font-bold">Discografia completa</h2></div>
        <p className="mb-5 text-xs text-muted-foreground">Progetti catalogati, dal più recente al più datato. {data.discographyComplete ? "" : "Il catalogo potrebbe essere parziale."}</p>
        <h3 className="text-xs font-bold uppercase text-primary">Album in studio</h3>
        <ReleaseList releases={data.albums} empty="Nessun album in studio catalogato." />
        <h3 className="mt-6 text-xs font-bold uppercase text-primary">EP e mixtape</h3>
        <ReleaseList releases={data.projects} empty="Nessun EP o mixtape catalogato." />
        <a href={data.discographySource} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4">Fonte discografia <ArrowUpRight className="h-3 w-3"/></a>
      </section>

      <section aria-labelledby="latest">
        <div className="mb-4 flex items-center gap-2"><Music2 className="h-5 w-5 text-neon"/><h2 id="latest" className="text-xl font-bold">Ultime uscite</h2></div>
        {data.latestAlbum && <a href={data.latestAlbum.link} target="_blank" rel="noopener noreferrer" className="mb-4 flex items-center gap-3 border-b pb-4 hover:text-primary">
          {data.latestAlbum.cover_medium && <img src={data.latestAlbum.cover_medium} alt="" className="h-16 w-16 shrink-0 rounded object-cover" />}
          <div className="min-w-0 flex-1"><p className="text-xs text-muted-foreground">Ultimo album · {data.latestAlbum.release_date.slice(0, 4)}</p><p className="font-semibold">{data.latestAlbum.title}</p></div><ArrowUpRight className="h-5 w-5 shrink-0" />
        </a>}
        {data.recent.length > 0 && <><h3 className="mb-2 text-xs font-bold uppercase text-primary">Singoli recenti</h3><div className="divide-y divide-border/60">{data.recent.map((release) => <a key={release.id} href={release.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2.5 hover:text-primary">
          {release.cover && <img src={release.cover} alt="" className="h-11 w-11 shrink-0 rounded object-cover"/>}<span className="min-w-0 flex-1 font-medium">{release.title}</span><span className="shrink-0 text-xs text-muted-foreground">{release.date.slice(0, 4)}</span><ArrowUpRight className="h-4 w-4 shrink-0"/>
        </a>)}</div></>}
        {!data.latestAlbum && !data.recent.length && <p className="text-sm text-muted-foreground">Nessuna uscita recente disponibile.</p>}
        <a href={data.catalogUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4">Fonte ultime uscite: Deezer <ArrowUpRight className="h-3 w-3" /></a>
      </section>
    </div>
  </div>;
}
