import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function buildPool(raw: string): pg.Pool {
  let connectionString = raw;

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname;

    if (host.startsWith("db.") && host.endsWith(".supabase.co")) {
      console.warn(
        "WARNING: SUPABASE_DATABASE_URL uses the direct connection (db.*.supabase.co). " +
          "For serverless/Vercel, use the Transaction Pooler URL from Supabase Settings > Database > Connection Pooling."
      );
    }

    if (host.includes("pooler.supabase.com") && parsed.port === "5432") {
      parsed.port = "6543";
      connectionString = parsed.toString();
      console.log("Switched pooler connection to transaction mode port 6543");
    }

    console.log(`Connecting to database host: ${parsed.hostname}:${parsed.port || "5432"}`);
  } catch (e) {
    console.error("Failed to parse SUPABASE_DATABASE_URL:", (e as Error).message);
  }

  return new pg.Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
    max: 3,
  });
}

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function initPool(): pg.Pool {
  if (_pool) return _pool;

  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!supabaseUrl) {
    console.error("FATAL: SUPABASE_DATABASE_URL is required");
    throw new Error("SUPABASE_DATABASE_URL is required");
  }

  _pool = buildPool(supabaseUrl);
  _pool.on("error", (err) => {
    console.error("Database pool error:", err.message);
  });
  return _pool;
}

export function getPool(): pg.Pool {
  return initPool();
}

export function getDb() {
  if (_db) return _db;
  _db = drizzle(initPool(), { schema });
  return _db;
}

export const pool = new Proxy({} as pg.Pool, {
  get(_target, prop, receiver) {
    const realPool = initPool();
    const value = Reflect.get(realPool, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realPool);
    }
    return value;
  },
});

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === "function") {
      return value.bind(realDb);
    }
    return value;
  },
});
