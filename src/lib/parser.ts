export interface FunctionCall {
  name: string;
  args: { [key: string]: any };
}

export interface ParsedOutput {
  reasoning: string;
  plan: string;
  tellUser: string;
  commands: FunctionCall[];
  // Only valid when streaming is complete. Don't use while streaming
  completed: boolean;
}

function getSectionText(
  inputStr: string,
  sectionInfo: { index: number; match: string },
  allSectionInfo: { index: number }[],
): string {
  const sectionIndex = sectionInfo.index;
  const nextSectionIdx = [...allSectionInfo]
    // Sort into ascending order
    .sort((s1, s2) => s1.index - s2.index)
    // Get the lowest index that is greater than sectionIndex
    .find((s) => s.index > sectionIndex)?.index;

  if (sectionIndex === -1) {
    return "Invalid input string: " + inputStr;
  }

  if (nextSectionIdx === -1 || !nextSectionIdx) {
    // This returns the rest of the string after the section name
    return inputStr.slice(sectionIndex + sectionInfo.match.length).trim();
  }

  return inputStr
    .slice(sectionIndex + sectionInfo.match.length, nextSectionIdx)
    .trim();
}

const sections = [
  /^Reasoning:\s?/m,
  /^Plan:\s?/m,
  /^Tell user:\s?/m,
  /^Commands:\s?/m,
];

export function parseOutput(gptString: string): ParsedOutput {
  // The output usually starts with "Reasoning", compose of 2 tokens
  if (["Reason", "Reasoning"].includes(gptString)) {
    return {
      reasoning: "",
      plan: "",
      tellUser: "",
      commands: [],
      completed: true,
    };
  }
  const sectionInfo = sections
    .map((section) => {
      const match = gptString.match(section);
      return {
        inString: Boolean(match),
        match: match?.[0] ?? "",
        index: match?.index ?? -1,
      };
    })
    .map((section, _, overall) => ({
      ...section,
      sectionText: section.inString
        ? getSectionText(gptString, section, overall)
        : "",
    }));

  const commands: FunctionCall[] = [];
  const unparsedCommands: string[] = [];
  if (sectionInfo[3].inString) {
    const commandsText = sectionInfo[3].sectionText;
    commandsText
      .split("\n")
      // Filter out comments & empty lines
      .filter(
        (line: string) => !line.startsWith("# ") && line.trim().length > 0,
      )
      .forEach((line: string) => {
        // If "Commands: None" is present, don't add it to the commands array
        if (line === "None") return;
        try {
          commands.push(parseFunctionCall(line));
        } catch (e) {
          // In case the output has the "tell user" section under
          // "commands".
          if (
            !line.startsWith("//") &&
            !line.startsWith("#") &&
            line.trim().toLowerCase() !== "none" &&
            !line.toLowerCase().includes("no command") &&
            [".", "?", "!"].includes(line[line.length - 1]) &&
            !["(", ")", "_"].some((char) => line.includes(char))
          )
            unparsedCommands.push(line.replace("tell user:", ""));
        }
      });
  }

  // When the response is not in the expected format, for example if the user says "hi", the commands = []
  const completed = commands.length === 0;
  // Note: this gives true while streaming in. This is of course, incorrect!

  let tellUser;
  if (sectionInfo.every((section) => !section.inString)) {
    // When the response is not in the expected format, for example if the user says "hi"
    tellUser = gptString;
  } else if (
    commands.length === 0 &&
    unparsedCommands.length > 0 &&
    sectionInfo[2].sectionText === ""
  ) {
    // Sometimes the output is just "commands" followed
    // by a message for the user.
    tellUser = unparsedCommands.join("\n");
  } else if (commands.length === 0 && sectionInfo[2].sectionText === "") {
    // Sometimes the AI just writes and then puts commands at the end
    const tellUserEndIdx = Math.min(
      ...sectionInfo.map((s) => s.index).filter((i) => i !== -1),
      gptString.length,
    );
    tellUser = gptString.slice(0, tellUserEndIdx).trim();
  } else {
    // Otherwise set to the "Tell user:" section
    tellUser = sectionInfo[2].sectionText;
  }

  return {
    reasoning: sectionInfo[0].sectionText,
    plan: sectionInfo[1].sectionText,
    tellUser,
    commands,
    completed,
  };
}

export function getLastSectionName(gptString: string): string {
  if (gptString.toLowerCase().includes("commands:")) {
    return "commands";
  } else if (gptString.toLowerCase().includes("tell user:")) {
    return "tell user";
  } else if (gptString.toLowerCase().includes("plan:")) {
    return "plan";
  } else {
    return "reasoning";
  }
}

