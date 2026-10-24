import type { Guard } from "./types.ts";

export class GuardError extends Error {
  name = "GuardError";
}

export const guardOrThrow = <T>(
  value: unknown,
  guard: Guard<T>,
  hint: string = "Guard error"
): T => {
  if (guard(value)) return value;
  else throw new GuardError(hint);
};
