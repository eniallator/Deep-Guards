import { describe, expect, expectTypeOf, it } from "vitest";

import { isOptional } from "./compound.ts";
import { isBoolean, isNumber, isString, isSymbol } from "./primitives.ts";
import {
  isAnyArray,
  isAnyRecord,
  isArrayOf,
  isExactObjectOf,
  isObjectOf,
  isRecordOf,
  isTupleOf,
} from "./structures.ts";

describe("isAnyArray", () => {
  it("succeeds for an array", () => {
    expect(isAnyArray([])).toBe(true);
    expect(isAnyArray(["foo", 1, true, null])).toBe(true);
  });

  it("fails for any other value", () => {
    expect(isAnyArray({})).toBe(false);
    expect(isAnyArray(1)).toBe(false);
  });
});

describe("isAnyRecord", () => {
  it("succeeds for a record", () => {
    expect(isAnyRecord({})).toBe(true);
    expect(isAnyRecord({ foo: "bar", baz: 1 })).toBe(true);
  });

  it("fails for any other value", () => {
    expect(isAnyRecord([])).toBe(false);
    expect(isAnyRecord(1)).toBe(false);
  });
});

describe("isArrayOf", () => {
  const guard = isArrayOf(isString);

  it("succeeds for an array of the value", () => {
    expect(guard([])).toBe(true);
    expect(guard(["foo", "bar", "baz"])).toBe(true);
  });

  it("fails for any other value", () => {
    expect(guard([1, 2, 3])).toBe(false);
    expect(guard(["foo", "bar", null])).toBe(false);
    expect(guard(1)).toBe(false);
  });

  it("guards holes in sparse arrays as undefined", () => {
    // eslint-disable-next-line no-sparse-arrays
    const sparse = ["foo", , "baz"];
    expect(guard(sparse)).toBe(false);
    expect(isArrayOf(isOptional(isString))(sparse)).toBe(true);
  });

  it("throws for a non-function guard parameter", () => {
    // @ts-expect-error testing invalid input
    expect(() => isArrayOf("not a function")).toThrow(TypeError);
  });
});

describe("isTupleOf", () => {
  const guard = isTupleOf(isNumber, isString, isBoolean);

  it("succeeds for an array of the value", () => {
    expect(guard([1, "foo", true])).toBe(true);
  });

  it("fails for any other value", () => {
    expect(guard([1, "foo", true, null])).toBe(false);
    expect(guard([1, "foo"])).toBe(false);
    expect(guard(1)).toBe(false);
  });

  describe("optional trailing elements", () => {
    const optionalGuard = isTupleOf(
      isNumber,
      isOptional(isString),
      isOptional(isBoolean)
    );

    it("succeeds when trailing optional elements are missing or undefined", () => {
      expect(optionalGuard([1])).toBe(true);
      expect(optionalGuard([1, "foo"])).toBe(true);
      expect(optionalGuard([1, "foo", true])).toBe(true);
      expect(optionalGuard([1, undefined, true])).toBe(true);
    });

    it("fails for missing required elements, wrong types or extra elements", () => {
      expect(optionalGuard([])).toBe(false);
      expect(optionalGuard([1, 2])).toBe(false);
      expect(optionalGuard([1, "foo", true, null])).toBe(false);
    });

    it("keeps optional guards before a required guard required", () => {
      const midGuard = isTupleOf(isOptional(isNumber), isString);
      expect(midGuard(["foo"])).toBe(false);
      expect(midGuard([undefined, "foo"])).toBe(true);
    });

    it("makes trailing elements optional in the guarded type", () => {
      const value: unknown = [1];
      if (optionalGuard(value)) {
        expectTypeOf(value).toEqualTypeOf<[number, string?, boolean?]>();
      }
    });
  });

  it("throws when some guard parameters are not functions", () => {
    // @ts-expect-error testing invalid input
    expect(() => isTupleOf(isNumber, "not a function")).toThrow(TypeError);
  });

  it("throws when given no guard parameters", () => {
    // @ts-expect-error testing invalid input
    expect(() => isTupleOf()).toThrow(TypeError);
  });
});

