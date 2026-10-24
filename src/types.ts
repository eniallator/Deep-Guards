export type Guard<T> = (value: unknown) => value is T;

export type TypeFromGuard<G extends Guard<unknown>> =
  G extends Guard<infer T> ? T : never;

export const optionalSymbol: unique symbol = /* @__PURE__ */ Symbol.for(
  "deep-guards.optional"
);

export type OptionalGuard<T> = Guard<T | undefined> & {
  readonly [optionalSymbol]: true;
};
