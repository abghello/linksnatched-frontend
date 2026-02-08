import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

let connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (connectionString) {
  const protoEnd = connectionString.indexOf("://") + 3;
  const atIdx = connectionString.lastIndexOf("@");

  if (atIdx > protoEnd) {
    const userPass = connectionString.substring(protoEnd, atIdx);
    const colonIdx = userPass.indexOf(":");
    if (colonIdx !== -1) {
      const user = userPass.substring(0, colonIdx);
      const pass = userPass.substring(colonIdx + 1);
      const encodedPass = encodeURIComponent(pass);
      if (pass !== encodedPass) {
        connectionString =
          connectionString.substring(0, protoEnd) +
          user +
          ":" +
          encodedPass +
          connectionString.substring(atIdx);
      }
    }
  }

  const directHostMatch = connectionString.match(
    /@db\.([a-z0-9]+)\.supabase\.co/
  );
  if (directHostMatch) {
    const projectRef = directHostMatch[1];
    connectionString = connectionString.replace(
      /@db\.[a-z0-9]+\.supabase\.co/,
      `@aws-0-us-east-1.pooler.supabase.com`
    );
    const beforeAt = connectionString.substring(0, connectionString.lastIndexOf("@"));
    const userMatch = beforeAt.match(/:\/\/([^:]+)/);
    if (userMatch && !userMatch[1].includes(".")) {
      connectionString = connectionString.replace(
        `://${userMatch[1]}:`,
        `://${userMatch[1]}.${projectRef}:`
      );
    }
    console.log("Converted direct host to Supabase pooler connection");
  }

  if (connectionString.includes("pooler.supabase.com") && connectionString.includes(":5432/")) {
    connectionString = connectionString.replace(":5432/", ":6543/");
    console.log("Switched to transaction pooler port 6543");
  }
}

const useSSL = !!process.env.SUPABASE_DATABASE_URL;

export const pool = new pg.Pool({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err.message);
});

export const db = drizzle(pool, { schema });
