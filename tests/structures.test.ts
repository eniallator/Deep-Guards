import { isNumber, isString, isSymbol } from "../src/primitives";
import {
  isAnyArray,
  isAnyFunction,
  isAnyRecord,
  isArrayOf,
  isObjectOf,
  isRecordOf,
} from "../src/structures";

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

describe("isAnyFunction", () => {
  it("succeeds for a function", () => {
    expect(isAnyFunction(() => {})).toBe(true);
  });

  it("fails for any other value", () => {
    expect(isAnyFunction(1)).toBe(false);
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
});

describe("isObjectOf", () => {
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
  });
});
