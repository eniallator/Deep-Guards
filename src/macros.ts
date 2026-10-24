import { isExact } from "./compound.ts";
import { invalidParam, omit } from "./helpers.ts";
import { isObjectOf } from "./structures.ts";
import type { Guard } from "./types.ts";

const PROPERTY_KEY_SET = /* @__PURE__ */ new Set([
  "string",
  "number",
  "symbol",
]);

export const isDiscriminatedObjectOf: {
  <const T extends string, O extends object>(
    discriminator: T,
    guard: Guard<O>
  ): Guard<{ type: T } & O>;
  <const T extends string, O extends object, const K extends PropertyKey>(
    discriminator: T,
    guard: Guard<O>,
    key: K
  ): Guard<{ [S in K]: T } & O>;
} = <const T extends string, O extends object>(
  discriminator: T,
  guard: Guard<O>,
  key: PropertyKey = "type"
): Guard<Record<PropertyKey, T> & O> => {
  if (typeof guard !== "function") {
    throw invalidParam("isDiscriminatedObjectOf", "a guard parameter", guard);
  } else if (!PROPERTY_KEY_SET.has(typeof key)) {
    throw invalidParam(
      "isDiscriminatedObjectOf",
      "a property key parameter",
      key
    );
  }

  const discriminatorGuard = isObjectOf({
    [key]: isExact(discriminator),
  }) as Guard<Record<PropertyKey, T>>;
  return (value): value is Record<PropertyKey, T> & O =>
    discriminatorGuard(value) && guard(omit(value, key));
};
