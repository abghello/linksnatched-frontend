import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

let connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (connectionString && connectionString.includes("supabase")) {
  try {
    const url = new URL(connectionString);
    if (url.port === "5432") {
      url.port = "6543";
      connectionString = url.toString();
      console.log("Switched Supabase connection to pooler port 6543");
    }
  } catch (e) {
  }
}

export const pool = new pg.Pool({
  connectionString,
  ssl: process.env.SUPABASE_DATABASE_URL ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

export const db = drizzle(pool, { schema });
