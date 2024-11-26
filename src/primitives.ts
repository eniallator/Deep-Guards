import { Guard } from "./types";

export const isUnknown: Guard<unknown> = (_value): _value is unknown => true;

export const isNull: Guard<null> = (value) => value === null;

export const isUndefined: Guard<undefined> = (value) => value === undefined;

export const isNumber: Guard<number> = (value) => typeof value === "number";

export const isInteger: Guard<number> = (value): value is number =>
  Number.isInteger(value);

export const isString: Guard<string> = (value) => typeof value === "string";

export const isSymbol: Guard<symbol> = (value) => typeof value === "symbol";

export const isBoolean: Guard<boolean> = (value) =>
  value === true || value === false;

export const isFunction: Guard<(...args: unknown[]) => unknown> = (
  value
): value is (...args: unknown[]) => unknown => typeof value === "function";
