export const ACCENTS = [
  { id: "viola", label: "Viola", hue: 305 },
  { id: "azzurro", label: "Azzurro", hue: 240 },
  { id: "rosso", label: "Rosso", hue: 25 },
  { id: "verde", label: "Verde", hue: 145 },
  { id: "arancione", label: "Arancione", hue: 55 },
  { id: "rosa", label: "Rosa", hue: 350 },
  { id: "ciano", label: "Ciano", hue: 195 },
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];

export function applyAccent(hue: number, theme: "dark" | "light") {
  const root = document.documentElement;
  if (theme === "light") {
    root.style.setProperty("--background", `oklch(0.97 0.005 ${hue})`);
    root.style.setProperty("--foreground", `oklch(0.18 0.04 ${hue})`);
    root.style.setProperty("--card", `oklch(1 0 0)`);
    root.style.setProperty("--card-foreground", `oklch(0.18 0.04 ${hue})`);
    root.style.setProperty("--primary", `oklch(0.42 0.2 ${hue})`);
    root.style.setProperty("--primary-foreground", `oklch(0.99 0 0)`);
    root.style.setProperty("--secondary", `oklch(0.92 0.02 ${hue})`);
    root.style.setProperty("--secondary-foreground", `oklch(0.25 0.08 ${hue})`);
    root.style.setProperty("--muted", `oklch(0.93 0.01 ${hue})`);
    root.style.setProperty("--muted-foreground", `oklch(0.5 0.04 ${hue})`);
    root.style.setProperty("--accent", `oklch(0.45 0.18 ${hue})`);
    root.style.setProperty("--accent-foreground", `oklch(0.99 0 0)`);
    root.style.setProperty("--neon", `oklch(0.45 0.18 ${hue})`);
    root.style.setProperty("--border", `oklch(0.88 0.02 ${hue})`);
    root.style.setProperty("--input", `oklch(0.9 0.02 ${hue})`);
    root.style.setProperty("--ring", `oklch(0.42 0.2 ${hue})`);
    root.style.setProperty("--overlay", `oklch(0.98 0.005 ${hue} / 95%)`);
    return;
  }
  root.style.setProperty("--background", `oklch(0.1 0.01 ${hue})`);
  root.style.setProperty("--foreground", `oklch(0.97 0.01 ${hue})`);
  root.style.setProperty("--card", `oklch(0.16 0.03 ${hue})`);
  root.style.setProperty("--card-foreground", `oklch(0.97 0.01 ${hue})`);
  root.style.setProperty("--primary", `oklch(0.55 0.28 ${hue})`);
  root.style.setProperty("--primary-foreground", `oklch(0.99 0 0)`);
  root.style.setProperty("--secondary", `oklch(0.22 0.04 ${hue})`);
  root.style.setProperty("--secondary-foreground", `oklch(0.97 0.01 ${hue})`);
  root.style.setProperty("--muted", `oklch(0.2 0.03 ${hue})`);
  root.style.setProperty("--muted-foreground", `oklch(0.68 0.04 ${hue})`);
  root.style.setProperty("--accent", `oklch(0.82 0.22 ${hue})`);
  root.style.setProperty("--accent-foreground", `oklch(0.12 0.04 ${hue})`);
  root.style.setProperty("--neon", `oklch(0.82 0.22 ${hue})`);
  root.style.setProperty("--border", `oklch(0.3 0.06 ${hue})`);
  root.style.setProperty("--input", `oklch(0.25 0.05 ${hue})`);
  root.style.setProperty("--ring", `oklch(0.55 0.28 ${hue})`);
  root.style.setProperty("--overlay", `oklch(0.05 0.01 ${hue} / 92%)`);
}
