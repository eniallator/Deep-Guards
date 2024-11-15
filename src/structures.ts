import { Guard, OptionalGuard, OptionalGuardKeys, Schema } from "./types.js";

export const isAnyFunction: Guard<() => unknown> = (
  value
): value is (...args: unknown[]) => unknown => typeof value === "function";

export const isAnyRecord: Guard<Record<string | number | symbol, unknown>> = (
  value
): value is Record<string, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

export function isArrayOf<T>(guard: Guard<T>): Guard<T[]> {
  return (value): value is T[] => Array.isArray(value) && value.every(guard);
}

export function isRecordOf<K extends string | number | symbol, V>(
  keyGuard: Guard<K>,
  valueGuard: Guard<V>
): Guard<Record<K, V>> {
  return (value): value is Record<K, V> =>
    isAnyRecord(value) &&
    Object.entries(value).every(
      ([key, value]) => keyGuard(key) && valueGuard(value)
    );
}

// Not extracting into a type so tooltips show the resultant object, not the guards/intermediary types
export function isObjectOf<S extends Schema>(
  schema: S
): Guard<
  Exclude<keyof S, OptionalGuardKeys<S>> extends never
    ? OptionalGuardKeys<S> extends never
      ? object
      : {
          [K in OptionalGuardKeys<S>]?: S[K] extends OptionalGuard<infer T>
            ? T
            : never;
        }
    : OptionalGuardKeys<S> extends never
    ? {
        [K in Exclude<keyof S, OptionalGuardKeys<S>>]: S[K] extends Guard<
          infer T
        >
          ? T
          : never;
      }
    : {
        [K in Exclude<keyof S, OptionalGuardKeys<S>>]: S[K] extends Guard<
          infer T
        >
          ? T
          : never;
      } & {
        [K in OptionalGuardKeys<S>]?: S[K] extends OptionalGuard<infer T>
          ? T
          : never;
      }
> {
  return ((value) =>
    isAnyRecord(value) &&
    Object.entries(schema).every(
      ([key, valueGuard]) =>
        key in value && (!isAnyFunction(valueGuard) || valueGuard(value[key]))
    )) as ReturnType<typeof isObjectOf<S>>;
}
