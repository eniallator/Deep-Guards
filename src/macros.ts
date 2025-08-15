import { isExact } from "./compound.js";
import { omit } from "./helpers.js";
import { isObjectOf } from "./structures.js";

import type { ObjectKey } from "./helpers.js";
import type { Guard } from "./types.js";

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
): Guard<Record<ObjectKey, T> & O> {
  const discriminatorGuard = isObjectOf({ [key]: isExact(value) }) as Guard<
    Record<ObjectKey, T>
  >;
  return (value): value is Record<ObjectKey, T> & O =>
    discriminatorGuard(value) && guard(omit(value, key));
}
