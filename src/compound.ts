import { objectKeys } from "./helpers.js";

import type { GuardSchemaOf, ObjectKey } from "./helpers.js";
import type { Guard } from "./types.js";

export function isOptional<T>(guard: Guard<T>): Guard<T | undefined> {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isOptional expects a guard parameter. Got instead: ${guard}`,
    );
  }

  return (value): value is T | undefined => value === undefined || guard(value);
}

export function isNullable<T>(guard: Guard<T>): Guard<T | null | undefined> {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isNullable expects a guard parameter. Got instead: ${guard}`,
    );
  }

  return (value: unknown): value is T | null | undefined =>
    value == null || guard(value);
}

export function isNonNullable<T extends NonNullable<unknown>>(
  value: T | null | undefined,
): value is T {
  return value != null;
}

export function isNot<const N>(guard: Guard<N>) {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isNot expects a guard parameter. Got instead: ${guard}`,
    );
  }

  return <const T>(value: T | N): value is T => !guard(value);
}

export function isOneOf<
  const T extends (string | number | boolean | symbol | null | undefined)[],
>(...values: T): Guard<T[number]> {
  const valueSet = new Set(values);
  return (value) => (valueSet.has as Guard<T[number]>)(value);
}

export function isUnionOf<T extends readonly unknown[]>(
  ...guards: GuardSchemaOf<T>
): Guard<T[number]> {
  if (guards.every((guard) => typeof guard !== "function")) {
    throw new TypeError(
      `isUnionOf expects N guard parameters. Got instead: ${guards}`,
    );
  }

  return (value): value is T => guards.some((guard) => guard(value));
}

type ArrayToIntersection<A extends readonly unknown[]> = A extends [
  infer T,
  ...infer R,
]
  ? T & ArrayToIntersection<R>
  : unknown;

export function isIntersectionOf<T extends readonly unknown[]>(
  ...guards: GuardSchemaOf<T>
): Guard<ArrayToIntersection<T>> {
  if (guards.every((guard) => typeof guard !== "function")) {
    throw new TypeError(
      `isIntersectionOf expects N guard parameters. Got instead: ${guards}`,
    );
  }

  return (value): value is ArrayToIntersection<T> =>
    guards.every((guard) => guard(value));
}

export function isExact<const T>(expected: T): Guard<T> {
  // Primitive checks
  if (typeof expected !== "object" || expected === null) {
    // NaN check
    if (typeof expected === "number" && Number.isNaN(expected)) {
      return (value): value is T =>
        typeof value === "number" && Number.isNaN(value);
    }
    return (value): value is T => value === expected;
  }

  // Date checks
  if (expected instanceof Date) {
    return (value): value is T =>
      value instanceof Date && expected.getTime() === value.getTime();
  }

  // RegExp checks
  if (expected instanceof RegExp) {
    return (value): value is T =>
      value instanceof RegExp &&
      expected.source === value.source &&
      expected.flags === value.flags;
  }

  // Error checks
  if (expected instanceof Error) {
    return (value): value is T =>
      value instanceof Error &&
      expected.name === value.name &&
      expected.message === value.message;
  }

  // Map checks
  if (expected instanceof Map) {
    const guards = Array.from(
      expected
        .entries()
        .map(([k, v]) => [k, isExact(v)] as [string, Guard<unknown>]),
    );

    return (value): value is T =>
      value instanceof Map &&
      expected.size === value.size &&
      guards.every(([k, guard]) => value.has(k) && guard(value.get(k)));
  }

  // Set checks
  if (expected instanceof Set) {
    const guards = new Map(
      expected.values().map((v): [unknown, Guard<unknown>] => [v, isExact(v)]),
    );

    return (value): value is T =>
      value instanceof Set &&
      expected.size === value.size &&
      value.values().every((v) => guards.get(v)?.(v));
  }

  // Typed Array checks
  if (ArrayBuffer.isView(expected) && !(expected instanceof DataView)) {
    const guards = Array.from(expected as unknown as ArrayLike<number>).map(
      (v) => isExact(v),
    );

    return (value): value is T =>
      ArrayBuffer.isView(value) &&
      !(value instanceof DataView) &&
      expected.constructor === value.constructor &&
      (expected as unknown as ArrayLike<number>).length ===
        (value as unknown as ArrayLike<number>).length &&
      guards.every((guard, i) =>
        guard((value as unknown as ArrayLike<number>)[i]),
      );
  }

  // Array checks
  if (Array.isArray(expected)) {
    const guards = expected.map((v) => isExact(v));

    return (value): value is T =>
      Array.isArray(value) &&
      expected.length === value.length &&
      guards.every((guard, i) => guard(value[i]));
  }

  // Object checks
  const guards = objectKeys(expected).map(
    (k) => [k, isExact(expected[k])] as [ObjectKey, Guard<unknown>],
  );

  function objectEntriesChecks(value: object): value is T & object {
    const valueKeys = new Set(objectKeys(value) as ObjectKey[]);
    return (
      guards.length === valueKeys.size &&
      guards.every(
        ([k, guard]) =>
          valueKeys.has(k) && guard((value as Record<ObjectKey, unknown>)[k]),
      )
    );
  }

  return (value): value is T =>
    typeof value === "object" &&
    value != null &&
    !Array.isArray(value) &&
    objectKeys(value).length === guards.length &&
    objectEntriesChecks(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isInstance<C extends abstract new (...args: any) => unknown>(
  cls: C,
): Guard<InstanceType<C>> {
  return (value): value is InstanceType<C> => value instanceof cls;
}
