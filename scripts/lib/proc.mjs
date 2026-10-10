import { spawnSync } from "node:child_process";
import { platform } from "node:os";

const isWindows = platform() === "win32";

function quoteForCmd(arg) {
  return /[\s"^&|<>()%!]/.test(arg) ? `"${arg.replaceAll('"', '""')}"` : arg;
}

// Windows CLI shims (pnpm, npm, corepack, ...) are .cmd/.bat files, which
// Node refuses to spawn without a shell. Pre-quote everything into one
// command string so the shell isn't asked to re-parse an unescaped args
// array (Node warns/deprecates passing shell:true with a separate args array).
function toSpawnArgs(command, args) {
  if (!isWindows) return [command, args];
  return [[command, ...args].map(quoteForCmd).join(" "), []];
}

function spawnOrThrow(spawnFn, command, args, options) {
  const [resolvedCommand, resolvedArgs] = toSpawnArgs(command, args);
  const result = spawnFn(resolvedCommand, resolvedArgs, {
    shell: isWindows,
    ...options,
  });
  if (result.error != null) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with code ${result.status}\n${result.stderr ?? ""}`
    );
  }
  return result;
}

export function run(command, args, options = {}) {
  return spawnOrThrow(
    (c, a, o) => spawnSync(c, a, { encoding: "utf8", ...o }),
    command,
    args,
    options
  ).stdout;
}

export function runInherit(command, args, options = {}) {
  spawnOrThrow(
    (c, a, o) => spawnSync(c, a, { stdio: "inherit", ...o }),
    command,
    args,
    options
  );
}
