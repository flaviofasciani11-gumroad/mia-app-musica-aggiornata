import { supabase } from "./client";
import type { Provider, User } from "@supabase/supabase-js";

export type OauthProvider = Extract<Provider, "google" | "apple">;

/* Abilita i provider in Supabase Dashboard → Authentication → Providers:
 * Google: Client ID + Client Secret da Google Cloud (OAuth 2.0).
 * Apple: Services ID, Team ID, Key ID e chiave .p8 dal Apple Developer.
 * In Authentication → URL Configuration aggiungi:
 *   Site URL = origine dell'app (es. http://localhost:3000)
 *   Redirect URLs = {origine}/profile  e  {SUPABASE_URL}/auth/v1/callback
 */

export async function signInWithOauth(provider: OauthProvider) {
  const redirectTo = `${window.location.origin}/profile`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });
  if (error) throw error;
}

export async function signOutOauth() {
  await supabase.auth.signOut();
}

export function displayNameFromUser(user: User) {
  const meta = user.user_metadata ?? {};
  return (
    String(meta.full_name || meta.name || meta.given_name || "").trim() ||
    (user.email ? user.email.split("@")[0] : "Utente")
  );
}
