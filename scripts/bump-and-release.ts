#!/usr/bin/env node
import { runInherit } from "./lib/proc.ts";
import { release } from "./release.ts";

runInherit("pnpm", ["login"]);
runInherit("pnpm", ["version", "minor"]);

const {
  default: { version },
} = await import("../package.json", { with: { type: "json" } });

release(version);
