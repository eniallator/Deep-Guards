import { isDiscriminatedObjectOf, isObjectOf, isString } from "../src";

describe("isDiscriminatedObjectOf", () => {
  const guard = isDiscriminatedObjectOf("foo", isObjectOf({ bar: isString }));

  it("succeeds for an object of the value", () => {
    expect(guard({ type: "foo", bar: "baz" })).toBe(true);
  });

  it("fails for any other value", () => {
    expect(guard({ type: "foo" })).toBe(false);
    expect(guard({ bar: "baz" })).toBe(false);
    expect(guard(1)).toBe(false);
  });
});
