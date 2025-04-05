// https://nlp100.github.io/ja/ch01.html#03-円周率
// 003. 円周率
// "Now I need a drink, alcoholic of course, after the heavy lectures involving quantum mechanics."
// という文を単語に分解し，各単語の（アルファベットの）文字数を先頭から出現順に並べたリストを作成せよ．

import { test, expect } from "vitest";

test("test", () => {
  expect(answer("Now I need a drink, alcoholic of course, after the heavy lectures involving quantum mechanics."))
  .toEqual([3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9])
});

function answer(sentence) {
  const words = sentence.split(/[\s+,.]/).filter(word => word.length > 0);
  const ans = [];
  for (const word of words) {
    ans.push(word.length);
  }

  return ans;
}