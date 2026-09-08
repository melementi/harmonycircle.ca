// Build gate: browser-shipped JavaScript.
//
// Teardown §6: 113 KB of article HTML hardcoded into the reference site's entry
// chunk, 21% of it, so every visitor downloads the whole news archive to read
// the home page. A first-party chunk that crosses this line is almost always
// content that belongs in a content collection or in Supabase.
//
// Scope is `dist/client` only. `dist/server` is Worker code and is never
// downloaded by a visitor, so measuring it would fail the build for a reason
// that costs no one anything.
//
// Exceptions are named, not implicit. Anything in ALLOWANCES has to carry a
// written reason, so a chunk growing past the budget is a decision somebody
// makes on purpose rather than a number that quietly drifts.
import { readdir, stat, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { gzipSync } from "node:zlib";

const CLIENT_DIR = join("dist", "client");
const BUDGET_BYTES = 150 * 1024;

const ALLOWANCES = [
  {
    match: /^_astro\/client\.[A-Za-z0-9_-]+\.js$/,
    ceiling: 200 * 1024,
    reason:
      "React 19 DOM runtime. The stack is locked to React islands (CLAUDE.md), " +
      "and Nav + RingCanvas put one on every page, so this ships site-wide.",
  },
];

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

const chunks = [];
for await (const file of walk(CLIENT_DIR)) {
  if (!file.endsWith(".js") && !file.endsWith(".mjs")) continue;
  const name = relative(CLIENT_DIR, file).split("\\").join("/");
  const raw = (await stat(file)).size;
  const gzip = gzipSync(await readFile(file)).length;
  chunks.push({ name, raw, gzip });
}

chunks.sort((a, b) => b.raw - a.raw);

const offenders = [];
for (const chunk of chunks) {
  const allowance = ALLOWANCES.find((a) => a.match.test(chunk.name));
  const ceiling = allowance ? allowance.ceiling : BUDGET_BYTES;
  chunk.allowed = Boolean(allowance);
  if (chunk.raw > ceiling) offenders.push({ ...chunk, ceiling });
}

const totalRaw = chunks.reduce((n, c) => n + c.raw, 0);
const totalGzip = chunks.reduce((n, c) => n + c.gzip, 0);

console.log(`\naudit:js — ${chunks.length} client chunks, ${kb(totalRaw)} raw / ${kb(totalGzip)} gzip\n`);
for (const c of chunks) {
  console.log(
    `  ${kb(c.raw).padStart(8)} raw  ${kb(c.gzip).padStart(7)} gzip  ${c.name}${c.allowed ? "  (allowed)" : ""}`,
  );
}

if (offenders.length > 0) {
  console.error(`\naudit:js FAILED — ${offenders.length} chunk(s) over budget:\n`);
  for (const o of offenders) {
    console.error(`  ${kb(o.raw)} > ${kb(o.ceiling)}  ${o.name}`);
  }
  console.error(
    "\nContent belongs in a content collection or Supabase, never a bundled string.\n" +
      "If the size is genuinely unavoidable, add it to ALLOWANCES in this file with a reason.\n",
  );
  process.exit(1);
}

console.log("\naudit:js ok\n");
