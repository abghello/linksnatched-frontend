import { createBrowserClient } from "@supabase/ssr";
import { CONFIG } from "@/config-global";

export function createClient() {
  return createBrowserClient(CONFIG.supabase.url, CONFIG.supabase.key);
}
