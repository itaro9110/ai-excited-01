import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const source = join(here, "entry.png");

if (!existsSync(source)) {
  throw new Error(`entry.png not found next to main.ts: ${source}`);
}

const rawOutDir = process.env.MAKEFUN_OUTPUT_DIR;
const outDir = rawOutDir && rawOutDir.trim() !== "" ? rawOutDir : "/output";
mkdirSync(outDir, { recursive: true });

const target = join(outDir, "entry.png");
copyFileSync(source, target);

// Verify the copy is a whole PNG and matches the bundled image byte for byte.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const written = readFileSync(target);
if (!written.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error(`Output is not a PNG: ${target}`);
}
if (written.length !== statSync(source).size) {
  throw new Error(`Output size mismatch: ${written.length} bytes written`);
}
console.log(`Wrote ${target} (${written.length} bytes)`);
