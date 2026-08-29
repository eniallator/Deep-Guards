import { describe, expect, it } from "vitest";

import { GuardError, guardOrThrow } from "./errors.ts";
import { isString } from "./primitives.ts";

describe("GuardError", () => {
  it("is an Error with the GuardError name", () => {
    const error = new GuardError("test message");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("GuardError");
    expect(error.message).toBe("test message");
  });
});

describe("guardOrThrow", () => {
  it("returns the value when the guard succeeds", () => {
    expect(guardOrThrow("foo", isString)).toBe("foo");
  });

  it("throws a GuardError with the default message when the guard fails", () => {
    expect(() => guardOrThrow(1, isString)).toThrow(GuardError);
    expect(() => guardOrThrow(1, isString)).toThrow("Guard error");
  });

  it("throws a GuardError with the given hint when the guard fails", () => {
    expect(() => guardOrThrow(1, isString, "expected a string")).toThrow(
      "expected a string"
    );
  });
});
