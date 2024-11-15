import { Guard } from "./types.js";

export class GuardError extends Error {
  name = "GuardError";
}

export function guardOrThrow<T>(
  value: unknown,
  guard: Guard<T>,
  hint?: string
): T {
  if (guard(value)) {
    return value;
  } else {
    throw new GuardError(hint ?? "Guard error");
  }
}
