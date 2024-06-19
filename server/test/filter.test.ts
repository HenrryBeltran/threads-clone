import { expect, test } from "bun:test";

function filterHashtagAndMentions(text: string, char: "#" | "@") {
  const splitSpaces = text.split(/[\s]/).filter((s) => s.startsWith(char));
  const splitChars = splitSpaces
    .join("")
    .split(char)
    .filter((s) => s.length > 1);
  const reduceDuplicates = [...new Set(splitChars)];
  const words = reduceDuplicates.map((word) => `${char}${word.toLowerCase()}`);

  console.log("~ result", words);
  return words;
}

test("filter hashtags", () => {
  expect(
    filterHashtagAndMentions(
      `
      This is a test to run with #bun for @threads
      test duplicates ###bun @@@threads
      test duplicates ###bun @@@threads
      .
      .
      .
      #hashtag #filter#Henrry#NEOVIM
    `,
      "#",
    ),
  ).toEqual(["#bun", "#hashtag", "#filter", "#henrry", "#neovim"]);
});

test("filter mentions", () => {
  expect(
    filterHashtagAndMentions(
      `
      This is a test to run with #bun for @threads
      test duplicates ###bun @@@threads
      test duplicates ###bun @@@threads
      .
      .
      .
      @hashtag @filter@Henrry@NEOVIM
    `,
      "@",
    ),
  ).toEqual(["@threads", "@hashtag", "@filter", "@henrry", "@neovim"]);
});

test("empty hashtags", () => {
  expect(
    filterHashtagAndMentions(
      `
      This is a test to run without mentions;
      .
      .
      or # or @


      or # or @

      so this should be empty.
    `,
      "#",
    ),
  ).toEqual([]);
});

test("empty mentions", () => {
  expect(
    filterHashtagAndMentions(
      `
      This is a test to run without mentions;
      .
      .
      or # or @


      or # or @

      so this should be empty.
    `,
      "@",
    ),
  ).toEqual([]);
});
