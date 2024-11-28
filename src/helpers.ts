import { Guard } from "./types.js";

export type GuardSchemaOf<O extends object> = {
  [K in keyof O]: Guard<O[K]>;
};

export type ObjectKey = string | number | symbol;

export const objectKeys = <K extends ObjectKey>(obj: Record<K, unknown>): K[] =>
  (Object.getOwnPropertyNames(obj) as K[]).concat(
    Object.getOwnPropertySymbols(obj) as K[]
  );

export function omit<O extends object>(
  obj: O,
  key: keyof O
): { [K in keyof O as K extends typeof key ? never : K]: O[K] } {
  const omitted = { ...obj };
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete omitted[key];
  return omitted;
}
