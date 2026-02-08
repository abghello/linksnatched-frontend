import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function parseSupabaseUrl(raw: string) {
  const protoEnd = raw.indexOf("://") + 3;
  const atIdx = raw.lastIndexOf("@");
  const userPass = raw.substring(protoEnd, atIdx);
  const colonIdx = userPass.indexOf(":");
  const user = userPass.substring(0, colonIdx);
  const password = userPass.substring(colonIdx + 1);

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

  let finalUser = user;
  if (projectRef && !user.includes(".")) {
    finalUser = `${user}.${projectRef}`;
  }

  return { host, port, user: finalUser, password, database };
}

const supabaseUrl = process.env.SUPABASE_DATABASE_URL;

let supabasePool: pg.Pool | null = null;
if (supabaseUrl) {
  const params = parseSupabaseUrl(supabaseUrl);
  supabasePool = new pg.Pool({
    host: params.host,
    port: params.port,
    user: params.user,
    password: params.password,
    database: params.database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    max: 10,
  });
  supabasePool.on("error", (err) => {
    console.error("Supabase pool error:", err.message);
  });
}

export const sessionPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 5,
});

export const pool = supabasePool || sessionPool;
export const db = drizzle(pool, { schema });
