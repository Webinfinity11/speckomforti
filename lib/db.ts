import "server-only";
import type { Pool } from "pg";
import type { PGlite } from "@electric-sql/pglite";
import { seedIfEmpty } from "./seed";

// Postgres in production (DATABASE_URL), embedded PGlite for local dev (./.data/pglite).
type Q = <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '▦',
  intro text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  position int NOT NULL DEFAULT 0
);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS on_home boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS products (
  id serial PRIMARY KEY,
  category_id int NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug text NOT NULL,
  name text NOT NULL,
  short text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price text NOT NULL DEFAULT '',
  specs jsonb NOT NULL DEFAULT '[]',
  published boolean NOT NULL DEFAULT true,
  position int NOT NULL DEFAULT 0,
  UNIQUE (category_id, slug)
);
CREATE TABLE IF NOT EXISTS services (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  short text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  position int NOT NULL DEFAULT 0
);
-- photos of products and services (owner = 'product' | 'service')
CREATE TABLE IF NOT EXISTS images (
  id serial PRIMARY KEY,
  owner text NOT NULL,
  owner_id int NOT NULL,
  src text NOT NULL,
  position int NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS images_owner ON images(owner, owner_id, position);
CREATE TABLE IF NOT EXISTS gallery (
  id serial PRIMARY KEY,
  kind text NOT NULL DEFAULT 'photo',
  src text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  caption text NOT NULL DEFAULT '',
  position int NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS posts (
  id serial PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  cover text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  published_at date NOT NULL DEFAULT current_date
);
CREATE TABLE IF NOT EXISTS messages (
  id serial PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  subject text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
`;

const g = globalThis as unknown as { __skDb?: Promise<Q> };

async function connect(): Promise<Q> {
  let query: Q;
  if (process.env.DATABASE_URL) {
    const { Pool } = await import("pg");
    const pool: Pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("railway.internal") ? false : process.env.PGSSL === "1" ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
    query = async (sql, params) => (await pool.query(sql, params as unknown[])).rows;
    await pool.query(SCHEMA);
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { mkdir } = await import("fs/promises");
    const dir = process.env.PGLITE_DIR || "./.data/pglite";
    await mkdir(dir, { recursive: true });
    const db: PGlite = new PGlite(dir);
    await db.waitReady;
    query = async <T,>(sql: string, params?: unknown[]) => (await db.query<T>(sql, params)).rows;
    await db.exec(SCHEMA);
  }
  await seedIfEmpty(query);
  return query;
}

export function db(): Promise<Q> {
  if (!g.__skDb) g.__skDb = connect().catch((e) => { g.__skDb = undefined; throw e; });
  return g.__skDb;
}

export type { Q };
