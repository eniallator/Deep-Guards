export type Guard<T> = (value: unknown) => value is T;

export type TypeFromGuard<G extends Guard<unknown>> = G extends Guard<infer T>
  ? T
  : never;
