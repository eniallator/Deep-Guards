import { GuardSchemaOf, objectKeys } from "./helpers";
import { Guard } from "./types";

export function isOptional<T>(guard: Guard<T>): Guard<T | undefined> {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isOptional expects a guard parameter. Got instead: ${guard}`
    );
  }

  return (value): value is T | undefined => value === undefined || guard(value);
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

function objectEntriesChecks<T extends object>(a: T, b: object): b is T {
  const aKeys = objectKeys(a);
  const bKeySet = new Set(objectKeys(b));
  return (
    aKeys.length === bKeySet.size &&
    aKeys.every((k) => bKeySet.has(k) && isExact(a[k], true)(b[k]))
  );
}

export function isExact<const T>(expected: T, deep: boolean = true): Guard<T> {
  return (value): value is T =>
    // Shallow checks
    expected === value ||
    (Number.isNaN(expected) && Number.isNaN(value)) ||
    (deep &&
      (Array.isArray(expected)
        ? // Array checks
          Array.isArray(value) &&
          expected.length === value.length &&
          expected.every((v, i) => isExact(v, true)(value[i]))
        : // Object checks
          expected != null &&
          value != null &&
          typeof expected === "object" &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          objectEntriesChecks(expected, value)));
}
