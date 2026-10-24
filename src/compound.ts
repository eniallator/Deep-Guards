import {
  everyOf,
  invalidParam,
  objectKeys,
  type NonEmptyGuards,
} from "./helpers.ts";
import {
  optionalSymbol,
  type Guard,
  type OptionalGuard,
  type TypeFromGuard,
} from "./types.ts";

export const isOptional = <T>(guard: Guard<T>): OptionalGuard<T> => {
  if (typeof guard !== "function") {
    throw invalidParam("isOptional", "a guard parameter", guard);
  }

  return Object.assign(
    (value: unknown): value is T | undefined =>
      value === undefined || guard(value),
    { [optionalSymbol]: true as const }
  );
};

export const isNullable = <T>(guard: Guard<T>): Guard<T | null | undefined> => {
  if (typeof guard !== "function") {
    throw invalidParam("isNullable", "a guard parameter", guard);
  }

  return (value: unknown): value is T | null | undefined =>
    value == null || guard(value);
};

export const isNonNullable = <T extends NonNullable<unknown>>(
  value: T | null | undefined
): value is T => value != null;

type Falsey = undefined | false | null | "" | 0n | 0;
export const isFalsey: Guard<Falsey> = (value): value is Falsey => !value;

export const isNot = <const N>(
  guard: Guard<N>
): (<const T>(value: T | N) => value is T) => {
  if (typeof guard !== "function") {
    throw invalidParam("isNot", "a guard parameter", guard);
  }

  return <const T>(value: T | N): value is T => !guard(value);
};

export const isOneOf = <
  const T extends (string | number | boolean | symbol | null | undefined)[],
>(
  ...values: T
): Guard<T[number]> => {
  const valueSet = new Set<unknown>(values);
  return (value): value is T[number] => valueSet.has(value);
};

export const isUnionOf = <const G extends NonEmptyGuards>(
  ...guards: G
): Guard<TypeFromGuard<G[number]>> => {
  if (
    guards.length === 0 ||
    guards.some(guard => typeof guard !== "function")
  ) {
    throw invalidParam("isUnionOf", "one or more guard parameters", guards);
  }

  return (value): value is TypeFromGuard<G[number]> =>
    guards.some(guard => guard(value));
};

type IntersectionFromGuards<G extends readonly Guard<unknown>[]> =
  G extends readonly [
    infer First extends Guard<unknown>,
    ...infer Rest extends Guard<unknown>[],
  ]
    ? TypeFromGuard<First> & IntersectionFromGuards<Rest>
    : unknown;

export const isIntersectionOf = <const G extends NonEmptyGuards>(
  ...guards: G
): Guard<IntersectionFromGuards<G>> => {
  if (
    guards.length === 0 ||
    guards.some(guard => typeof guard !== "function")
  ) {
    throw invalidParam(
      "isIntersectionOf",
      "one or more guard parameters",
      guards
    );
  }

  return (value): value is IntersectionFromGuards<G> =>
    guards.every(guard => guard(value));
};

export const isExact = <const T>(expected: T): Guard<T> => {
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
    const guards = Array.from(expected, ([k, v]) => [k, isExact(v)] as const);

    return (value): value is T =>
      value instanceof Map &&
      expected.size === value.size &&
      guards.every(([k, guard]) => value.has(k) && guard(value.get(k)));
  }

  // Set checks
  if (expected instanceof Set) {
    const guards = new Map(
      Array.from(expected, (v): [unknown, Guard<unknown>] => [v, isExact(v)])
    );

    return (value): value is T =>
      value instanceof Set &&
      expected.size === value.size &&
      everyOf(value, v => guards.get(v)?.(v));
  }

  // Typed Array checks
  if (ArrayBuffer.isView(expected) && !(expected instanceof DataView)) {
    const guards = Array.from(expected as unknown as ArrayLike<number>).map(v =>
      isExact(v)
    );

    return (value): value is T =>
      ArrayBuffer.isView(value) &&
      !(value instanceof DataView) &&
      expected.constructor === value.constructor &&
      (expected as unknown as ArrayLike<number>).length ===
        (value as unknown as ArrayLike<number>).length &&
      guards.every((guard, i) =>
        guard((value as unknown as ArrayLike<number>)[i])
      );
  }

  // Array checks
  if (Array.isArray(expected)) {
    const guards = expected.map(v => isExact(v));

    return (value): value is T =>
      Array.isArray(value) &&
      expected.length === value.length &&
      guards.every((guard, i) => guard(value[i]));
  }

  // Object checks
  const guards = objectKeys(expected).map(
    k => [k, isExact(expected[k])] as [PropertyKey, Guard<unknown>]
  );

  const objectEntriesChecks = (value: object): value is T & object => {
    const valueKeys = new Set(objectKeys(value) as PropertyKey[]);
    return (
      guards.length === valueKeys.size &&
      guards.every(
        ([k, guard]) =>
          valueKeys.has(k) && guard((value as Record<PropertyKey, unknown>)[k])
      )
    );
  };

  return (value): value is T =>
    typeof value === "object" &&
    value != null &&
    !Array.isArray(value) &&
    objectEntriesChecks(value);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInstance = <C extends abstract new (...args: any) => unknown>(
  cls: C
): Guard<InstanceType<C>> => {
  if (typeof cls !== "function") {
    throw invalidParam("isInstance", "a class parameter", cls);
  }

  return (value): value is InstanceType<C> => value instanceof cls;
};
