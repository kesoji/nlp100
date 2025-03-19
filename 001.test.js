import { reverse } from "./001";
import { test, expect } from "vitest";

test("reverse stressed", () => {
  expect(reverse("stressed")).toBe("desserts");
});
