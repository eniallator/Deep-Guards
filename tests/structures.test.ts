import {
  isAnyFunction,
  isAnyRecord,
  isArrayOf,
  isRecordOf,
  isObjectOf,
} from "../src/structures";

describe("isAnyFunction", () => {
  it("should succeed for a function", () => {
    expect(isAnyFunction(() => {})).toBe(true);
  });

  it("should fail for any other value", () => {
    expect(isAnyFunction(null)).toBe(false);
  });
});

describe("isAnyRecord", () => {
  it("should succeed for a record", () => {
    expect(isAnyRecord({})).toBe(true);
    expect(isAnyRecord({ foo: "bar", baz: 1 })).toBe(true);
  });

  it("should fail for any other value", () => {
    expect(isAnyRecord([])).toBe(false);
    expect(isAnyRecord(null)).toBe(false);
  });
});
