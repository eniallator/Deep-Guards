import { objectKeys } from "./helpers.ts";
import {
  optionalSymbol,
  type Guard,
  type OptionalGuard,
  type TypeFromGuard,
} from "./types.ts";

export const isAnyArray: Guard<unknown[]> = value => Array.isArray(value);

export const isAnyRecord: Guard<Record<PropertyKey, unknown>> = (
  value
): value is Record<PropertyKey, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

export const isArrayOf = <T>(guard: Guard<T>): Guard<T[]> => {
  if (typeof guard !== "function") {
    throw new TypeError(
      `isArrayOf expects a guard parameter. Got instead: ${JSON.stringify(
        guard
      )}`
    );
  }

  return (value): value is T[] =>
    Array.isArray(value) && value.every(item => guard(item));
};

type TupleFromGuards<G extends readonly Guard<unknown>[]> =
  G extends readonly []
    ? []
    : G extends readonly [
          ...infer First extends Guard<unknown>[],
          infer Last extends Guard<unknown>,
        ]
      ? Last extends OptionalGuard<unknown>
        ? [...TupleFromGuards<First>, TypeFromGuard<Last>?]
        : [...TupleFromGuards<First>, TypeFromGuard<Last>]
      : TypeFromGuard<G[number]>[];

export const isTupleOf = <const G extends readonly Guard<unknown>[]>(
  ...tupleGuards: G
): Guard<TupleFromGuards<G>> => {
  if (tupleGuards.some(guard => typeof guard !== "function")) {
    throw new TypeError(
      `isTupleOf expects guard parameters. Got instead: ${JSON.stringify(
        tupleGuards
      )}`
    );
  }

  const minLength =
    tupleGuards.findLastIndex(guard => !(optionalSymbol in guard)) + 1;

  return (value): value is TupleFromGuards<G> =>
    Array.isArray(value) &&
    value.length >= minLength &&
    value.length <= tupleGuards.length &&
    tupleGuards.every((guard, i) => guard(value[i]));
};

export const isRecordOf: {
  <K extends PropertyKey>(keyGuard: Guard<K>): Guard<Record<K, unknown>>;
  <K extends PropertyKey, V>(
    keyGuard: Guard<K>,
    valueGuard: Guard<V>
  ): Guard<Record<K, V>>;
} = <K extends PropertyKey, V>(
  keyGuard: Guard<K>,
  valueGuard?: Guard<V>
): Guard<Record<K, V>> => {
  if (typeof keyGuard !== "function") {
    throw new TypeError(
      `isRecordOf keyGuard expects a guard parameter. Got instead: ${JSON.stringify(
        keyGuard
      )}`
    );
  } else if (valueGuard != null && typeof valueGuard !== "function") {
    throw new TypeError(
      `isRecordOf valueGuard expects an optional guard parameter. Got instead: ${JSON.stringify(
        valueGuard
      )}`
    );
  }

  return (value): value is Record<K, V> =>
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    objectKeys(value).every(
      key => keyGuard(key) && (valueGuard?.(value[key]) ?? true)
    );
};

type OptionalKeysOf<S extends Record<PropertyKey, Guard<unknown>>> = {
  [K in keyof S]: S[K] extends OptionalGuard<unknown> ? K : never;
}[keyof S];

type IsObjectOfGuard<S extends Record<PropertyKey, Guard<unknown>>> =
  S extends unknown[]
    ? never
    : {} extends S
      ? never
      : Guard<
          {
            [
              K in keyof S as K extends OptionalKeysOf<S> ? never : K
            ]: TypeFromGuard<S[K]>;
          } & { [K in OptionalKeysOf<S>]?: TypeFromGuard<S[K]> } extends infer O
            ? { [K in keyof O]: O[K] }
            : never
        >;

export const isObjectOf = <S extends Record<PropertyKey, Guard<unknown>>>(
  schema: S,
  exactKeys: boolean = false
): IsObjectOfGuard<S> => {
  const schemaUnknown: unknown = schema;
  if (schemaUnknown == null || typeof schemaUnknown !== "object") {
    throw new TypeError(
      `isObjectOf expects a guard schema object. Got instead: ${JSON.stringify(
        schemaUnknown
      )}`
    );
  }

  const schemaKeys = objectKeys<keyof S>(schema);
  if (
    Array.isArray(schema) ||
    schemaKeys.some(key => typeof schema[key] !== "function")
  ) {
    throw new TypeError(
      `isObjectOf expects a guard schema object. Got instead ${JSON.stringify(
        schema
      )}`
    );
  } else if (schemaKeys.length === 0) {
    throw new Error("isObjectOf received an empty schema");
  }

  const guards: Record<keyof S, Guard<unknown>> = schema;
  const schemaKeySet = new Set<PropertyKey>(schemaKeys);

  return (value =>
    value != null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (!exactKeys || objectKeys(value).every(key => schemaKeySet.has(key))) &&
    schemaKeys.every(
      key =>
        (key in value || optionalSymbol in guards[key]) &&
        guards[key]((value as Record<keyof S, unknown>)[key])
    )) as IsObjectOfGuard<S>;
};
