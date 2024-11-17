export type ObjectKey = string | number | symbol;

export type Guard<T> = (value: unknown) => value is T;

export type OptionalGuard<T> = Guard<T | undefined> & {
  type: "Optional";
};

export type Schema = {
  [S in ObjectKey]: Guard<unknown> | OptionalGuard<unknown>;
};

export type OptionalGuardKeys<S extends Schema> = {
  [K in keyof S]: S[K] extends OptionalGuard<unknown> ? K : never;
}[keyof S];
