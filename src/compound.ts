import { Guard, GuardSchemaOf } from "./types.js";

export function isOptional<T>(guard: Guard<T>): Guard<T | undefined> {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isOptional expects a guard parameter. Got instead: ${guard}`
    );
  }

  return ((value) => value === undefined || guard(value)) as Guard<
    T | undefined
  >;
}

export function isNullable<T>(guard: Guard<T>): Guard<T | null | undefined> {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isNullable expects a guard parameter. Got instead: ${guard}`
    );
  }

  return (value: unknown): value is T | null | undefined =>
    value == null || guard(value);
}

export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isNot<const N>(guard: Guard<N>) {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isNot expects a guard parameter. Got instead: ${guard}`
    );
  }

  return <const T>(value: T | N): value is T => !guard(value);
}

export function isOneOf<
  const T extends (string | number | boolean | symbol | null | undefined)[]
>(...values: T): Guard<(typeof values)[number]> {
  const valueSet = new Set(values);
  return (value: unknown): value is T[number] =>
    valueSet.has(value as T[number]);
}

export function isUnionOf<T extends readonly unknown[]>(
  ...guards: GuardSchemaOf<T>
): Guard<T[number]> {
  if (guards.every((guard) => typeof guard !== "function")) {
    throw new TypeError(
      `isUnionOf expects N guard parameters. Got instead: ${guards}`
    );
  }

  return (value): value is T => guards.some((guard) => guard(value));
}

type ArrayToIntersection<A extends readonly unknown[]> = A extends [
  infer T,
  ...infer R
]
  ? T & ArrayToIntersection<R>
  : unknown;

export function isIntersectionOf<T extends readonly unknown[]>(
  ...guards: GuardSchemaOf<T>
): Guard<ArrayToIntersection<T>> {
  if (guards.every((guard) => typeof guard !== "function")) {
    throw new TypeError(
      `isIntersectionOf expects N guard parameters. Got instead: ${guards}`
    );
  }

  return (value): value is ArrayToIntersection<T> =>
    guards.every((guard) => guard(value));
}

function isEqual<T>(a: T, b: unknown): b is T {
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
    deep ? isEqual(expected, value) : expected === value;
}
