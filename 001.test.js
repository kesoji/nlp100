import { test, expect } from "vitest";

// https://nlp100.github.io/ja/ch01.html#01-%E3%83%91%E3%82%BF%E3%83%88%E3%82%AF%E3%82%AB%E3%82%B7%E3%83%BC%E3%83%BC
// 01. 「パタトクカシーー」
// 「パタトクカシーー」という文字列の1,3,5,7文字目を取り出して連結した文字列を得よ．

test("test", () => {
  expect(answer("パタトクカシーー")).toBe("パトカー");
});

function answer(str) {
  str = str.split("");
  let ans = "";
  let i = 0;
  for (const s of str) {
    i++;
    if (i % 2 === 0) {
      continue;
    }
    ans += s;
  }

  return ans;
}
