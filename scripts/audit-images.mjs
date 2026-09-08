// Build gate: no emitted image over the budget.
//
// Teardown §6 lists a 2.7 MB PNG headshot shipped next to three ~130 KB JPEGs.
// That is not a mistake anyone makes on purpose; it is what happens when
// nothing checks. This checks.
//
// Cross-platform: node only, no shell, no POSIX paths.
import { readdir, stat } from "node:fs/promises";
import { join, extname, relative } from "node:path";

const DIST = "dist";
const BUDGET_BYTES = 250 * 1024;
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"]);

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

const offenders = [];
let checked = 0;

for await (const file of walk(DIST)) {
  if (!IMAGE_EXTENSIONS.has(extname(file).toLowerCase())) continue;
  checked++;
  const { size } = await stat(file);
  if (size > BUDGET_BYTES) offenders.push({ file: relative(DIST, file), size });
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

if (offenders.length > 0) {
  console.error(`\naudit:img FAILED — ${offenders.length} of ${checked} images over ${kb(BUDGET_BYTES)}:\n`);
  for (const o of offenders.sort((a, b) => b.size - a.size)) {
    console.error(`  ${kb(o.size).padStart(8)}  ${o.file}`);
  }
  console.error("\nEvery image goes through astro:assets, sized to 2x its display box.\n");
  process.exit(1);
}

console.log(`audit:img ok — ${checked} images, none over ${kb(BUDGET_BYTES)}`);
