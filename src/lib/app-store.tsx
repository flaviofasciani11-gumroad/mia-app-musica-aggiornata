import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User as AuthUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { displayNameFromUser, signInWithOauth, signOutOauth, type OauthProvider } from "@/integrations/supabase/oauth";
import { ACCENTS, applyAccent, type AccentId } from "@/lib/theme";

export type Track = { id: number; title: string; artist: string; cover: string; url: string };
export type Playlist = { id: string; name: string; tracks: Track[] };
type User = { email: string; name: string };
type Account = User & { password: string; premium: boolean; history: Track[]; favorites: Track[]; playlists: Playlist[] };

const AUDIUS = "https://discoveryprovider.audius.co";
const APP_NAME = "SONIQ";

export async function searchTracks(term: string): Promise<Track[]> {
  const r = await fetch(`${AUDIUS}/v1/tracks/search?query=${encodeURIComponent(term)}&app_name=${APP_NAME}&limit=25`);
  if (!r.ok) throw new Error("Catalogo non disponibile");
  const j = await r.json();
  return (j.data || [])
    .filter((x: {
      id?: string;
      track_id?: number;
      title?: string;
      duration?: number;
      is_delete?: boolean;
      is_stream_gated?: boolean;
      artwork?: Record<string, string>;
      user?: { name?: string };
    }) =>
      Boolean(x?.id) &&
      !x.is_delete &&
      !x.is_stream_gated &&
      Number(x.duration) > 45,
    )
    .map((x: {
      id: string;
      track_id?: number;
      title: string;
      artwork?: Record<string, string>;
      user?: { name?: string };
    }) => ({
      id: Number(x.track_id) || Math.abs(Array.from(x.id).reduce((n, c) => n + c.charCodeAt(0), 0)),
      title: String(x.title),
      artist: String(x.user?.name || "Artista"),
      cover: x.artwork?.["480x480"] || x.artwork?.["1000x1000"] || x.artwork?.["150x150"] || "",
      url: `${AUDIUS}/v1/tracks/${x.id}/stream?app_name=${APP_NAME}`,
    }));
}

const FREE_LIMIT = 10;
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const save = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