export function parseFunctionCall(text: string): FunctionCall {
  // Below regex captures the function name and arguments
  // (?:\d\. |- )? optionally matches a numbering/bullet point
  // (\w+) matches the function name (any non whitespace characters)
  // \( matches the opening bracket
  // (.*) matches everything inside the brackets
  // \) matches the closing bracket
  // |(\w+) matches the function name if the brackets were forgotten
  //  (common on fine-tuned 3.5)
  const functionCallRegex =
    /^(?:\d\. |- )?(([\w\\_]+)\((.*)\)|([\w\\_]+))[,;]?$/;
  const functionCallMatch = text.match(functionCallRegex);
  if (!functionCallMatch) {
    throw new Error("Invalid function call format: " + text);
  }
  // Below regex captures the arguments inside the function call brackets, one by one
  // ([^,\s]+?) matches the argument name
  // ({.*?}|'.*?[^\\]'|''|".*?[^\\]"|""|\[.*?\]|[^,]*) matches the argument value
  //   {.*?} matches an object
  //   '' matches an empty string
  //   '.*?[^\\]' matches a string wrapped in single quotes
  //   "" matches an empty string
  //   ".*?[^\\]" matches a string wrapped in double quotes
  //   \[.*?\] matches an array
  //   [^,]* matches anything that is not a comma (e.g. string without quotes/number/boolean)
  const argumentRegex =
    /([^,\s]+?)=({.*?}|''|'.*?[^\\]'|""|".*?[^\\]"|\[.*?\]|[^,]*)/g;

  const name = handleEscapedUnderscores(
    functionCallMatch[2] || functionCallMatch[4],
  );
  const argsText = functionCallMatch[3] ?? "";
  let argMatch;
  const args = {};

  while ((argMatch = argumentRegex.exec(argsText)) !== null) {
    const key = handleEscapedUnderscores(argMatch[1]);
    let value;

    // Below regexes must stay as inline variables, otherwise they will exhibit below behaviour:
    // E.g.
    // let regex = /o/g;
    // let text = 'hello world';
    //
    // console.log(regex.test(text));  // true
    // console.log(regex.test(text));  // true
    // console.log(regex.test(text));  // false
    if (/^\d+(\.\d+)?$/.test(argMatch[2])) {
      // Number
      value = parseFloat(argMatch[2]);
    } else if (/^(""|''|".*?[^\\]"|'.*?[^\\]')$/.test(argMatch[2])) {
      // String
      try {
        value = JSON.parse(makeDoubleExternalQuotes(argMatch[2]));
      } catch (e) {
        // Slice removes the quotes
        value = argMatch[2].slice(1, -1);
      }
    } else if (/^([tT]rue|[fF]alse)$/.test(argMatch[2])) {
      // Boolean
      value = ["true", "True"].includes(argMatch[2]);
    } else if (/\{.*?}/g.test(argMatch[2]) || /\[(.*?)]/g.test(argMatch[2])) {
      // Object/array
      const objText = extractObjText(argMatch[2], argsText);
      try {
        value = JSON.parse(
          objText
            .replaceAll(/'/g, '"')
            .replace(/":\s?True/g, '": true')
            .replace(/":\s?False/g, '": false'),
        );
      } catch (e) {
        value = argMatch[2];
      }
    } else {
      // Otherwise (not well-supported)
      value = argMatch[2];
    }
    // @ts-ignore
    args[key] = value;
  }

  return { name, args };
}

function handleEscapedUnderscores(text: string): string {
  // Common mistake made by LLM is to escape underscore when it doesn't need to
  // Replace escaped underscores with a placeholder
  // E.g. "hello\_world" -> "hello_world"
  return text.replaceAll(/\\_/g, "_");
}

export function extractObjText(matchText: string, argsText: string): string {
  const index = argsText.indexOf(matchText);
  const textToMatch = argsText.slice(index);

  let openBrackets = "";
  let chatIdx = 0;

  while (
    chatIdx < textToMatch.length &&
    (textToMatch[chatIdx] !== "," || openBrackets)
  ) {
    const char = textToMatch[chatIdx];
    const lastBracket = openBrackets[openBrackets.length - 1];
    if ("{[".includes(char)) {
      openBrackets += char;
    } else if (
      ("}" === char && lastBracket === "{") ||
      ("]" === char && lastBracket === "[")
    ) {
      // Remove last element from openBrackets
      openBrackets = openBrackets.slice(0, -1);
    }
    chatIdx++;
  }
  return textToMatch.slice(0, chatIdx);
}

export function makeDoubleExternalQuotes(text: string): string {
  // If wrapped in single quotes, convert to double quotes
  if (text[0] === "'" && text[text.length - 1] === "'") {
    // Converting from single to double quotes requires escaping all
    // double quotes, unless they are already escaped
    return `"${text
      .slice(1, -1)
      .replace(/([^\\])"/g, '$1\\"')
      .replace(/\\'/g, "'")}"`;
  }
  return text;
}
