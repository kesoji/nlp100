#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const axios = require("axios");
const cheerio = require("cheerio");

// JavaScript template
const jsTemplate = (problemNumber, url, title, description, testCase) => {
  // Format description with proper line breaks for comments
  const formattedDescription = description
    .split("\n")
    .map((line) => `// ${line.trim()}`)
    .join("\n");

  return `// ${url}
// ${problemNumber}. ${title}
${formattedDescription}
  
import { test, expect } from "vitest";

test("test", () => {
  ${testCase}
});

function answer() {
  // TODO: 実装
  return null;
}`;
};

// Python template
const pythonTemplate = (problemNumber, url, title, description, testCase) => {
  // Format description with proper line breaks for comments
  const formattedDescription = description
    .split("\n")
    .map((line) => `# ${line.trim()}`)
    .join("\n");

  // Convert JS test case to Python unittest format
  const pythonTestCase = testCase
    .replace(
      /expect\(answer\("(.+?)"\)\)\.toBe\("(.+?)"\)/,
      'self.assertEqual(answer("$1"), "$2")',
    )
    .replace(
      /expect\(answer\((.+?)\)\)\.toBe\((.+?)\)/,
      "self.assertEqual(answer($1), $2)",
    );

  return `# ${url}
# ${problemNumber}. ${title}
${formattedDescription}

import unittest

class TestAnswer(unittest.TestCase):
    def test_answer(self):
        ${pythonTestCase}

def answer():
    # TODO: 実装
    return None

if __name__ == "__main__":
    unittest.main()`;
};

// Function to fetch HTML content from a URL
async function fetchHtml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}: ${error.message}`);
    throw error;
  }
}

// Function to format description with proper line breaks
function formatDescription(description) {
  // Replace multiple spaces with a single space
  let formatted = description.replace(/\s+/g, " ").trim();

  // Add line breaks for better readability
  // After sentences ending with periods, question marks, or exclamation marks
  formatted = formatted.replace(/([.!?])\s+/g, "$1\n");

  // After commas in appropriate contexts (not within numbers)
  formatted = formatted.replace(/([^0-9]),\s+([^0-9])/g, "$1,\n$2");

  // After semicolons
  formatted = formatted.replace(/;\s+/g, ";\n");

  // Remove excessive line breaks
  formatted = formatted.replace(/\n{3,}/g, "\n\n");

  return formatted;
}

// No longer needed as we format the description directly in the template functions

// Function to parse HTML and extract problem data
async function extractProblems(html, chapter) {
  const $ = cheerio.load(html);
  const problems = {};

  // Find all h2 elements that contain problem titles
  $("h2").each((i, heading) => {
    // Get the problem ID from the heading ID
    const headingId = $(heading).attr("id");
    if (!headingId) return;

    // Extract the problem number from the heading ID (e.g., "03-円周率" -> "03")
    const match = headingId.match(/^(\d+)-/);
    if (!match) return;

    const problemNumber = match[1].padStart(3, "0");

    // Extract the problem title from the heading text (e.g., "03. 円周率" -> "円周率")
    const titleMatch = $(heading)
      .text()
      .match(/\d+\.\s*(.*)/);
    const title = titleMatch ? titleMatch[1].trim() : $(heading).text().trim();

    // Extract the problem description from the paragraph following the heading
    let description = "";
    let nextElement = $(heading).next();

    // Continue until we hit the next heading or run out of elements
    while (nextElement.length > 0 && nextElement.prop("tagName") !== "H2") {
      if (nextElement.prop("tagName") === "P") {
        description += nextElement.text().trim() + " ";
      }
      nextElement = nextElement.next();
    }

    // Format the description with proper line breaks
    description = formatDescription(description);

    // Create the problem URL
    const url = `https://nlp100.github.io/2025/ja/ch${chapter.toString().padStart(2, "0")}.html#${headingId}`;

    // Store the problem data
    problems[problemNumber] = {
      chapter,
      title,
      description,
      url,
    };
  });

  return problems;
}