function useAppState() {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [accent, setAccent] = useState<AccentId>("viola");
  const [accounts, setAccounts] = useState<Record<string, Account>>({});
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [guest, setGuest] = useState<Omit<Account, "email" | "name" | "password">>({ premium: false, history: [], favorites: [], playlists: [] });
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [count, setCount] = useState(0);
  const [limitHit, setLimitHit] = useState(false);
  const [paywall, setPaywall] = useState(false);
  const [sleepEnd, setSleepEnd] = useState<number | null>(null);
  const [hd, setHd] = useState(false);
  const [eq, setEq] = useState([0, 0, 0, 0, 0]);

  useEffect(() => {
    setTheme(load("sw_theme", "dark"));
    const savedAccent = load<AccentId>("sw_accent", "viola");
    setAccent(ACCENTS.some((a) => a.id === savedAccent) ? savedAccent : "viola");
    setAccounts(load("sw_accounts", {}));
    setUserEmail(load("sw_user", null));
    setGuest(load("sw_guest", guest));
    setCount(load("sw_count", 0));
    setHydrated(true);
    const a = new Audio();
    a.preload = "auto";
    audio.current = a;
    a.ontimeupdate = () => setProgress(a.currentTime);
    a.ondurationchange = () => { if (Number.isFinite(a.duration) && a.duration > 0) setDuration(a.duration); };
    a.onloadedmetadata = () => { if (Number.isFinite(a.duration) && a.duration > 0) setDuration(a.duration); };
    a.onplay = () => setPlaying(true);
    a.onpause = () => setPlaying(false);
    return () => { a.pause(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("light", theme === "light");
    save("sw_theme", theme);
    const hue = ACCENTS.find((a) => a.id === accent)?.hue ?? 305;
    applyAccent(hue, theme);
    save("sw_accent", accent);
  }, [theme, accent, hydrated]);

  useEffect(() => { if (hydrated) { save("sw_accounts", accounts); save("sw_user", userEmail); save("sw_guest", guest); save("sw_count", count); } }, [accounts, userEmail, guest, count, hydrated]);

  const applyOauthUser = useCallback((user: AuthUser) => {
    const email = (user.email || `${user.id}@oauth.local`).trim().toLowerCase();
    const name = displayNameFromUser(user);
    setAccounts((a) => {
      const existing = a[email];
      if (existing) return existing.name === name ? a : { ...a, [email]: { ...existing, name } };
      return { ...a, [email]: { name, email, password: "", premium: false, history: [], favorites: [], playlists: [] } };
    });
    setUserEmail(email);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) applyOauthUser(session.user);
        const { data } = supabase.auth.onAuthStateChange((_event, next) => {
          if (next?.user) applyOauthUser(next.user);
        });
        unsub = () => data.subscription.unsubscribe();
      } catch {
        /* Supabase non configurato: resta il login locale */
      }
    })();
    return () => unsub?.();
  }, [hydrated, applyOauthUser]);

  const account = userEmail ? accounts[userEmail] : null;
  const data = account ?? guest;
  const premium = data.premium;
  const update = useCallback((fn: (d: typeof guest) => Partial<typeof guest>) => {
    if (userEmail) setAccounts((a) => ({ ...a, [userEmail]: { ...a[userEmail]!, ...fn(a[userEmail]!) } }));
    else setGuest((g) => ({ ...g, ...fn(g) }));
  }, [userEmail]);

  useEffect(() => { if (hydrated && !premium) setPaywall(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  useEffect(() => {
    if (!sleepEnd) return;
    const t = setInterval(() => { if (Date.now() >= sleepEnd) { audio.current?.pause(); setSleepEnd(null); } }, 1000);
    return () => clearInterval(t);
  }, [sleepEnd]);

  const current = index >= 0 ? queue[index] : null;

  const startAt = useCallback((list: Track[], i: number) => {
    const a = audio.current; if (!a || !list[i]) return;
    if (!premium) {
      if (count >= FREE_LIMIT) { a.pause(); setLimitHit(true); return; }
      setCount((c) => c + 1);
    }
    setQueue(list); setIndex(i);
    setProgress(0); setDuration(0);
    a.src = list[i].url;
    a.load();
    a.play().catch(() => {});
    const t = list[i];
    update((d) => ({ history: [t, ...d.history.filter((h) => h.id !== t.id)].slice(0, 50) }));
  }, [premium, count, update]);

  const next = useCallback(() => { if (index < queue.length - 1) startAt(queue, index + 1); }, [index, queue, startAt]);
  const prev = useCallback(() => { if (index > 0) startAt(queue, index - 1); }, [index, queue, startAt]);
  useEffect(() => { if (audio.current) audio.current.onended = () => next(); }, [next]);

  return {
    hydrated, theme, setTheme, accent, setAccent, premium, user: account ? { email: account.email, name: account.name } : null,
    history: data.history, favorites: data.favorites, playlists: data.playlists,
    current, playing, progress, duration, queue,
    play: startAt, next, prev,
    toggle: () => { const a = audio.current; if (!a || !current) return; if (a.paused) a.play().catch(() => {}); else a.pause(); },
    seek: (s: number) => { if (audio.current && Number.isFinite(s)) audio.current.currentTime = s; },
    count, freeLimit: FREE_LIMIT, limitHit, setLimitHit,
    unlockWithAd: () => { setCount(0); setLimitHit(false); },
    paywall, setPaywall,
    upgrade: () => { update(() => ({ premium: true })); setLimitHit(false); setPaywall(false); },
    cancelPremium: () => update(() => ({ premium: false })),
    sleepEnd, setSleep: (min: number | null) => setSleepEnd(min ? Date.now() + min * 60000 : null),
    hd, setHd, eq, setEq,
    isFav: (t: Track) => data.favorites.some((f) => f.id === t.id),
    toggleFav: (t: Track) => update((d) => ({ favorites: d.favorites.some((f) => f.id === t.id) ? d.favorites.filter((f) => f.id !== t.id) : [t, ...d.favorites] })),
    createPlaylist: (name: string) => update((d) => ({ playlists: [...d.playlists, { id: crypto.randomUUID(), name, tracks: [] }] })),
    deletePlaylist: (id: string) => update((d) => ({ playlists: d.playlists.filter((p) => p.id !== id) })),
    addToPlaylist: (id: string, t: Track) => update((d) => ({ playlists: d.playlists.map((p) => p.id === id && !p.tracks.some((x) => x.id === t.id) ? { ...p, tracks: [...p.tracks, t] } : p) })),
    removeFromPlaylist: (id: string, tid: number) => update((d) => ({ playlists: d.playlists.map((p) => p.id === id ? { ...p, tracks: p.tracks.filter((x) => x.id !== tid) } : p) })),
    signup: (name: string, email: string, password: string): string | null => {
      email = email.trim().toLowerCase();
      if (accounts[email]) return "Email già registrata";
      setAccounts((a) => ({ ...a, [email]: { name, email, password, premium: false, history: [], favorites: [], playlists: [] } }));
      setUserEmail(email); return null;
    },
    login: (email: string, password: string): string | null => {
      email = email.trim().toLowerCase();
      const a = accounts[email];
      if (!a || a.password !== password) return "Credenziali non valide";
      setUserEmail(email); return null;
    },
    loginWithProvider: async (provider: OauthProvider): Promise<string | null> => {
      try {
        await signInWithOauth(provider);
        return null;
      } catch (e) {
        return e instanceof Error ? e.message : "Accesso social non disponibile";
      }
    },
    logout: () => {
      setUserEmail(null);
      signOutOauth().catch(() => {});
    },
  };
}

type Ctx = ReturnType<typeof useAppState>;
const AppCtx = createContext<Ctx | null>(null);
export function AppProvider({ children }: { children: ReactNode }) {
  const v = useAppState();
  return <AppCtx.Provider value={v}>{children}</AppCtx.Provider>;
}
export const useApp = () => { const c = useContext(AppCtx); if (!c) throw new Error("no ctx"); return c; };
export const fmt = (s: number) => `${Math.floor((s || 0) / 60)}:${String(Math.floor((s || 0) % 60)).padStart(2, "0")}`;
