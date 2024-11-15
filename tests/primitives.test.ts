import {
  isBoolean,
  isInteger,
  isNull,
  isNumber,
  isString,
  isUndefined,
  isUnknown,
} from "../src/primitives";

describe("isUnknown", () => {
  it("should succeed for any value", () => {
    expect(isUnknown("unknown")).toBe(true);
  });
});

describe("isNull", () => {
  it("should succeed for null", () => {
    expect(isNull(null)).toBe(true);
  });

  it("should fail for any other value", () => {
    expect(isNull(undefined)).toBe(false);
  });
});

describe("isUndefined", () => {
  it("should succeed for undefined", () => {
    expect(isUndefined(undefined)).toBe(true);
  });

  it("should fail for any other value", () => {
    expect(isUndefined(null)).toBe(false);
  });
});

describe("isNumber", () => {
  it("should succeed for a number", () => {
    expect(isNumber(1.23)).toBe(true);
  });

  it("should fail for any other type", () => {
    expect(isNumber("foo")).toBe(false);
  });
});

describe("isInteger", () => {
  it("should succeed for an integer", () => {
    expect(isInteger(1)).toBe(true);
  });

  it("should fail for a non-integer", () => {
    expect(isInteger(1.23)).toBe(false);
  });

  it("should fail for any other type", () => {
    expect(isInteger("foo")).toBe(false);
  });
});

describe("isString", () => {
  it("should succeed for a string", () => {
    expect(isString("Foo bar")).toBe(true);
  });

  it("should fail for other types", () => {
    expect(isString(true)).toBe(false);
  });
});

describe("isBoolean", () => {
  it("should succeed for a boolean", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
  });

  it("should fail for other types", () => {
    expect(isBoolean("foo")).toBe(false);
  });
});
