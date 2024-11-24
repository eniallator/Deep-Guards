import { isExact, isIntersectionOf } from "./compound";
import { isObjectOf } from "./structures";
import { Guard } from "./types";

export const isDiscriminatedObjectOf = <T extends string, O extends object>(
  type: T,
  guard: Guard<O>
): Guard<{ type: T } & O> =>
  isIntersectionOf(isObjectOf({ type: isExact(type) }), guard) as Guard<
    { type: T } & O
  >;
