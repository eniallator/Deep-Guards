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

export const isAnyArray: Guard<unknown[]> = value => Array.isArray(value);

export const isAnyRecord: Guard<Record<PropertyKey, unknown>> = (
  value
): value is Record<PropertyKey, unknown> =>
  value != null && typeof value === "object" && !Array.isArray(value);

export const isArrayOf = <T>(guard: Guard<T>): Guard<T[]> => {
  if (typeof guard !== "function") {
    throw invalidParam("isArrayOf", "a guard parameter", guard);
  }

  return (value): value is T[] => Array.isArray(value) && everyOf(value, guard);
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

export const isTupleOf = <const G extends NonEmptyGuards>(
  ...tupleGuards: G
): Guard<TupleFromGuards<G>> => {
  if (
    tupleGuards.length === 0 ||
    tupleGuards.some(guard => typeof guard !== "function")
  ) {
    throw invalidParam(
      "isTupleOf",
      "one or more guard parameters",
      tupleGuards
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
    throw invalidParam("isRecordOf", "a guard as the keyGuard", keyGuard);
  } else if (valueGuard != null && typeof valueGuard !== "function") {
    throw invalidParam(
      "isRecordOf",
      "an optional guard as the valueGuard",
      valueGuard
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

type ValidSchema<S> = S extends unknown[]
  ? never
  : [keyof S] extends [never]
    ? never
    : unknown;

type ObjectGuard<S extends Record<PropertyKey, Guard<unknown>>> = Guard<
  {
    [K in keyof S as K extends OptionalKeysOf<S> ? never : K]: TypeFromGuard<
      S[K]
    >;
  } & { [K in OptionalKeysOf<S>]?: TypeFromGuard<S[K]> } extends infer O
    ? { [K in keyof O]: O[K] }
    : never
>;

const createObjectGuard =
  (name: string, exactKeys: boolean) =>
  <S extends Record<PropertyKey, Guard<unknown>>>(
    schema: S & ValidSchema<S>
  ): ObjectGuard<S> => {
    const schemaUnknown: unknown = schema;
    if (schemaUnknown == null || typeof schemaUnknown !== "object") {
      throw invalidParam(name, "a guard schema object", schemaUnknown);
    }

    const schemaKeys = objectKeys<keyof S>(schema);
    if (
      Array.isArray(schema) ||
      schemaKeys.some(key => typeof schema[key] !== "function")
    ) {
      throw invalidParam(name, "a guard schema object", schema);
    } else if (schemaKeys.length === 0) {
      throw invalidParam(name, "a non-empty guard schema object", schema);
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
      )) as ObjectGuard<S>;
  };

export const isObjectOf = /* @__PURE__ */ createObjectGuard(
  "isObjectOf",
  false
);

export const isExactObjectOf = /* @__PURE__ */ createObjectGuard(
  "isExactObjectOf",
  true
);
