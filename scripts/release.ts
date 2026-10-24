#!/usr/bin/env node
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { runInherit } from "./lib/proc.ts";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export const release = (version: string) => {
  runInherit("pnpm", ["prepublish"], { cwd: repoRoot });
  runInherit("git", ["add", "."], { cwd: repoRoot });
  runInherit("git", ["commit", "--allow-empty", "-m", `Release ${version}`], {
    cwd: repoRoot,
  });
  runInherit("git", ["tag", "-a", version, "-m", `Release ${version}`], {
    cwd: repoRoot,
  });
  runInherit("git", ["push", "--no-verify"], { cwd: repoRoot });
  runInherit("git", ["push", "--tags", "--no-verify"], { cwd: repoRoot });
  runInherit("pnpm", ["publish", "--no-git-checks", "--access", "public"], {
    cwd: repoRoot,
  });
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {
    default: { version },
  } = await import("../package.json", { with: { type: "json" } });
  release(version);
}
