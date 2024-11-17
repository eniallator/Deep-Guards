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
  it("succeeds for any value", () => {
    expect(isUnknown("unknown")).toBe(true);
  });
});

describe("isNull", () => {
  it("succeeds for null", () => {
    expect(isNull(null)).toBe(true);
  });

  it("fails for any other value", () => {
    expect(isNull(undefined)).toBe(false);
  });
});

describe("isUndefined", () => {
  it("succeeds for undefined", () => {
    expect(isUndefined(undefined)).toBe(true);
  });

  it("fails for any other value", () => {
    expect(isUndefined(null)).toBe(false);
  });
});

describe("isNumber", () => {
  it("succeeds for a number", () => {
    expect(isNumber(1.23)).toBe(true);
  });

  it("fails for any other type", () => {
    expect(isNumber("foo")).toBe(false);
  });
});

describe("isInteger", () => {
  it("succeeds for an integer", () => {
    expect(isInteger(1)).toBe(true);
  });

  it("fails for a non-integer", () => {
    expect(isInteger(1.23)).toBe(false);
  });

  it("fails for any other type", () => {
    expect(isInteger("foo")).toBe(false);
  });
});

describe("isString", () => {
  it("succeeds for a string", () => {
    expect(isString("Foo bar")).toBe(true);
  });

  it("fails for other types", () => {
    expect(isString(true)).toBe(false);
  });
});

describe("isBoolean", () => {
  it("succeeds for a boolean", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
  });

  it("fails for other types", () => {
    expect(isBoolean("foo")).toBe(false);
  });
});