describe("isObjectOf", () => {
  describe("leaky", () => {
    const barSymbol = Symbol("bar");
    const guard = isObjectOf({
      foo: isString,
      [barSymbol]: isNumber,
      baz: isObjectOf({
        qux: isSymbol,
      }),
    });

    it("succeeds for an object of the value", () => {
      expect(
        guard({
          foo: "hello",
          [barSymbol]: 1,
          baz: { qux: Symbol("world!") },
          quux: "this should not be checked",
        })
      ).toBe(true);
    });

    it("fails for any other value", () => {
      expect(
        guard({
          foo: "hello",
          [barSymbol]: "FAIL",
          baz: { qux: Symbol("world!") },
        })
      ).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });

  describe("exact keys", () => {
    const barSymbol = Symbol("bar");
    const guard = isExactObjectOf({
      foo: isString,
      [barSymbol]: isNumber,
      baz: isObjectOf({
        qux: isSymbol,
      }),
    });

    it("succeeds for an object of the value", () => {
      expect(
        guard({
          foo: "hello",
          [barSymbol]: 1,
          baz: { qux: Symbol("world!") },
        })
      ).toBe(true);
    });

    it("fails for any other value", () => {
      expect(
        guard({
          foo: "hello",
          [barSymbol]: 1,
          baz: { qux: Symbol("world!") },
          quux: "this should be checked",
        })
      ).toBe(false);
      expect(
        guard({
          foo: "hello",
          [barSymbol]: "FAIL",
          baz: { qux: Symbol("world!") },
        })
      ).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });

  describe("optional keys", () => {
    const barSymbol = Symbol("bar");
    const schema = {
      foo: isString,
      bar: isOptional(isNumber),
      [barSymbol]: isOptional(isString),
    };
    const leaky = isObjectOf(schema);
    const exact = isExactObjectOf(schema);

    it("succeeds when an optional key is missing or undefined", () => {
      expect(leaky({ foo: "hello" })).toBe(true);
      expect(leaky({ foo: "hello", bar: undefined })).toBe(true);
      expect(leaky({ foo: "hello", bar: 1, [barSymbol]: "baz" })).toBe(true);
      expect(exact({ foo: "hello" })).toBe(true);
      expect(exact({ foo: "hello", bar: 1, [barSymbol]: "baz" })).toBe(true);
    });

    it("fails when an optional key is present with the wrong type", () => {
      expect(leaky({ foo: "hello", bar: "FAIL" })).toBe(false);
      expect(exact({ foo: "hello", [barSymbol]: 1 })).toBe(false);
    });

    it("still requires the non-optional keys", () => {
      expect(leaky({ bar: 1 })).toBe(false);
      expect(exact({ bar: 1 })).toBe(false);
    });

    it("rejects leaky keys when exact, even if optional keys are missing", () => {
      expect(leaky({ foo: "hello", quux: true })).toBe(true);
      expect(exact({ foo: "hello", quux: true })).toBe(false);
      expect(exact({ foo: "hello", bar: 1, quux: true })).toBe(false);
    });

    it("makes the key optional in the guarded type", () => {
      const value: unknown = { foo: "hello" };
      if (leaky(value)) {
        expectTypeOf(value).toEqualTypeOf<{
          foo: string;
          bar?: number;
          [barSymbol]?: string;
        }>();
      }
    });
  });

  it("throws for a non-object schema", () => {
    // @ts-expect-error testing invalid input
    expect(() => isObjectOf("not an object")).toThrow(TypeError);
  });

  it("throws for an array schema", () => {
    // @ts-expect-error testing invalid input
    expect(() => isObjectOf([isString])).toThrow(TypeError);
  });

  it("throws for a schema with a non-function value", () => {
    // @ts-expect-error testing invalid input
    expect(() => isObjectOf({ foo: "not a function" })).toThrow(TypeError);
  });

  it("throws for an empty schema", () => {
    // @ts-expect-error testing invalid input
    expect(() => isObjectOf({})).toThrow(TypeError);
  });

  it("names the failing guard in its errors", () => {
    // @ts-expect-error testing invalid input
    expect(() => isObjectOf({})).toThrow("isObjectOf");
    // @ts-expect-error testing invalid input
    expect(() => isExactObjectOf({})).toThrow("isExactObjectOf");
  });
});

describe("isRecordOf", () => {
  describe("with valueGuard", () => {
    const guard = isRecordOf(isString, isNumber);

    it("succeeds for a record of the key/value types", () => {
      expect(guard({})).toBe(true);
      expect(guard({ foo: 1, bar: 2 })).toBe(true);
    });

    it("fails for any other value", () => {
      expect(guard({ foo: "bar", baz: 1 })).toBe(false);
      expect(guard(1)).toBe(false);
    });

    it("throws for a non-function valueGuard parameter", () => {
      // @ts-expect-error testing invalid input
      expect(() => isRecordOf(isString, "not a function")).toThrow(TypeError);
    });
  });

  describe("without valueGuard", () => {
    const guard = isRecordOf(isString);

    it("succeeds for a record with the key type", () => {
      expect(guard({})).toBe(true);
      expect(guard({ foo: 1, bar: "baz" })).toBe(true);
    });

    it("fails for any other value", () => {
      expect(guard({ 1: "foo", [Symbol("bar")]: 1 })).toBe(false);
      expect(guard(1)).toBe(false);
    });

    it("throws for a non-function keyGuard parameter", () => {
      // @ts-expect-error testing invalid input
      expect(() => isRecordOf("not a function")).toThrow(TypeError);
    });
  });
});