// Function to get problems for a specific chapter
async function getProblemsForChapter(chapter) {
  // Fetch and parse problems from the website
  const url = `https://nlp100.github.io/2025/ja/ch${chapter.toString().padStart(2, "0")}.html`;
  try {
    const html = await fetchHtml(url);
    return await extractProblems(html, chapter);
  } catch (error) {
    console.error(
      `Error getting problems for chapter ${chapter}: ${error.message}`,
    );
    throw error;
  }
}

// Function to get a specific problem
async function getProblem(problemNumber, chapter = 1) {
  // Determine which chapter the problem belongs to if not specified
  const targetChapter = chapter || Math.floor(parseInt(problemNumber) / 10) + 1;

  // Get all problems for the chapter
  const problems = await getProblemsForChapter(targetChapter);

  // Return the specific problem
  return problems[problemNumber];
}

// Function to generate a file for a specific problem
async function generateFile(problemNumber, language, chapter) {
  try {
    console.log(`問題 ${problemNumber} のデータを取得中...`);

    // Get the problem data
    const problem = await getProblem(problemNumber, chapter);

    if (!problem) {
      console.error(`問題 ${problemNumber} のデータが見つかりません。`);
      return false;
    }

    console.log(
      `問題 ${problemNumber} のデータを取得しました: ${problem.title}`,
    );

    const template = language === "nodejs" ? jsTemplate : pythonTemplate;
    const fileExtension = language === "nodejs" ? ".test.js" : ".test.py";
    const fileName = `${problemNumber}${fileExtension}`;

    const content = template(
      problemNumber,
      problem.url,
      problem.title,
      problem.description,
      'expect(answer("A")).toBe("B")', // Placeholder for test case
    );

    // Check if file already exists
    if (fs.existsSync(fileName)) {
      const overwrite = process.env.FORCE_OVERWRITE === "true";
      if (!overwrite) {
        console.error(
          `ファイル ${fileName} は既に存在します。上書きするには FORCE_OVERWRITE=true を設定してください。`,
        );
        return false;
      }
    }

    fs.writeFileSync(fileName, content);
    console.log(`ファイル ${fileName} を生成しました。`);
    return true;
  } catch (error) {
    console.error(
      `ファイル ${problemNumber} の生成中にエラーが発生しました:`,
      error.message,
    );
    return false;
  }
}

// Function to generate files for a range of problems
async function generateFilesForRange(
  startNumber,
  endNumber,
  language,
  chapter,
) {
  let success = true;
  for (let i = parseInt(startNumber); i <= parseInt(endNumber); i++) {
    const problemNumber = i.toString().padStart(3, "0");
    if (!(await generateFile(problemNumber, language, chapter))) {
      success = false;
    }
  }
  return success;
}

// Add a new option for force refresh
const argv = yargs(hideBin(process.argv))
  .option("number", {
    alias: "n",
    description: "問題番号（例: 003）",
    type: "string",
  })
  .option("range", {
    alias: "r",
    description: "問題範囲（例: 003-009）",
    type: "string",
  })
  .option("chapter", {
    alias: "c",
    description: "章番号",
    type: "number",
    default: 1,
  })
  .option("language", {
    alias: "l",
    description: "プログラミング言語",
    choices: ["nodejs", "python"],
    default: "nodejs",
  })
  .help().argv;

// Main execution
async function main() {
  const { number, range, language, chapter } = argv;

  if (!number && !range) {
    console.error("問題番号または問題範囲を指定してください。");
    process.exit(1);
  }

  try {
    if (number) {
      // Generate a single file
      const success = await generateFile(number, language, chapter);
      process.exit(success ? 0 : 1);
    } else if (range) {
      // Generate files for a range
      const [start, end] = range.split("-");
      if (!start || !end) {
        console.error("問題範囲の形式が不正です。例: 003-009");
        process.exit(1);
      }

      const success = await generateFilesForRange(
        start,
        end,
        language,
        chapter,
      );
      process.exit(success ? 0 : 1);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error.message);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("予期せぬエラーが発生しました:", error);
  process.exit(1);
});
