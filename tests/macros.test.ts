import { isDiscriminatedObjectOf, isObjectOf, isString } from "../dist";

describe("isDiscriminatedObjectOf", () => {
  describe("no key override", () => {
    const guard = isDiscriminatedObjectOf(
      "foo",
      isObjectOf({ bar: isString }, true)
    );

    it("succeeds for an object of the value", () => {
      expect(guard({ type: "foo", bar: "baz" })).toBe(true);
    });

    it("fails for any other value", () => {
      expect(guard({ type: "foo" })).toBe(false);
      expect(guard({ bar: "baz" })).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });

  describe("overriding key", () => {
    const guard = isDiscriminatedObjectOf(
      "foo",
      isObjectOf({ bar: isString }, true),
      "test"
    );

    it("succeeds for an object of the value", () => {
      expect(guard({ test: "foo", bar: "baz" })).toBe(true);
    });

    it("fails for any other value", () => {
      expect(guard({ test: "foo" })).toBe(false);
      expect(guard({ bar: "baz" })).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });
});
