import { createClient } from "@supabase/supabase-js";

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

const supabaseUrl = resolveSupabaseUrl();
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is required");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
