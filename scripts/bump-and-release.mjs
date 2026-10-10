#!/usr/bin/env node
import { runInherit } from "./lib/proc.mjs";
import { release } from "./release.mjs";

runInherit("pnpm", ["login"]);
runInherit("pnpm", ["version", "minor"]);

const {
  default: { version },
} = await import("../package.json", { with: { type: "json" } });

release(version);
