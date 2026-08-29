import { isExact } from "./compound.ts";
import { omit } from "./helpers.ts";
import { isObjectOf } from "./structures.ts";
import type { Guard } from "./types.ts";

export function isDiscriminatedObjectOf<
  const T extends string,
  O extends object,
>(value: T, guard: Guard<O>): Guard<{ type: T } & O>;
export function isDiscriminatedObjectOf<
  const T extends string,
  O extends object,
  const K extends PropertyKey,
>(value: T, guard: Guard<O>, key: K): Guard<{ [S in K]: T } & O>;
export function isDiscriminatedObjectOf<
  const T extends string,
  O extends object,
>(
  value: T,
  guard: Guard<O>,
  key: PropertyKey = "type"
): Guard<Record<PropertyKey, T> & O> {
  const discriminatorGuard = isObjectOf({ [key]: isExact(value) }) as Guard<
    Record<PropertyKey, T>
  >;
  return (value): value is Record<PropertyKey, T> & O =>
    discriminatorGuard(value) && guard(omit(value, key));
}
