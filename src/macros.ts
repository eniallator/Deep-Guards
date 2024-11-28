import { isExact } from "./compound.js";
import { ObjectKey, omit } from "./helpers.js";
import { isObjectOf } from "./structures.js";
import { Guard } from "./types.js";

export function isDiscriminatedObjectOf<
  const T extends string,
  O extends object
>(value: T, guard: Guard<O>): Guard<{ type: T } & O>;
export function isDiscriminatedObjectOf<
  const T extends string,
  O extends object,
  const K extends ObjectKey
>(value: T, guard: Guard<O>, key: K): Guard<{ [S in K]: T } & O>;
export function isDiscriminatedObjectOf<
  const T extends string,
  O extends object
>(
  value: T,
  guard: Guard<O>,
  key: ObjectKey = "type"
): Guard<{ [S in typeof key]: T } & O> {
  const discriminatorGuard = isObjectOf({ [key]: isExact(value) }) as Guard<{
    [S in typeof key]: T;
  }>;
  return (value): value is { [S in typeof key]: T } & O =>
    discriminatorGuard(value) && guard(omit(value, key));
}
