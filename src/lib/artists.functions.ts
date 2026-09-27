import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type DeezerArtist = { id: number; name: string; picture_xl?: string; picture_big?: string; nb_fan?: number; nb_album?: number };
type DeezerTrack = { id: number; title: string; rank?: number; link?: string; album?: { cover_medium?: string } };
type DeezerRelease = { id: number; title: string; record_type: string; release_date: string; cover_medium?: string; link?: string };
type MBGroup = { id: string; title: string; "primary-type"?: string; "secondary-types"?: string[]; "first-release-date"?: string };
type MBArtist = { id: string; name: string; score: number };

async function deezer<T>(path: string): Promise<T> {
  const response = await fetch(`https://api.deezer.com/${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Catalogo musicale temporaneamente non disponibile");
  const json = await response.json();
  if (json.error) throw new Error("Catalogo musicale temporaneamente non disponibile");
  return json as T;
}

export const findArtists = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ query: z.string().trim().min(2).max(80) }).parse(input))
  .handler(async ({ data }) => {
    const result = await deezer<{ data: DeezerArtist[] }>(`search/artist?q=${encodeURIComponent(data.query)}&limit=12`);
    return (result.data ?? []).map(({ id, name, picture_big, nb_fan, nb_album }) => ({ id, name, picture: picture_big ?? "", fans: nb_fan ?? 0, albums: nb_album ?? 0 }));
  });

const normalize = (s: string) => s.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
const mbHeaders = { "User-Agent": "SONIQMusicExplorer/1.0 (contact: music-data@soniq.app)", Accept: "application/json" };

async function musicBrainz<T>(path: string): Promise<T> {
  const response = await fetch(`https://musicbrainz.org/ws/2/${path}`, { headers: mbHeaders });
  if (!response.ok) throw new Error("Discografia non disponibile");
  return response.json() as Promise<T>;
}

async function getDiscography(name: string) {
  const matches = await musicBrainz<{ artists: MBArtist[] }>(`artist/?query=${encodeURIComponent(`artist:"${name.replace(/["\\]/g, "")}"`)}&limit=8&fmt=json`);
  const exact = matches.artists?.filter((a) => normalize(a.name) === normalize(name)).sort((a, b) => b.score - a.score)[0];
  if (!exact || exact.score < 80) return null;
  const all: MBGroup[] = [];
  let count = 0;
  // MusicBrainz returns at most 100 release groups per request.
  for (let offset = 0; offset < 500; offset += 100) {
    if (offset > 0) await new Promise((resolve) => setTimeout(resolve, 1100));
    const page = await musicBrainz<{ "release-groups": MBGroup[]; "release-group-count": number }>(`release-group?artist=${exact.id}&limit=100&offset=${offset}&fmt=json`);
    all.push(...(page["release-groups"] ?? []));
    count = page["release-group-count"] ?? 0;
    if (all.length >= count || !page["release-groups"]?.length) break;
  }
  const excluded = new Set(["Compilation", "Live", "Remix", "Soundtrack", "Demo", "DJ-mix", "Audiobook", "Interview"]);
  const groups = all.filter((g) => g.title && g["first-release-date"] && !(g["secondary-types"] ?? []).some((t) => excluded.has(t)));
  const mapped = (list: MBGroup[]) => list.sort((a, b) => (b["first-release-date"] ?? "").localeCompare(a["first-release-date"] ?? ""))
    .map((g) => ({ id: g.id, title: g.title, year: g["first-release-date"]?.slice(0, 4) ?? "", date: g["first-release-date"] ?? "" }));
  return {
    albums: mapped(groups.filter((g) => g["primary-type"] === "Album" && !(g["secondary-types"] ?? []).includes("Mixtape/Street"))),
    projects: mapped(groups.filter((g) => g["primary-type"] === "EP" || (g["secondary-types"] ?? []).includes("Mixtape/Street"))),
    complete: all.length >= count,
    source: `https://musicbrainz.org/artist/${exact.id}`,
  };
}

export const getArtistProfile = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ id: z.coerce.number().int().positive() }).parse(input))
  .handler(async ({ data }) => {
    const [artist, top, firstAlbums] = await Promise.all([
      deezer<DeezerArtist>(`artist/${data.id}`),
      deezer<{ data: DeezerTrack[] }>(`artist/${data.id}/top?limit=50`),
      deezer<{ data: DeezerRelease[]; next?: string; total?: number }>(`artist/${data.id}/albums?limit=100`),
    ]);
    const albums = [...(firstAlbums.data ?? [])];
    for (let offset = 100; offset < Math.min(firstAlbums.total ?? 0, 500); offset += 100) {
      const next = await deezer<{ data: DeezerRelease[] }>(`artist/${data.id}/albums?limit=100&index=${offset}`);
      albums.push(...(next.data ?? []));
    }
    const sorted = albums.filter((a) => a.release_date && a.release_date <= new Date().toISOString().slice(0, 10))
      .sort((a, b) => b.release_date.localeCompare(a.release_date));
    let discography: Awaited<ReturnType<typeof getDiscography>> = null;
    try { discography = await getDiscography(artist.name); } catch { /* An unavailable reference catalog must not hide the artist. */ }
    const fallback = sorted.filter((a) => a.record_type === "album" && !/\b(deluxe|remaster|anniversary|live|greatest|highlights|collection|edition|version)\b/i.test(a.title));
    const fallbackProjects = sorted.filter((a) => a.record_type === "ep" && !/\b(remix|version|bundle)\b/i.test(a.title));
    const mapRelease = (a: DeezerRelease) => ({ id: String(a.id), title: a.title, year: a.release_date.slice(0, 4), date: a.release_date });
    const dedupe = <T extends { title: string }>(items: T[]) => items.filter((item, i) => items.findIndex((other) => normalize(other.title) === normalize(item.title)) === i);
    return {
      id: artist.id, name: artist.name, picture: artist.picture_xl ?? artist.picture_big ?? "", fans: artist.nb_fan ?? 0,
      top: dedupe((top.data ?? []).map((t) => ({ id: t.id, title: t.title, rank: t.rank ?? 0, cover: t.album?.cover_medium ?? "", link: t.link ?? "" }))).slice(0, 5),
      albums: discography?.albums ?? dedupe(fallback.map(mapRelease)),
      projects: discography?.projects ?? dedupe(fallbackProjects.map(mapRelease)),
      discographySource: discography?.source ?? `https://www.deezer.com/artist/${artist.id}`,
      discographyComplete: discography?.complete ?? (albums.length >= (firstAlbums.total ?? 0)),
      recent: dedupe(sorted.filter((a) => a.record_type === "single").map((a) => ({ ...mapRelease(a), cover: a.cover_medium ?? "", link: a.link ?? "" }))).slice(0, 4),
      latestAlbum: sorted.find((a) => a.record_type === "album" && !/\b(deluxe|remaster|live|greatest|highlights|collection|edition|version)\b/i.test(a.title)) ?? null,
      catalogUrl: `https://www.deezer.com/artist/${artist.id}`,
    };
  });
