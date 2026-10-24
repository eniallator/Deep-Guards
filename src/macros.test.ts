import { describe, expect, it } from "vitest";

import { isDiscriminatedObjectOf } from "./macros.ts";
import { isString } from "./primitives.ts";
import { isExactObjectOf, isObjectOf } from "./structures.ts";

describe("isDiscriminatedObjectOf", () => {
  describe("no key override", () => {
    const guard = isDiscriminatedObjectOf(
      "foo",
      isExactObjectOf({ bar: isString })
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
      isExactObjectOf({ bar: isString }),
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

  it("throws for a non-function guard parameter", () => {
    // @ts-expect-error testing invalid input
    expect(() => isDiscriminatedObjectOf("foo", "not a function")).toThrow(
      TypeError
    );
  });

  it("throws for a non-property-key key parameter", () => {
    expect(() =>
      // @ts-expect-error testing invalid input
      isDiscriminatedObjectOf("foo", isObjectOf({ bar: isString }), null)
    ).toThrow(TypeError);
  });
});
