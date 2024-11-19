export type Guard<T> = (value: unknown) => value is T;

export type GuardSchemaOf<O extends object> = {
  [K in keyof O]: Guard<O[K]>;
};

export type TypeFromGuard<G extends Guard<unknown>> = G extends Guard<infer T>
  ? T
  : never;
