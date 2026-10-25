// Post-export fix for a Next.js static-export bug on Windows.
//
// next/dist/export collects segment-prefetch files with `path.relative`, which yields backslash
// paths on Windows. The filename encoder only converts "/" to ".", so the files end up nested
// (out/ar/contact/__next.$d$lang/contact/__PAGE__.txt) instead of flat
// (out/ar/contact/__next.$d$lang.contact.__PAGE__.txt) — the name the client router requests.
//
// This script flattens any such nested folders. On Linux/macOS builds there is nothing to fix,
// so it is a no-op. Safe to run repeatedly.
import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
if (!fs.existsSync(outDir)) process.exit(0);

let moved = 0;

function filesUnder(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? filesUnder(p) : [p];
  });
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      for (const file of filesUnder(full)) {
        const flat = path.relative(dir, file).split(path.sep).join(".");
        fs.renameSync(file, path.join(dir, flat));
        moved++;
      }
      fs.rmSync(full, { recursive: true, force: true });
    } else {
      walk(full);
    }
  }
}

walk(outDir);
console.log(moved ? `fix-export-segments: flattened ${moved} segment prefetch file(s)` : "fix-export-segments: nothing to fix");
