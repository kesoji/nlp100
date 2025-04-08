// https://nlp100.github.io/2025/ja/ch01.html#problem-005
// 005. n-gram#
// 与えられたシーケンス（文字列やリストなど）からn-gramを作る関数を作成せよ。この関数を用い、”I am an NLPer”という文から文字tri-gram、単語bi-gramを得よ。

import { test, expect } from "vitest";

test("test", () => {
  expect(answer("I am an NLPer", "char", 3)).toStrictEqual([["I", " ", "a"], [" ", "a", "m"], ["a", "m", " "], ["m", " ", "a"], [" ", "a", "n"], ["a", "n", " "], ["n", " ", "N"], [" ", "N", "L"], ["N", "L", "P"], ["L", "P", "e"], ["P", "e", "r"]])
  expect(answer("I am an NLPer", "word", 2)).toStrictEqual([["I", "am"], ["am", "an"], ["an", "NLPer"]])
});

function answer(str, type, n) {
  const result = []
  switch (type) {
    case "char": {
      const chars = str.split("")
      while (chars.length >= 3) {
        result.push([chars[0], chars[1], chars[2]])
        chars.shift()
      }
      return result;
    }
    case "word": {
      const words = str.split(/\s+/)
      while (words.length >= 2) {
        result.push([words[0], words[1]])
        words.shift()
      }
      return result
    }
  }
}
