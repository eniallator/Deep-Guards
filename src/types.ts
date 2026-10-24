export type Guard<T> = (value: unknown) => value is T;

export type TypeFromGuard<G extends Guard<unknown>> =
  G extends Guard<infer T> ? T : never;

export const optionalSymbol: unique symbol = Symbol.for("deep-guards.optional");

export type OptionalGuard<T> = Guard<T | undefined> & {
  readonly [optionalSymbol]: true;
};

export const asOptionalGuard = <T>(guard: Guard<T>): OptionalGuard<T> =>
  Object.assign(guard, { [optionalSymbol]: true as const });
