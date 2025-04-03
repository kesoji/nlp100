import { test, expect } from "vitest";

// https://nlp100.github.io/ja/ch01.html#02-%E3%83%91%E3%83%88%E3%82%AB%E3%83%BC%E3%82%BF%E3%82%AF%E3%82%B7%E3%83%BC%E3%83%91%E3%82%BF%E3%83%88%E3%82%AF%E3%82%AB%E3%82%B7%E3%83%BC%E3%83%BC
// 02. 「パトカー」＋「タクシー」＝「パタトクカシーー」
// 「パトカー」＋「タクシー」の文字を先頭から交互に連結して文字列「パタトクカシーー」を得よ．

test("test", () => {
  expect(answer("パトカー", "タクシー")).toBe("パタトクカシーー");
});

function answer(str1, str2) {
  str1 = str1.split("");
  str2 = str2.split("");
  let ans = "";
  while (str1.length > 0 || str2.length > 0) {
    ans += str1.shift();
    ans += str2.shift();
  }

  return ans;
}
