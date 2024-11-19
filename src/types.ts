export type Guard<T> = (value: unknown) => value is T;

export type GuardSchemaOf<O extends object> = {
  [K in keyof O]: Guard<O[K]>;
};
