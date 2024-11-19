import { Guard, GuardSchemaOf } from "./types.js";

type ObjectKey = string | number | symbol;

function objectKeys<K extends ObjectKey>(obj: Record<K, unknown>): K[] {
  return (Object.getOwnPropertyNames(obj) as K[]).concat(
    Object.getOwnPropertySymbols(obj) as K[]
  );
}

export const isAnyArray: Guard<unknown[]> = (value) => Array.isArray(value);

export const isAnyRecord: Guard<Record<ObjectKey, unknown>> = (
  value
): value is Record<ObjectKey, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

export function isArrayOf<T>(guard: Guard<T>): Guard<T[]> {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isArrayOf expects a guard parameter. Got instead: ${guard}`
    );
  }

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
  if (typeof keyGuard !== "function") {
    throw new TypeError(
      `isRecordOf keyGuard expects a guard parameter. Got instead: ${keyGuard}`
    );
  } else if (valueGuard != null && typeof valueGuard !== "function") {
    throw new TypeError(
      `isRecordOf valueGuard expects an optional guard parameter. Got instead: ${valueGuard}`
    );
  }

  return (value): value is Record<K, V> =>
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    objectKeys(value).every(
      (key) => keyGuard(key) && (valueGuard?.(value[key]) ?? true)
    );
}

export function isObjectOf<O extends object>(
  schema: GuardSchemaOf<O>
): O extends unknown[] ? never : Guard<O> {
  const schemaKeys = objectKeys(schema);
  const schemaUnknown = schema as unknown;
  if (schemaKeys.length === 0) {
    throw new Error("isObjectOf received an empty schema");
  } else if (
    schemaUnknown == null ||
    typeof schemaUnknown !== "object" ||
    Array.isArray(schemaUnknown) ||
    schemaKeys.some((key) => typeof (schemaUnknown as O)[key] !== "function")
  ) {
    throw new TypeError(
      `isObjectOf expects a guard schema. Got instead: ${schemaUnknown}`
    );
  }

  return ((value): value is O =>
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    schemaKeys.every(
      (key) => key in value && schema[key]((value as O)[key])
    )) as O extends unknown[] ? never : Guard<O>;
}
