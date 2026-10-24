import type { Guard } from "./types.ts";

export type NonEmptyGuards = readonly [Guard<unknown>, ...Guard<unknown>[]];

const stringify = (value: unknown): string => {
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
};

export const invalidParam = (
  name: string,
  expected: string,
  received: unknown
): TypeError =>
  new TypeError(
    `${name} expects ${expected}. Got instead: ${stringify(received)}`
  );

export const everyOf = <T>(
  items: Iterable<T>,
  predicate: (item: T) => unknown
): boolean => {
  for (const item of items) if (!predicate(item)) return false;
  return true;
};

export const objectKeys = <K extends PropertyKey>(
  obj: Record<K, unknown>
): K[] =>
  (Object.getOwnPropertyNames(obj) as K[]).concat(
    Object.getOwnPropertySymbols(obj) as K[]
  );

export const omit = <O extends NonNullable<unknown>>(
  obj: O,
  key: keyof O
): { [K in keyof O as K extends typeof key ? never : K]: O[K] } => {
  const omitted = { ...obj };
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete omitted[key];
  return omitted;
};
