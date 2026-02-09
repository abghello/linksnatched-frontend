import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function resolveSupabaseUrl(): string {
  const provided = process.env.SUPABASE_URL || "";
  if (provided.startsWith("https://") && provided.includes(".supabase.co")) {
    return provided;
  }

  const dbUrl = process.env.SUPABASE_DATABASE_URL || "";
  const match = dbUrl.match(/\.([a-z0-9]+)\.supabase\.co/);
  if (match) {
    const url = `https://${match[1]}.supabase.co`;
    console.log(`Resolved Supabase URL from database connection: ${url}`);
    return url;
  }

  throw new Error(
    "SUPABASE_URL must be a valid URL (e.g. https://xxxxx.supabase.co)"
  );
}

let _supabase: SupabaseClient | null = null;

function initSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = resolveSupabaseUrl();
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error("SUPABASE_ANON_KEY is required");
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const real = initSupabase();
    const value = Reflect.get(real, prop, receiver);
    if (typeof value === "function") {
      return value.bind(real);
    }
    return value;
  },
});
