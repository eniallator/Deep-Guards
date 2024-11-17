import { Guard } from "./types.js";

export const isUnknown: Guard<unknown> = (_value): _value is unknown => true;

export const isNull: Guard<null> = (value) => value === null;

export const isUndefined: Guard<undefined> = (value) => value === undefined;

export const isNumber: Guard<number> = (value) => typeof value === "number";

export const isInteger: Guard<number> = (value): value is number =>
  Number.isInteger(value);

export const isString: Guard<string> = (value) => typeof value === "string";

export const isSymbol: Guard<Symbol> = (value) => typeof value === "symbol";

export const isBoolean: Guard<boolean> = (value) =>
  value === true || value === false;

export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}
