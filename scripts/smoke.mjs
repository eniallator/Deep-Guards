// Exercises the built package using only plain JS and node:assert, so it can run on every Node version in
// `engines` (the dev tooling, e.g. vitest, needs a newer Node than consumers do).
import assert from "node:assert/strict";

import {
  GuardError,
  guardOrThrow,
  isArrayOf,
  isDiscriminatedObjectOf,
  isExact,
  isExactObjectOf,
  isInstance,
  isIntersectionOf,
  isNumber,
  isObjectOf,
  isOneOf,
  isOptional,
  isRecordOf,
  isString,
  isTupleOf,
  isUnionOf,
} from "../dist/index.js";

assert.equal(isArrayOf(isString)(["a", "b"]), true);
assert.equal(isArrayOf(isString)(["a", 1]), false);
assert.equal(isArrayOf(isString)(["a", , "b"]), false, "holes are undefined");
assert.equal(isArrayOf(isOptional(isString))(["a", , "b"]), true);

assert.equal(isTupleOf(isNumber, isOptional(isString))([1]), true);
assert.equal(isTupleOf(isNumber, isOptional(isString))([]), false);

const objectGuard = isObjectOf({ a: isString, b: isOptional(isNumber) });
assert.equal(objectGuard({ a: "x" }), true);
assert.equal(objectGuard({ a: "x", extra: 1 }), true);
assert.equal(objectGuard({ a: "x", b: "y" }), false);
assert.equal(isExactObjectOf({ a: isString })({ a: "x", extra: 1 }), false);

assert.equal(isRecordOf(isString, isNumber)({ a: 1 }), true);
assert.equal(isUnionOf(isString, isNumber)(1), true);
assert.equal(isIntersectionOf(isOneOf("a", "b"), isExact("a"))("a"), true);
assert.equal(isInstance(Date)(new Date()), true);

assert.equal(isExact(new Map([["a", 1]]))(new Map([["a", 1]])), true);
assert.equal(isExact(new Map([["a", 1]]))(new Map([["a", 2]])), false);
assert.equal(isExact(new Set([1, 2]))(new Set([2, 1])), true);
assert.equal(isExact(new Set([1, 2]))(new Set([1, 3])), false);
assert.equal(isExact(new Uint8Array([1, 2]))(new Uint8Array([1, 2])), true);
assert.equal(isExact({ a: [1, { b: 2 }] })({ a: [1, { b: 2 }] }), true);
assert.equal(isExact(Number.NaN)(Number.NaN), true);

const vehicleGuard = isDiscriminatedObjectOf(
  "car",
  isObjectOf({ wheels: isNumber })
);
assert.equal(vehicleGuard({ type: "car", wheels: 4 }), true);
assert.equal(vehicleGuard({ type: "bike", wheels: 2 }), false);

assert.equal(guardOrThrow("a", isString), "a");
assert.throws(() => guardOrThrow(1, isString, "nope"), GuardError);
assert.throws(() => isArrayOf("not a guard"), TypeError);

console.log(`deep-guards smoke test passed on Node ${process.version}`);
