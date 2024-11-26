import { Guard, GuardSchemaOf } from "./types";

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

export function isTupleOf<T extends readonly unknown[]>(
  ...tupleGuards: GuardSchemaOf<T>
): Guard<T> {
  if (tupleGuards.some((guard) => typeof guard !== "function")) {
    throw new TypeError(
      `isTupleOf expects guard parameters. Got instead: ${JSON.stringify(
        tupleGuards
      )}`
    );
  }

  return (value): value is T =>
    Array.isArray(value) &&
    value.length === tupleGuards.length &&
    tupleGuards.every((guard, i) => guard(value[i]));
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
): O extends unknown[] ? never : {} extends O ? never : Guard<O> {
  if (schema == null || typeof schema !== "object") {
    throw new TypeError(
      `isObjectOf expects a guard schema object. Got instead: ${schema}`
    );
  }

  const schemaKeys = objectKeys(schema);
  if (
    Array.isArray(schema) ||
    schemaKeys.some((key) => typeof schema[key] !== "function")
  ) {
    throw new TypeError(
      `isObjectOf expects a guard schema object. Got instead ${JSON.stringify(
        schema
      )}`
    );
  } else if (schemaKeys.length === 0) {
    throw new Error("isObjectOf received an empty schema");
  }

  return ((value): value is O =>
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    schemaKeys.every(
      (key) => key in value && schema[key]((value as O)[key])
    )) as O extends unknown[] ? never : {} extends O ? never : Guard<O>;
}
