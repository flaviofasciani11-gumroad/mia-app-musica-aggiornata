import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { ChevronLeft, Lock, Moon, Timer, SlidersHorizontal, Cloud, Headphones, Crown, Palette } from "lucide-react";
import { useApp } from "@/lib/app-store";
import { ACCENTS } from "@/lib/theme";
import { Page, ProBadge } from "@/components/Shell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [
    { title: "Impostazioni — SONIQ" }, { name: "description", content: "Tema, timer, equalizzatore e qualità audio." },
    { property: "og:title", content: "Impostazioni — SONIQ" }, { property: "og:description", content: "Personalizza SONIQ." },
  ] }),
  component: SettingsPage,
});

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`relative h-8 w-14 rounded-full transition-colors duration-300 ${on ? "bg-primary shadow-glow" : "bg-muted"}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-card shadow transition-all duration-300 ${on ? "left-7" : "left-1"}`} />
    </button>
  );
}

function Card({ icon, title, children, pro, locked }: { icon: ReactNode; title: string; children: ReactNode; pro?: boolean; locked?: boolean }) {
  return (
    <div className="relative mb-3 overflow-hidden rounded-2xl border bg-card p-4">
      <div className="mb-3 flex items-center gap-3">{icon}<p className="flex-1 font-semibold">{title}</p>{pro && <ProBadge />}</div>
      <div className={locked ? "pointer-events-none opacity-30 blur-[1px]" : ""}>{children}</div>
      {locked && <Link to="/checkout" className="absolute inset-0 flex items-center justify-center gap-2 font-bold text-primary"><Lock className="h-4 w-4" />Solo Premium</Link>}
    </div>
  );
}

const bands = ["60Hz", "230Hz", "910Hz", "3.6k", "14k"];
const presets: Record<string, number[]> = { Flat: [0, 0, 0, 0, 0], Bass: [8, 5, 0, -1, -2], Vocal: [-2, 0, 5, 4, 1], Neon: [6, 2, -1, 4, 7] };

function SettingsPage() {
  const app = useApp();
  const locked = !app.premium;
  const [backup, setBackup] = useState("");
  const left = app.sleepEnd ? Math.max(0, Math.round((app.sleepEnd - Date.now()) / 60000)) : 0;
  return (
    <Page title="Impostazioni" right={<Link to="/profile"><ChevronLeft className="h-6 w-6" /></Link>}>
      <Card icon={<Moon className="h-5 w-5 text-neon" />} title="Tema chiaro">
        <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{app.theme === "dark" ? "Neon scuro attivo" : "Elegante chiaro attivo"}</p><Toggle on={app.theme === "light"} onChange={(v) => app.setTheme(v ? "light" : "dark")} /></div>
      </Card>
      <Card icon={<Palette className="h-5 w-5 text-neon" />} title="Colore grafica e scritte">
        <p className="mb-3 text-sm text-muted-foreground">Scegli il colore di pulsanti, titoli e accenti. Si aggiorna subito in tutta l’app.</p>
        <div className="grid grid-cols-4 gap-2">
          {ACCENTS.map((color) => {
            const selected = app.accent === color.id;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() => app.setAccent(color.id)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-2 text-xs font-semibold transition ${selected ? "border-primary bg-primary/15 shadow-glow" : "border-border"}`}
              >
                <span className="h-8 w-8 rounded-full shadow-glow" style={{ background: `oklch(0.62 0.24 ${color.hue})` }} />
                {color.label}
              </button>
            );
          })}
        </div>
      </Card>
      <Card icon={<Timer className="h-5 w-5 text-neon" />} title="Timer spegnimento">
        <div className="grid grid-cols-4 gap-2">
          {[null, 15, 30, 60].map((m) => (
            <button key={String(m)} onClick={() => app.setSleep(m)} className={`rounded-xl border py-2 text-sm font-semibold transition ${(m === null ? !app.sleepEnd : false) ? "bg-muted" : ""}`}>{m ? `${m} min` : "Off"}</button>
          ))}
        </div>
        {app.sleepEnd && <p className="mt-2 text-sm text-neon">La musica si fermerà tra ~{left} min</p>}
      </Card>
      <Card icon={<SlidersHorizontal className="h-5 w-5 text-neon" />} title="Equalizzatore Audio Avanzato" pro locked={locked}>
        <div className="mb-3 flex gap-2">{Object.keys(presets).map((p) => <button key={p} onClick={() => app.setEq(presets[p]!)} className="rounded-full border px-3 py-1 text-xs">{p}</button>)}</div>
        <div className="flex h-36 justify-between">
          {bands.map((b, i) => (
            <div key={b} className="flex flex-col items-center gap-1">
              <input type="range" min={-12} max={12} value={app.eq[i]} onChange={(e) => { const n = [...app.eq]; n[i] = +e.target.value; app.setEq(n); }} className="h-28 accent-primary [writing-mode:vertical-lr] [direction:rtl]" />
              <span className="text-[10px] text-muted-foreground">{b}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card icon={<Headphones className="h-5 w-5 text-neon" />} title="Qualità Audio HD (320kbps)" pro locked={locked}>
        <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{app.hd ? "HD 320kbps" : "Standard 128kbps"}</p><Toggle on={app.hd} onChange={app.setHd} /></div>
      </Card>
      <Card icon={<Cloud className="h-5 w-5 text-neon" />} title="Backup Cloud dei Dati" pro locked={locked}>
        <button onClick={() => { setBackup("In corso..."); setTimeout(() => setBackup(`Backup completato · ${new Date().toLocaleTimeString("it-IT")}`), 1500); }} className="w-full rounded-xl bg-gradient-neon py-3 font-bold text-primary-foreground">Esegui backup</button>
        {backup && <p className="mt-2 text-sm text-neon">{backup}</p>}
      </Card>
      {app.premium ? <button onClick={app.cancelPremium} className="mt-2 w-full text-sm text-muted-foreground underline">Annulla abbonamento Premium</button>
        : <Link to="/checkout" className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-gold py-3 font-bold text-gold-foreground"><Crown className="h-5 w-5" />Sblocca tutto con Premium</Link>}
    </Page>
  );
}
