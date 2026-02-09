import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function buildSupabasePool(raw: string): pg.Pool {
  const protoEnd = raw.indexOf("://") + 3;
  const atIdx = raw.lastIndexOf("@");
  const userPass = raw.substring(protoEnd, atIdx);
  const colonIdx = userPass.indexOf(":");
  const user = userPass.substring(0, colonIdx);
  let password = userPass.substring(colonIdx + 1);
  if (password.startsWith("[") && password.endsWith("]")) {
    password = password.slice(1, -1);
  }

  const hostPart = raw.substring(atIdx + 1);
  const slashIdx = hostPart.indexOf("/");
  const hostPort = hostPart.substring(0, slashIdx);
  const database = hostPart.substring(slashIdx + 1).split("?")[0] || "postgres";

  let host: string;
  let port: number;
  const portColonIdx = hostPort.lastIndexOf(":");
  if (portColonIdx !== -1) {
    host = hostPort.substring(0, portColonIdx);
    port = parseInt(hostPort.substring(portColonIdx + 1), 10);
  } else {
    host = hostPort;
    port = 5432;
  }

  const directMatch = host.match(/^db\.([a-z0-9]+)\.supabase\.co$/);
  let projectRef: string | null = null;
  if (directMatch) {
    projectRef = directMatch[1];
    host = "aws-0-us-east-2.pooler.supabase.com";
    port = 6543;
    console.log("Converted Supabase direct host to pooler (us-east-2)");
  }

  if (host.includes("pooler.supabase.com") && port === 5432) {
    port = 6543;
    console.log("Switched pooler to transaction mode port 6543");
  }

  let finalUser = user;
  if (projectRef && !user.includes(".")) {
    finalUser = `${user}.${projectRef}`;
  }

  console.log(`Connecting to Supabase: ${finalUser}@${host}:${port}/${database}`);

  return new pg.Pool({
    host,
    port,
    user: finalUser,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 10,
  });
}

let _pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function initPool(): pg.Pool {
  if (_pool) return _pool;

  const supabaseUrl = process.env.SUPABASE_DATABASE_URL;
  if (!supabaseUrl) {
    console.error(
      "FATAL: SUPABASE_DATABASE_URL is required. Available env keys:",
      Object.keys(process.env)
        .filter((k) => k.includes("SUPA") || k.includes("PG") || k.includes("DATABASE"))
        .join(", ")
    );
    throw new Error("SUPABASE_DATABASE_URL is required");
  }

  _pool = buildSupabasePool(supabaseUrl);
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
