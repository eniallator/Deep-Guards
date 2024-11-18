import { Guard, OptionalGuard } from "./types.js";

export const isOptional = <T>(guard: Guard<T>): OptionalGuard<T> =>
  ((value) => value === undefined || guard(value)) as OptionalGuard<T>;

export function isNullable<T>(guard: Guard<T>): Guard<T | null | undefined> {
  return (value: unknown): value is T | null | undefined =>
    value == null || guard(value);
}

export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isNot<const N>(guard: Guard<N>) {
  return <const T>(value: T | N): value is T => !guard(value);
}

export function isOneOf<
  const T extends (string | number | boolean | symbol | null | undefined)[]
>(...values: T): Guard<(typeof values)[number]> {
  const valueSet = new Set(values);
  return (value: unknown): value is T[number] =>
    valueSet.has(value as T[number]);
}

export function isUnionOf<G extends Guard<unknown>[]>(
  ...guards: G
): Guard<G extends Guard<infer T>[] ? T : never> {
  return (value): value is G extends Guard<infer T>[] ? T : never =>
    guards.some((guard) => guard(value));
}

function isEqual<T>(a: T, b: T): boolean {
  return (
    a === b ||
    (a != null &&
      b != null &&
      typeof a === "object" &&
      typeof b === "object" &&
      (Array.isArray(a)
        ? Array.isArray(b) &&
          a.length === b.length &&
          a.every((v, i) => isEqual(v, b[i]))
        : Object.keys(a).length === Object.keys(b).length &&
          Object.entries(a).every(
            ([k, v]) => k in b && isEqual(v, (b as Record<string, unknown>)[k])
          )))
  );
}

export function isExact<const T>(expected: T, deep: boolean = true): Guard<T> {
  return (value): value is T =>
    deep ? isEqual(value, expected) : value === expected;
}
