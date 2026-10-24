#!/usr/bin/env node
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as tar from "tar";

import { run } from "./lib/proc.ts";

interface Packed {
  filename: string;
}

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

const tryPack = () => {
  for (const [command, args] of [
    ["pnpm", ["pack", "--json"]],
    ["npm", ["pack", "--json"]],
    ["corepack", ["npm", "pack", "--json"]],
  ] as const) {
    try {
      return run(command, args, { cwd: repoRoot });
    } catch {
      continue;
    }
  }
  throw new Error("Failed to run npm pack.");
};

console.log("Packing package for inspection..");

const packed = JSON.parse(tryPack()) as Packed | [Packed, ...Packed[]];
const tarballFile = Array.isArray(packed)
  ? packed[0].filename
  : packed.filename;
const tarball = resolve(repoRoot, tarballFile);

console.log(`Created tarball: ${tarballFile}`);

const paths = new Set<string>();
const pkgJsonChunks: Uint8Array[] = [];

await tar.list({
  file: tarball,
  onReadEntry: entry => {
    paths.add(entry.path);
    if (entry.path === "package/package.json") {
      entry.on("data", (chunk: Uint8Array) => pkgJsonChunks.push(chunk));
    }
  },
});

for (const expected of [
  "package/dist/index.js",
  "package/dist/index.d.ts",
  "package/package.json",
]) {
  if (!paths.has(expected)) {
    throw new Error(`Missing expected file: ${expected}`);
  }
}

const pkg = JSON.parse(
  Buffer.concat(pkgJsonChunks).toString("utf8")
) as Partial<Record<"files" | "main" | "types", unknown>>;

if (
  !Array.isArray(pkg.files) ||
  !pkg.files.includes("dist") ||
  pkg.main !== "dist/index.js" ||
  pkg.types !== "dist/index.d.ts"
) {
  throw new Error("package.json contains invalid package entry fields.");
}

console.log("Package output inspection passed.");

rmSync(tarball, { force: true });
