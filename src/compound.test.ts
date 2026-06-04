import { describe, expect, it } from "vitest";

import {
  isExact,
  isFalsey,
  isInstance,
  isIntersectionOf,
  isNonNullable,
  isNot,
  isNullable,
  isOneOf,
  isOptional,
  isUnionOf,
} from "./compound.ts";
import { isNumber, isString } from "./primitives.ts";

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

describe("isFalsey", () => {
  it("succeeds for all falsey values", () => {
    expect(isFalsey(undefined)).toBe(true);
    expect(isFalsey(false)).toBe(true);
    expect(isFalsey(null)).toBe(true);
    expect(isFalsey("")).toBe(true);
    expect(isFalsey(0)).toBe(true);
    expect(isFalsey(0n)).toBe(true);
  });

  it("fails for all truthy values", () => {
    expect(isFalsey(true)).toBe(false);
    expect(isFalsey(1)).toBe(false);
    expect(isFalsey(-1)).toBe(false);
    expect(isFalsey("foo")).toBe(false);
    expect(isFalsey([])).toBe(false);
    expect(isFalsey({})).toBe(false);
    expect(isFalsey(0n + 1n)).toBe(false);
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

  it("fails any other value", () => {
    expect(guard(2)).toBe(false);
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
  const guard = isIntersectionOf(isOneOf("foo", "bar", "baz"), isExact("foo"));

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
    const guard = isExact({ foo: "bar", hello: ["world", { key: "test" }] });

    it("succeeds for the exact value", () => {
      expect(guard({ foo: "bar", hello: ["world", { key: "test" }] })).toBe(
        true,
      );
    });

    it("fails for any other value", () => {
      expect(guard({ foo: "baz", hello: ["world", { key: "test" }] })).toBe(
        false,
      );
      expect(guard({ foo: "bar", hello: ["world", { key: "tester" }] })).toBe(
        false,
      );
      expect(guard(1)).toBe(false);
    });
  });

  describe("shallow", () => {
    const guard = isExact("foo");

    it("succeeds for the exact value", () => {
      expect(guard("foo")).toBe(true);
    });

    it("fails for any other value", () => {
      expect(guard("bar")).toBe(false);
      expect(guard(1)).toBe(false);
    });
  });

  describe("Date", () => {
    const date = new Date("2000-01-01");
    const guard = isExact(date);

    it("succeeds for the exact same date", () => {
      expect(guard(new Date("2000-01-01"))).toBe(true);
    });

    it("fails for different dates", () => {
      expect(guard(new Date("2000-01-02"))).toBe(false);
      expect(guard(date.getTime())).toBe(false);
    });
  });

  describe("RegExp", () => {
    const regex = /test/gi;
    const guard = isExact(regex);

    it("succeeds for the exact same regex", () => {
      expect(guard(/test/gi)).toBe(true);
    });

    it("fails for different regexes", () => {
      expect(guard(/test/i)).toBe(false);
      expect(guard(/test2/gi)).toBe(false);
      expect(guard("test")).toBe(false);
    });
  });

  describe("Error", () => {
    const error = new Error("test error");
    const guard = isExact(error);

    it("succeeds for the exact same error", () => {
      expect(guard(new Error("test error"))).toBe(true);
    });

    it("fails for different errors", () => {
      expect(guard(new Error("other error"))).toBe(false);
      expect(guard(new TypeError("test error"))).toBe(false);
      expect(guard("test error")).toBe(false);
    });
  });

  describe("Map", () => {
    const map = new Map([["key", "value"]]);
    const guard = isExact(map);

    it("succeeds for the exact same map", () => {
      expect(guard(new Map([["key", "value"]]))).toBe(true);
    });

    it("fails for different maps", () => {
      expect(guard(new Map([["key", "other"]]))).toBe(false);
      expect(guard(new Map([["other", "value"]]))).toBe(false);
      expect(guard(new Map())).toBe(false);
      expect(guard({})).toBe(false);
    });
  });

  describe("Set", () => {
    const set = new Set([1, 2, 3]);
    const guard = isExact(set);

    it("succeeds for the exact same set", () => {
      expect(guard(new Set([1, 2, 3]))).toBe(true);
    });

    it("fails for different sets", () => {
      expect(guard(new Set([1, 2]))).toBe(false);
      expect(guard(new Set([1, 2, 4]))).toBe(false);
      expect(guard([1, 2, 3])).toBe(false);
    });
  });

  describe("Typed Array", () => {
    const array = new Uint8Array([1, 2, 3]);
    const guard = isExact(array);

    it("succeeds for the exact same typed array", () => {
      expect(guard(new Uint8Array([1, 2, 3]))).toBe(true);
    });

    it("fails for different typed arrays", () => {
      expect(guard(new Uint8Array([1, 2]))).toBe(false);
      expect(guard(new Uint8Array([1, 2, 4]))).toBe(false);
      expect(guard(new Int8Array([1, 2, 3]))).toBe(false);
      expect(guard([1, 2, 3])).toBe(false);
    });
  });
});

describe("isInstance", () => {
  class Test {
    foo: string = "bar";

    constructor(foo: string) {
      this.foo = foo;
    }
  }
  const guard = isInstance(Test);

  it("succeeds for an instance", () => {
    expect(guard(new Test("baz"))).toBe(true);
  });

  it("fails for any other type", () => {
    expect(guard({})).toBe(false);
    expect(guard(null)).toBe(false);
  });
});
