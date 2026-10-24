# Deep-Guards

This solves the cases where you have a nested JSON data structure, and are wanting to guard the whole structure in one go, rather than doing shallow guards.

I was also surprised that there's not too many options for guarding things with type narrowing in the case of discriminated unions. This library also solves that!

I have also oriented this library towards making the type tooltips as descriptive as possible.

Example use case:

```ts
const carGuard = isObjectOf({
  type: isExact("car"),
  wheels: isExact(4),
  owner: isString,
  passengers: isArrayOf(
    isObjectOf({
      name: isString,
    })
  ),
});

const bikeGuard = isObjectOf({
  type: isExact("bike"),
  wheels: isExact(2),
  owner: isString,
  storage: isOptional(isArrayOf(isString)),
});

const vehicleGuard = isUnionOf(carGuard, bikeGuard);

const value: unknown = { ... };

if (vehicleGuard(value)) {
  console.log(value.wheels);

  if (value.type === "car") {
    // value is a Car
  } else {
    // value is a Bike
  }
}
```

## Contents

1. [Primitives](#primitives)
2. [Compound](#compound)
   1. [isOptional](#isoptional)
   2. [isNullable](#isnullable)
   3. [isNonNullable](#isnonnullable)
   4. [isFalsey](#isfalsey)
   5. [isNot](#isnot)
   6. [isOneOf](#isoneof)
   7. [isUnionOf](#isunionof)
   8. [isIntersectionOf](#isintersectionof)
   9. [isExact](#isexact)
   10. [isInstance](#isinstance)
3. [Structures](#structures)
   1. [isAnyArray](#isanyarray)
   2. [isAnyRecord](#isanyrecord)
   3. [isArrayOf](#isarrayof)
   4. [isTupleOf](#istupleof)
   5. [isRecordOf](#isrecordof)
   6. [isObjectOf](#isobjectof)
   7. [isExactObjectOf](#isexactobjectof)
4. [Macros](#macros)
   1. [isDiscriminatedObjectOf](#isdiscriminatedobjectof)
5. [guardOrThrow](#guardorthrow)
6. [TypeFromGuard](#typefromguard)
7. [Conventions](#conventions)

## Terminology

- Guard:
  - A function which lets you narrow down an incoming `unknown` value type, into a defined type.
- Simple guard:
  - A variable which is set to a Guard
- Higher order guard:
  - This is a function which takes in a guard function as a parameter, and then will produce a new guard function as a result.
- Incoming value:
  - The value being guarded against.
- Optional guard:
  - A guard produced by [isOptional](#isoptional). Object and tuple guards treat these specially, see [isOptional](#isoptional).
- Exclusion guard:
  - A guard which narrows a known type down, like `Exclude`, rather than narrowing `unknown`. [isNot](#isnot) and [isNonNullable](#isnonnullable) are exclusion guards.

## Primitives

There's all the usual suspects for primitives. They are all simple guards.

The full list of available primitive guards is below:

- isUnknown
- isNull
- isUndefined
- isNumber
- isInteger
- isString
- isSymbol
- isBoolean
- isFunction

## Compound

There's also compound guards, which do more complex checks than the primitives:

### isOptional

Higher order guard. This lets the incoming value to also be equal to `undefined` as well.

It returns an `OptionalGuard<T>`: a `Guard<T | undefined>` which also carries a marker property (`[optionalSymbol]: true`). [isObjectOf](#isobjectof), [isExactObjectOf](#isexactobjectof) and [isTupleOf](#istupleof) look for that marker:

- In an object guard, a key whose guard is an optional guard is allowed to be missing, and the guarded type gets an optional key (`storage?: string[]`).
- In a tuple guard, optional guards at the **end** may be missing, and the guarded type gets optional elements (`[number, string?]`). An optional guard followed by a required one stays required, as a tuple can't have a required element after an optional one.
- Anywhere else (e.g. [isArrayOf](#isarrayof)) it is simply a guard which also accepts `undefined`.

Only `isOptional` carries the marker. Guards which merely accept `undefined`, such as `isNullable(x)` or `isUnionOf(x, isUndefined)`, are still required keys. Wrap them in `isOptional` if you want the key to be omittable.

```ts
const bikeGuard = isObjectOf({
  wheels: isExact(2),
  storage: isOptional(isArrayOf(isString)),
});

bikeGuard({ wheels: 2 }); // true, storage is optional
bikeGuard({ wheels: 2, storage: [1] }); // false, storage is present but wrong

type Bike = TypeFromGuard<typeof bikeGuard>;
// { wheels: 2; storage?: string[] | undefined }
```

### isNullable

Higher order guard. This lets the incoming value to also be equal to `null` or `undefined` as well.

### isNonNullable

Exclusion guard. This will extract `null` and `undefined` from the incoming value type.

### isFalsey

Simple guard. Passes for any falsey value: `undefined`, `null`, `false`, `""`, `0` and `0n`.

### isNot

Higher order exclusion guard. This will do the inverse of the incoming guard, narrowing a value of type `T | N` down to `T` when given a guard for `N`.

### isOneOf

Has signature:

```ts
function isOneOf<
  const T extends (string | number | boolean | symbol | null | undefined)[],
>(...values: T): Guard<(typeof values)[number]>;
```

It's very useful for enumerations, where you only have a few specific values, e.g. a status enum with a guard: `isOneOf("active", "inactive", "away")`. When using the enum, it will then be narrowed down to those specific values, so in the case of the example, a value will be narrowed down to the type: `"active" | "inactive" | "away"`.

### isUnionOf

Higher order guard. This takes in one or more guards as arguments, and then produces a guard which does a union over all the incoming guards. This means that if _any_ one of the guards passes for the incoming value, then this will pass.

### isIntersectionOf

Higher order guard. This takes in one or more guards as arguments, and then produces a guard which does an intersection over all the incoming guards. This means that if _every_ one of the guards passes for the incoming value, then this will pass.

### isExact

Has signature:

```ts
function isExact<const T>(expected: T): Guard<T>;
```

This will pass if the incoming value exactly matches the `expected` parameter. This memoizes checks upfront based on the expected value being passed in. So it's best to create these guards once, and then reuse the returned guard function.

### isInstance

Takes in a class and produces a guard to see if values are instances of that class, by using `instanceof`. This throws a `TypeError` if it's not given a class.

## Structures

Finally there's structure guards, which guard against things like objects/arrays/records.

### isAnyArray

Simple guard. Passes if the incoming value is an array.

### isAnyRecord

Simple guard. Passes if the incoming value is an object/record, but **not** if it's an array.

NOTE: This is any non-null object that isn't an array, so class instances, `Date`, `Map` and `Set` values also pass.

### isArrayOf

Higher order guard. This will pass if the incoming value is an array which contains elements which are of the type of the passed in guard function.

NOTE: This passes for empty arrays\
Holes in sparse arrays are guarded as `undefined`, so `[1, , 3]` only passes if the item guard accepts `undefined`.

### isTupleOf

Higher order guard. This takes in one or more guards, and then checks that the incoming value is an array of the same size, with the guards guarding the items in the same order as they appear.

For example:

```ts
const myTupleGuard = isTupleOf(isNumber, isString, isBoolean);
const value: unknown = [1, "foo", true];

if (myTupleGuard(value)) {
  // value passes
}
```

Trailing [optional guards](#isoptional) let the incoming array be shorter, down to the number of guards up to and including the last required one:

```ts
const myGuard = isTupleOf(
  isNumber,
  isOptional(isString),
  isOptional(isBoolean)
);

myGuard([1]); // true
myGuard([1, "foo"]); // true
myGuard([1, "foo", true]); // true
myGuard([]); // false, the number is required

type MyTuple = TypeFromGuard<typeof myGuard>;
// [number, (string | undefined)?, (boolean | undefined)?]
```

### isRecordOf

Higher order guard. It has two guard parameters, where the first is the key guard, and then the second is a value guard which is optional. If you don't pass in a value guard, the returned guard function has `unknown`s as the value type.

NOTE: This passes for empty records\
Like [isAnyRecord](#isanyrecord), any non-null object that isn't an array can pass, including class instances.

### isObjectOf

This is a function which takes in a structured object, containing keys of type `string | number | symbol`, and then values which are guard functions.

As seen in the example at the start of this readme, you can do all sorts of complex nesting, as this produces a guard in the end.

Keys whose guard is an [optional guard](#isoptional) are allowed to be missing, and are optional keys in the guarded type.

NOTE: Passing an empty schema (or an array) is a compile error, and throws a `TypeError` at runtime.\
It will accept an object which contains keys which are not specified, use [isExactObjectOf](#isexactobjectof) to reject those.\
A key counts as present if it's in the incoming value or its prototype chain (`key in value`), so getters defined on a class work.

### isExactObjectOf

The same as [isObjectOf](#isobjectof), except that the incoming value's own keys (strings and symbols) must all be in the schema. It doesn't let any "leaky" objects through, which have extra keys.

## Macros

These are common use cases for guarding setups, where they are made entirely out of the above guard suite.

### isDiscriminatedObjectOf

This takes in a string literal for the discriminated value, and an `isObjectOf` guard, and then an optional key specifying which key is for the discriminated union. This then combines the object with the discriminator, where the returned guard has the signature: `Guard<{ [key]: T } & O>`.

This is good for use cases where you don't have a discriminator on an individual type, but then do have it on the union type. For example:

```ts
interface Car {
  wheels: 4;
  owner: string;
  passengers: {
    name: string;
  }[];
}

interface Bike {
  wheels: 2;
  owner: string;
  storage?: string[];
}

type Vehicle = ({ type: "car" } & Car) | ({ type: "bike" } & Bike);

// Can then be represented like so in guards:

const carGuard = isObjectOf({
  wheels: isExact(4),
  owner: isString,
  passengers: isArrayOf(
    isObjectOf({
      name: isString,
    })
  ),
});

const bikeGuard = isObjectOf({
  wheels: isExact(2),
  owner: isString,
  storage: isOptional(isArrayOf(isString)),
});

const vehicleGuard = isUnionOf(
  isDiscriminatedObjectOf("car", carGuard),
  isDiscriminatedObjectOf("bike", bikeGuard)
);
```

## guardOrThrow

This package also includes a `guardOrThrow` method which when given an incoming value, a guard, and an optional hint message, will return a narrowed version of the value, or throw a `GuardError` containing that hint message.

You can then do things like:

```ts
const cars = guardOrThrow(
  JSON.parse(readFileSync("cars.json").toString()),
  isArrayOf(isCar),
  "Invalid car format"
);
```

## TypeFromGuard

This is a helper type, which will extract the type from a guard function to then let you use the type for other purposes.

An example use case for this is:

```ts
const carGuard = isObjectOf({
  type: isExact("car"),
  wheels: isExact(4),
  owner: isString,
  passengers: isArrayOf(
    isObjectOf({
      name: isString,
    })
  ),
});

type Car = TypeFromGuard<typeof carGuard>;
```

## Conventions

- Higher order guards check their arguments when they are created, and throw a `TypeError` of the form `<function> expects <what>. Got instead: <value>` if they are misused. They never silently return a guard that can't work.
- Guards which take guards (`isArrayOf`, `isUnionOf`, `isObjectOf`, ...) take the guards first. Functions which _apply_ a guard to a value, like `guardOrThrow`, take the value first.
- `isUnionOf`, `isIntersectionOf` and `isTupleOf` need at least one guard, and `isObjectOf` / `isExactObjectOf` need a non-empty schema. This is enforced by the types as well as at runtime.
