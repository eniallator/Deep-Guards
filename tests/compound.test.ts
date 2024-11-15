import {
  isExact,
  isNot,
  isNullable,
  isOneOf,
  isOptional,
  isUnionOf,
} from "../src/compound";
import { isNumber, isString } from "../src/primitives";

describe("isOptional", () => {
  const guard = isOptional(isString);

  it("should succeed for the expected type or undefined", () => {
    expect(guard("foo")).toBe(true);
    expect(guard(undefined)).toBe(true);
  });

  it("should fail for any other value", () => {
    expect(guard(null)).toBe(false);
  });
});

describe("isNullable", () => {
  const guard = isNullable(isString);

  it("should succeed for the expected type, null, or undefined", () => {
    expect(guard("foo")).toBe(true);
    expect(guard(null)).toBe(true);
    expect(guard(undefined)).toBe(true);
  });

  it("should fail any other value", () => {
    expect(guard(1)).toBe(false);
  });
});

describe("isNot", () => {
  const guard = isNot(isString);

  it("should succeed for any other value", () => {
    expect(guard(1)).toBe(true);
  });

  it("should fail for the isNot type", () => {
    expect(guard("foo")).toBe(false);
  });
});

describe("isOneOf", () => {
  const guard = isOneOf(1, "foo", true);

  it("should succeed for all of the values", () => {
    expect(guard(1)).toBe(true);
    expect(guard("foo")).toBe(true);
    expect(guard(true)).toBe(true);
  });

  expect(guard(2)).toBe(false);
  it("should fail any other value", () => {
    expect(guard("bar")).toBe(false);
    expect(guard(false)).toBe(false);
    expect(guard(null)).toBe(false);
  });
});

describe("isUnionOf", () => {
  const guard = isUnionOf(isString, isNumber);
  it("should succeed for the union types", () => {
    expect(guard(1)).toBe(true);
    expect(guard("foo")).toBe(true);
  });

  it("should fail for any other type", () => {
    expect(guard(true)).toBe(false);
    expect(guard(null)).toBe(false);
  });
});

describe("isExact", () => {
  describe("deep", () => {
    const guard = isExact(
      { foo: "bar", hello: ["world", { key: "test" }] },
      true
    );

    it("should succeed for the exact value", () => {
      expect(guard({ foo: "bar", hello: ["world", { key: "test" }] })).toBe(
        true
      );
    });

    it("should fail for any other value", () => {
      expect(guard({ foo: "baz", hello: ["world", { key: "test" }] })).toBe(
        false
      );
      expect(guard({ foo: "bar", hello: ["world", { key: "tester" }] })).toBe(
        false
      );
      expect(guard(1)).toBe(false);
    });
  });

  describe("shallow", () => {
    const guard = isExact("foo", false);

    it("should succeed for the exact value", () => {
      expect(guard("foo")).toBe(true);
    });

    it("should fail for deep equality", () => {
      const guard = isExact(["foo", "bar", "baz", 1, 2, 3], false);
      expect(guard(["foo", "bar", "baz", 1, 2, 3])).toBe(false);
    });

    it("should fail for any other value", () => {
      expect(guard("bar")).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });
});
