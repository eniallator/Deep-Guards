import { describe, expect, it } from "vitest";

import { invalidParam } from "./helpers.ts";

describe("invalidParam", () => {
  it("builds a TypeError from the name, expectation and received value", () => {
    const error = invalidParam("isFoo", "a guard parameter", "bar");
    expect(error).toBeInstanceOf(TypeError);
    expect(error.message).toBe(
      'isFoo expects a guard parameter. Got instead: "bar"'
    );
  });

  it("renders values JSON cannot represent", () => {
    expect(invalidParam("isFoo", "x", undefined).message).toContain(
      "Got instead: undefined"
    );
    expect(invalidParam("isFoo", "x", Symbol("bar")).message).toContain(
      "Got instead: Symbol(bar)"
    );
    expect(invalidParam("isFoo", "x", () => 1).message).toContain(
      "Got instead: () => 1"
    );
  });

  it("does not throw for values JSON cannot serialise", () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    expect(invalidParam("isFoo", "x", 1n).message).toContain(
      "Got instead: [object BigInt]"
    );
    expect(invalidParam("isFoo", "x", circular).message).toContain(
      "Got instead: [object Object]"
    );
  });
});
