import {
  isExact,
  isIntersectionOf,
  isNonNullable,
  isNot,
  isNullable,
  isNumber,
  isOneOf,
  isOptional,
  isString,
  isUnionOf,
} from "../src";

describe("isOptional", () => {
  const guard = isOptional(isString);

  it("succeeds for the expected type or undefined", () => {
    expect(guard("foo")).toBe(true);
    expect(guard(undefined)).toBe(true);
  });

  it("fails for any other value", () => {
    expect(guard(null)).toBe(false);
  });
});

describe("isNullable", () => {
  const guard = isNullable(isString);

  it("succeeds for the expected type, null, or undefined", () => {
    expect(guard("foo")).toBe(true);
    expect(guard(null)).toBe(true);
    expect(guard(undefined)).toBe(true);
  });

  it("fails any other value", () => {
    expect(guard(1)).toBe(false);
  });
});

describe("isNonNullable", () => {
  it("succeeds for the expected type, null, or undefined", () => {
    expect(isNonNullable("foo")).toBe(true);
    expect(isNonNullable(1)).toBe(true);
  });

  it("fails any other value", () => {
    expect(isNonNullable(null)).toBe(false);
    expect(isNonNullable(undefined)).toBe(false);
  });
});

describe("isNot", () => {
  const guard = isNot(isString);

  it("succeeds for any other value", () => {
    expect(guard(1)).toBe(true);
  });

  it("fails for the isNot type", () => {
    expect(guard("foo")).toBe(false);
  });
});

describe("isOneOf", () => {
  const guard = isOneOf(1, "foo", true);

  it("succeeds for all of the values", () => {
    expect(guard(1)).toBe(true);
    expect(guard("foo")).toBe(true);
    expect(guard(true)).toBe(true);
  });

  expect(guard(2)).toBe(false);
  it("fails any other value", () => {
    expect(guard(null)).toBe(false);
    expect(guard("bar")).toBe(false);
    expect(guard(false)).toBe(false);
  });
});

describe("isUnionOf", () => {
  const guard = isUnionOf(isString, isNumber);
  it("succeeds for the union types", () => {
    expect(guard(1)).toBe(true);
    expect(guard("foo")).toBe(true);
  });

  it("fails for any other type", () => {
    expect(guard(true)).toBe(false);
    expect(guard(null)).toBe(false);
  });
});

describe("isIntersectionOf", () => {
  const guard = isIntersectionOf(
    isOneOf("foo", "bar", "baz"),
    isExact("foo", false)
  );

  it("succeeds for the intersection", () => {
    expect(guard("foo")).toBe(true);
  });

  it("fails for any other type", () => {
    expect(guard("bar")).toBe(false);
    expect(guard(1)).toBe(false);
  });
});

describe("isExact", () => {
  describe("deep", () => {
    const guard = isExact(
      { foo: "bar", hello: ["world", { key: "test" }] },
      true
    );

    it("succeeds for the exact value", () => {
      expect(guard({ foo: "bar", hello: ["world", { key: "test" }] })).toBe(
        true
      );
    });

    it("fails for any other value", () => {
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

    it("succeeds for the exact value", () => {
      expect(guard("foo")).toBe(true);
    });

    it("fails for deep equality", () => {
      const guard = isExact(["foo", "bar", "baz", 1, 2, 3], false);
      expect(guard(["foo", "bar", "baz", 1, 2, 3])).toBe(false);
    });

    it("fails for any other value", () => {
      expect(guard("bar")).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });
});
