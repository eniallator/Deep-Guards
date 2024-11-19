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
   4. [isNot](#isnot)
   5. [isOneOf](#isoneof)
   6. [isUnionOf](#isunionof)
   7. [isExact](#isexact)
3. [Structures](#structures)
   1. [isAnyArray](#isanyarray)
   2. [isAnyRecord](#isanyrecord)
   3. [isArrayOf](#isarrayof)
   4. [isRecordOf](#isrecordof)
   5. [isObjectOf](#isobjectof)
4. [guardOrThrow](#guardorthrow)

## Terminology

- Guard:
  - A function which lets you narrow down an incoming `unknown` value type, into a defined type.
- Simple guard:
  - A variable which is set to a Guard
- Higher order guard:
  - This is a function which takes in a guard function as a parameter, and then will produce a new guard function as a result.
- Incoming value:
  - The value being guarded against.

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

### isNullable

Higher order guard. This lets the incoming value to also be equal to `null` or `undefined` as well.

### isNonNullable

Simple guard. This will extract `null` and `undefined` from the incoming value type.

### isNot

Higher order guard. This will do the inverse of the incoming guard.

### isOneOf

Has signature:

```ts
function isOneOf<
  const T extends (string | number | boolean | symbol | null | undefined)[]
>(...values: T): Guard<(typeof values)[number]>;
```

It's very useful for enumerations, where you only have a few specific values, e.g. a status enum with a guard: `isOneOf("active", "inactive", "away")`. When using the enum, it will then be narrowed down to those specific values, so in the case of the example, a value will be narrowed down to the type: `"active" | "inactive" | "away"`.

### isUnionOf

Higher order guard. This takes in any amount of guards as arguments, and then produces a guard which does a union over all the incoming guards.

### isExact

Has signature:

```ts
function isExact<const T>(expected: T, deep: boolean = true): Guard<T>;
```

This will pass if the incoming value exactly matches the `expected` parameter, optionally computing a deep equality.

## Structures

Finally there's structure guards, which guard against things like objects/arrays/records.

### isAnyArray

Simple guard. Passes if the incoming value is an array.

### isAnyRecord

Simple guard. Passes if the incoming value is an object/record, but **not** if it's an array.

### isArrayOf

Higher order guard. This will pass if the incoming value is an array which contains elements which are of the type of the passed in guard function.

NOTE: This passes for empty arrays

### isRecordOf

Higher order guard. It has two guard parameters, where the first is the key guard, and then the second is a value guard which is optional. If you don't pass in a value guard, the returned guard function has `unknown`s as the value type.

NOTE: This passes for empty records

### isObjectOf

This is a function which takes in a structured object, containing keys of type `string | number | symbol`, and then values which are guard functions.

As seen in the example at the start of this readme, you can do all sorts of complex nesting, as this produces a guard in the end.

NOTE: This throws an error if you give it an empty object.\
It will also accept an object which contains keys which are not specified.

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
