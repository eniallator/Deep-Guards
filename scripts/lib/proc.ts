import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { platform } from "node:os";

interface ProcOptions {
  cwd?: string;
}

type SpawnFn<T> = (
  command: string,
  args: string[],
  options: ProcOptions & { shell: boolean }
) => SpawnSyncReturns<T>;

const isWindows = platform() === "win32";

const quoteForCmd = (arg: string) =>
  /[\s"^&|<>()%!]/.test(arg) ? `"${arg.replaceAll('"', '""')}"` : arg;

// Windows CLI shims (pnpm, npm, corepack, ...) are .cmd/.bat files, which
// Node refuses to spawn without a shell. Pre-quote everything into one
// command string so the shell isn't asked to re-parse an unescaped args
// array (Node warns/deprecates passing shell:true with a separate args array).
const toSpawnArgs = (
  command: string,
  args: readonly string[]
): [string, string[]] =>
  isWindows
    ? [[command, ...args].map(quoteForCmd).join(" "), []]
    : [command, [...args]];

const spawnOrThrow = <T extends string | Buffer>(
  spawnFn: SpawnFn<T>,
  command: string,
  args: readonly string[],
  options: ProcOptions
) => {
  const [resolvedCommand, resolvedArgs] = toSpawnArgs(command, args);
  const result = spawnFn(resolvedCommand, resolvedArgs, {
    shell: isWindows,
    ...options,
  });
  if (result.error != null) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} exited with code ${result.status}\n${result.stderr}`
    );
  }
  return result;
};

export const run = (
  command: string,
  args: readonly string[],
  options: ProcOptions = {}
) =>
  spawnOrThrow(
    (c, a, o) => spawnSync(c, a, { encoding: "utf8", ...o }),
    command,
    args,
    options
  ).stdout;

export const runInherit = (
  command: string,
  args: readonly string[],
  options: ProcOptions = {}
) => {
  spawnOrThrow(
    (c, a, o) => spawnSync(c, a, { stdio: "inherit", ...o }),
    command,
    args,
    options
  );
};
