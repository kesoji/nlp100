import { test, expect } from "vitest";

// https://nlp100.github.io/ja/ch01.html#00-%E6%96%87%E5%AD%97%E5%88%97%E3%81%AE%E9%80%86%E9%A0%86
// 00. 文字列の逆順
// 文字列”stressed”の文字を逆に（末尾から先頭に向かって）並べた文字列を得よ．

test("ans", () => {
  expect(answer("stressed")).toBe("desserts");
});

function answer(str) {
  return str.split("").reverse().join("");
}
