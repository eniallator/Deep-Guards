# Changelog

All notable changes to this project are documented here. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-10-24

### Breaking changes

- `isObjectOf` no longer takes an `exactKeys` boolean. Use the new `isExactObjectOf(schema)` instead of `isObjectOf(schema, true)`. `isObjectOf(schema)` is unchanged and still allows extra keys.
- `isObjectOf`, `isTupleOf`, `isUnionOf` and `isIntersectionOf` now infer their result from the guards you pass in. Their generic parameter is the guards/schema type rather than the guarded type, so explicit type arguments such as `isObjectOf<Foo>(...)` no longer compile. Drop the type argument and let it infer.
- `isUnionOf`, `isIntersectionOf` and `isTupleOf` need at least one guard, and `isObjectOf` / `isExactObjectOf` need a non-empty schema. Empty calls are now compile errors, and throw a `TypeError` at runtime. Previously `isUnionOf()`, `isIntersectionOf()` and `isTupleOf()` returned a guard, and `isObjectOf({})` threw a plain `Error`.
- `isArrayOf` now guards holes in sparse arrays as `undefined`. `[1, , 3]` no longer passes `isArrayOf(isNumber)`.
- Error messages were rewritten into one form: `<function> expects <what>. Got instead: <value>`. Code matching on message text will need updating; the error class is still `TypeError`.
- The `GuardSchemaOf` type is no longer exported.

### Added

- `OptionalGuard<T>` and `optionalSymbol` exports. `isOptional` now returns an `OptionalGuard<T>`, a `Guard<T | undefined>` carrying a marker property.
- `isObjectOf` and `isExactObjectOf` treat a key whose guard is an optional guard as optional: it may be missing from the object, and is an optional key (`key?: T`) in the guarded type.
- `isTupleOf` treats trailing optional guards as optional elements: the array may be shorter, and the guarded type has optional elements (`[number, string?]`).
- `isExactObjectOf`, which rejects any object with keys that are not in the schema (string or symbol).
- README sections for `isFalsey`, `isExactObjectOf`, how `isOptional` works, and a Conventions section.

### Fixed

- `isExact` on `Map` and `Set` values threw on Node versions below 22, as it relied on iterator helpers, even though 1.4.0 declared `engines.node` as `>=18`. `isExact` and `isArrayOf` no longer use iterator helpers, so the declared `>=18` now holds. The built package is run on Node 18 and 20 in CI to keep it that way.
- `isUnionOf` and `isIntersectionOf` only threw for non-guard arguments when _every_ argument was invalid. They now throw if any argument is.
- `isInstance` now throws a `TypeError` at construction for a non-function, rather than failing on first use.
- `isDiscriminatedObjectOf` now validates its `guard` and `key` arguments at construction.
- `isUnionOf`'s type predicate now matches its return type.
- Invalid-argument errors no longer crash or print `undefined` for BigInt, circular, function or symbol values.

### Internal

- `isNot` has an explicit return type, and `isFalsey` is declared as a `Guard<Falsey>`.
- Module-level calls carry `/* @__PURE__ */` annotations so unused guards can be tree-shaken.
- Added `scripts/smoke.mjs` (`pnpm smoke`), which exercises the built package using plain JS, and a CI job that runs it on Node 18 and 20.
- Tooling moved from Yarn to pnpm, from ESLint to oxlint, with Prettier formatting, TypeScript 7, and release scripts written in TypeScript. Coverage is enforced at 100% per file.

## [1.4.0] - 2026-06-04

### Added

- `isFalsey` guard.
- Package metadata for consumers: an `exports` map, a `files` allowlist, `sideEffects: false`, keywords, `repository` and `bugs` links.
- `publint`, `attw` and output checks as part of the pre-publish process.
- `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.

### Changed

- `engines.node` was lowered from `>=25.4.0` to `>=18`.

## [1.3.1] - 2026-02-15

### Fixed

- `isExact` no longer does a second, redundant key-count check when comparing objects.

## [1.3.0] - 2026-02-15

### Changed

- `isExact` was reworked to memoise its checks upfront based on the expected value, so it is much faster when the guard is created once and reused.
- `isExact` now compares `Date`, `RegExp`, `Error`, `Map`, `Set` and typed array values, and treats `NaN` as equal to `NaN`.
- `isExact` no longer takes a `deep` parameter; comparison is always deep.

## [1.2.0] - 2026-02-14

### Added

- `isInstance` guard, which uses `instanceof`.

### Changed

- Added `engines.node` of `>=25.4.0`.

### Internal

- Tests moved from Jest to Vitest and now live next to the source.

## [1.1.0] - 2025-08-15

### Changed

- `isFunction` is now `Guard<(...args: any[]) => unknown>`, so function types with typed arguments are assignable to it.
- `isNonNullable` now constrains its type parameter to `NonNullable<unknown>`.

### Internal

- Added scripts for bumping the version and releasing.
- Moved to Yarn 4.

## [1.0.5] - 2024-11-28

### Fixed

- Restored the `.js` extensions on the entry point's re-exports, which were missing in 1.0.3 and 1.0.4.

## [1.0.4] - 2024-11-28

### Added

- `isObjectOf` takes an optional `exactKeys` boolean, which rejects objects with extra keys.
- `isDiscriminatedObjectOf` takes an optional key parameter, to choose which key holds the discriminator.

### Changed

- `isExact` now passes for more cases and has a cleaner implementation.

## [1.0.3] - 2024-11-26

### Added

- `isTupleOf` guard.
- Tests for the macros.

## [1.0.2] - 2024-11-24

### Added

- `isIntersectionOf` guard.
- `isDiscriminatedObjectOf` macro.

## [1.0.1] - 2024-11-19

### Added

- Initial release: the primitive guards (`isUnknown`, `isNull`, `isUndefined`, `isNumber`, `isInteger`, `isString`, `isSymbol`, `isBoolean`, `isFunction`), the compound guards (`isOptional`, `isNullable`, `isNonNullable`, `isNot`, `isOneOf`, `isUnionOf`, `isExact`), the structure guards (`isAnyArray`, `isAnyRecord`, `isArrayOf`, `isRecordOf`, `isObjectOf`), `guardOrThrow` with `GuardError`, and the `TypeFromGuard` helper type.
- Higher order guards check their arguments and throw a `TypeError` when given something that is not a guard.

[2.0.0]: https://github.com/eniallator/Deep-Guards/compare/1.4.0...2.0.0
[1.4.0]: https://github.com/eniallator/Deep-Guards/compare/1.3.1...1.4.0
[1.3.1]: https://github.com/eniallator/Deep-Guards/compare/1.3.0...1.3.1
[1.3.0]: https://github.com/eniallator/Deep-Guards/compare/1.2.0...1.3.0
[1.2.0]: https://github.com/eniallator/Deep-Guards/compare/1.1.0...1.2.0
[1.1.0]: https://github.com/eniallator/Deep-Guards/compare/1.0.5...1.1.0
[1.0.5]: https://github.com/eniallator/Deep-Guards/compare/1.0.4...1.0.5
[1.0.4]: https://github.com/eniallator/Deep-Guards/compare/1.0.3...1.0.4
[1.0.3]: https://github.com/eniallator/Deep-Guards/compare/1.0.2...1.0.3
[1.0.2]: https://github.com/eniallator/Deep-Guards/compare/1.0.1...1.0.2
[1.0.1]: https://github.com/eniallator/Deep-Guards/releases/tag/1.0.1
