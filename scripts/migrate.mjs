// Applies db/schema.sql to the Neon database from DATABASE_URL.
// Usage: npm run db:migrate  (reads .env.local automatically)
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// minimal .env.local loader (no extra dependency)
try {
  const env = readFileSync(resolve(root, ".env.local"), "utf8");
  for (const line of env.split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)="?([^"]*)"?$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // no .env.local — rely on real env
}

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);
const schema = readFileSync(resolve(root, "db/schema.sql"), "utf8");

// split on semicolons at end of statements (schema has no functions/triggers)
const statements = schema
  .split(/;\s*\n/)
  .map((s) =>
    s
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim()
  )
  .filter(Boolean);

for (const stmt of statements) {
  await sql.query(stmt);
}

const [{ count }] = await sql`select count(*)::int as count from orders`;
console.log(`Schema applied. orders table exists with ${count} rows.`);
