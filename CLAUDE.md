# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code philosophy

The author is strict about quality. Actively look for a more elegant way to express something rather than
settling for the first working version:

- **Elegance and conciseness** over verbosity. Prefer expressions over statements, point-free style where it
  stays readable, small composable functions over large procedural ones.
- **Specificity in types.** Avoid `any`/`unknown` unless truly unavoidable, and justify it with an
  `oxlint-disable` comment. Prefer literal types, generics, and branded types over widened primitives. Infer
  return types where inference is exact; annotate explicitly only where inference would be looser than
  intended.
- **Functional paradigm.** Favor immutability, pure functions, and composition over mutation, stateful
  classes, and imperative loops — except where a loop is genuinely clearer or faster, e.g. a hot path or a
  short-circuiting search.
- **Don't over-abstract correct duplication.** A few near-identical lines that are each independently correct
  are not automatically a defect. Consolidate only when there's a real shared invariant at risk of drifting,
  not just to shrink a line count.
- If existing code could be written more elegantly, flag it — don't just match a style that itself has room
  to improve.

## Commands

```bash
pnpm install         # install dependencies (pnpm via Corepack, Node >= 22)
pnpm build           # tsc compile src/ -> dist/
pnpm typecheck       # tsc --noEmit for src (tsconfig.json) and test files (tsconfig.test.json)
pnpm lint            # oxlint src (type-aware, via oxlint-tsgolint; see .oxlintrc.json)
pnpm format          # prettier --write . (also organizes/type-annotates imports)
pnpm format:check    # prettier --check .
pnpm findissues      # typecheck + lint + format:check
pnpm test            # vitest run (100% coverage enforced, per file)
pnpm prepublish      # typecheck + lint + format:check + build + test + publint + check-output
```

```bash
pnpm vitest run src/structures.test.ts   # single test file
pnpm vitest run -t "name of the test"    # single test case
```

`tsconfig.json` excludes `*.test.ts`, so `pnpm typecheck` runs a second pass over them via
`tsconfig.test.json` (which `pnpm lint`'s type-aware pass also uses).

Coverage thresholds are 100% for statements/branches/functions/lines, evaluated **per file** — a new file
needs full coverage on its own, not just in aggregate.

## Architecture

### Module layout

A flat set of modules under `src/`, all re-exported from `src/index.ts`:

- `types.ts` — the `Guard<T>` type (`(value: unknown) => value is T`) and `TypeFromGuard`.
- `primitives.ts` — guards for primitive values (`isString`, `isNumber`, ...).
- `compound.ts` — higher-order guards built from other guards (`isOptional`, `isUnionOf`, `isExact`, ...).
- `structures.ts` — guards for arrays, tuples, records and objects (`isArrayOf`, `isObjectOf`, ...).
- `macros.ts` — specialised guards composed from the above (`isDiscriminatedObjectOf`).
- `errors.ts` — `GuardError` and `guardOrThrow`.
- `helpers.ts` — internal helpers such as `objectKeys` (includes symbol keys) and `omit`.

`sideEffects: false` is load-bearing — new code must stay side-effect-free at module scope.

Imports use explicit `.ts` extensions and `import type` for type-only imports (both enforced by
config/lint); `pnpm format` sorts and dedupes them automatically.

### Guard factories validate their arguments

Higher-order guards (`isArrayOf`, `isOptional`, `isObjectOf`, ...) throw a `TypeError` when handed something
that isn't a guard, so misuse fails at construction rather than silently returning `false` later. Keep that
behaviour, with its own test, when adding a new factory.

### Runtime floor

`engines.node` is `>=18`, so shipped code must not use anything newer than Node 18. Notably, avoid iterator
helpers (`.map`/`.every` directly on Map/Set/array iterators), which need Node 22: use `for...of` (see
`everyOf` in `helpers.ts`) or `Array.from` instead. `pnpm smoke` runs the built `dist` using plain JS, and CI's
`smoke` job does the same on Node 18 and 20, which is what backs the `engines` claim. The dev tooling (vitest,
oxlint) needs a newer Node, but that only affects contributors.
