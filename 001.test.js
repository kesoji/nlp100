import { test, expect } from "vitest";

function reverse(str) {
  return str.split("").reverse().join("");
}

test("reverse stressed", () => {
  expect(reverse("stressed")).toBe("desserts");
});
