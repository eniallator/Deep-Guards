import {
  Guard,
  ObjectKey,
  OptionalGuard,
  OptionalGuardKeys,
  Schema,
} from "./types.js";

function objectKeys<K extends ObjectKey>(obj: Record<K, unknown>): K[] {
  return (Object.getOwnPropertyNames(obj) as K[]).concat(
    Object.getOwnPropertySymbols(obj) as K[]
  );
}

export const isAnyFunction: Guard<() => unknown> = (
  value
): value is (...args: unknown[]) => unknown => typeof value === "function";

export const isAnyArray: Guard<unknown[]> = (value) => Array.isArray(value);

export const isAnyRecord: Guard<Record<ObjectKey, unknown>> = (
  value
): value is Record<ObjectKey, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

export function isArrayOf<T>(guard: Guard<T>): Guard<T[]> {
  return (value): value is T[] => Array.isArray(value) && value.every(guard);
}
export function isRecordOf<K extends ObjectKey>(
  keyGuard: Guard<K>
): Guard<Record<K, unknown>>;
export function isRecordOf<K extends ObjectKey, V>(
  keyGuard: Guard<K>,
  valueGuard: Guard<V>
): Guard<Record<K, V>>;
export function isRecordOf<K extends ObjectKey, V>(
  keyGuard: Guard<K>,
  valueGuard?: Guard<V>
): Guard<Record<K, V>> {
  return (value): value is Record<K, V> =>
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    objectKeys(value).every(
      (key) => keyGuard(key) && (valueGuard?.(value[key]) ?? true)
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
    objectKeys(schema).every(
      (key) => key in value && schema[key]!(value[key])
    )) as ReturnType<typeof isObjectOf<S>>;
}
