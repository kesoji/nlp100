# https://nlp100.github.io/ja/ch01.html#01-パタトクカシーー
# 001. 「パタトクカシーー」
# 「パタトクカシーー」という文字列の1,3,5,7文字目を取り出して連結した文字列を得よ．

import unittest

class TestAnswer(unittest.TestCase):
    def test_answer(self):
        self.assertEqual(answer("パタトクカシーー"), "パトカー")

def answer(str: str) -> str:
    return "".join(list(str)[0::2])

if __name__ == "__main__":
    unittest.main()