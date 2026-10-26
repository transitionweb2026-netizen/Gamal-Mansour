/**
 * Generates supabase/seed.sql from the real website content.
 *   npm run cms:seed-sql
 *
 * Idempotent SQL (see lib/cms/seed-sql.ts). `npm run cms:verify` fails when the file is stale.
 */
import fs from "node:fs";
import path from "node:path";
import { seedSummary } from "@/lib/cms/seed-data";
import { buildSeedSql } from "@/lib/cms/seed-sql";
import { buildSite } from "@/lib/cms/site";

const out = path.resolve("supabase", "seed.sql");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buildSeedSql());
console.log(`Wrote ${path.relative(process.cwd(), out)}:`, seedSummary(buildSite()));
