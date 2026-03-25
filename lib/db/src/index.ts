import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL not set — database features will be unavailable. DB routes will return 503.");
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _db = drizzle(pool, { schema });
}

export { pool };

export const db = _db as NonNullable<typeof _db>;

export const isDatabaseAvailable = (): boolean => _db !== null;

export * from "./schema";
