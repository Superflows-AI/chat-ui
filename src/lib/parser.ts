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
  sectionInfo: { index: number; searchString: string },
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
    return inputStr
      .slice(sectionIndex + sectionInfo.searchString.length + 1)
      .trim();
  }

  return inputStr
    .slice(sectionIndex + sectionInfo.searchString.length + 1, nextSectionIdx)
    .trim();
}

const sections = [
  { searchString: "reasoning:" },
  { searchString: "plan:" },
  { searchString: "tell user:" },
  { searchString: "commands:" },
];

export function parseOutput(gptString: string): ParsedOutput {
  const sectionInfo = sections
    .map((section) => ({
      ...section,
      // TODO: Both `inString` and `index` could be wrong if by chance any of the
      //  searchStrings are used by GPT in an earlier stage of the response
      inString: gptString.toLowerCase().includes(section.searchString),
      index: gptString.toLowerCase().indexOf(section.searchString),
    }))
    .map((section, _, overall) => ({
      ...section,
      sectionText: section.inString
        ? getSectionText(gptString, section, overall)
        : "",
    }));

  const commands: FunctionCall[] = [];
  if (sectionInfo[3].inString) {
    const commandsText = sectionInfo[3].sectionText;
    commandsText
      .split("\n")
      // Filter out comments & empty lines
      .filter(
        (line: string) => !line.startsWith("# ") && line.trim().length > 0,
      )
      .forEach((line: string) => {
        try {
          commands.push(parseFunctionCall(line));
        } catch (e) {}
      });
  }

  // When the response is not in the expected format, for example if the user says "hi", the commands = []
  const completed = commands.length === 0;
  // Note: this gives true while streaming in. This is of course, incorrect!

  let tellUser;
  if (sectionInfo.every((section) => !section.inString)) {
    // When the response is not in the expected format, for example if the user says "hi"
    tellUser = gptString;
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
  const functionCallRegex = /(\w+)\(([^)]*)\)/;
  const argumentRegex = /([^,\s]+?)=({.*?}|'.*?'|".*?"|\[.*?\]|[^,]*)/g;

  const functionCallMatch = text.match(functionCallRegex);
  if (!functionCallMatch) {
    throw new Error("Invalid function call format: " + text);
  }

  const name = functionCallMatch[1];
  const argsText = functionCallMatch[2];
  let argMatch;
  const args = {};

  while ((argMatch = argumentRegex.exec(argsText)) !== null) {
    const key = argMatch[1];
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
      value = parseFloat(argMatch[2]);
    } else if (/^["'](.*)["']$/.test(argMatch[2])) {
      value = argMatch[2].slice(1, -1);
    } else if (/^(true|false)$/.test(argMatch[2])) {
      value = argMatch[2] === "true";
    } else if (/\{.*?}/g.test(argMatch[2]) || /\[(.*?)\]/g.test(argMatch[2])) {
      const objText = extractObjText(argMatch[2], argsText);
      try {
        value = JSON.parse(objText.replaceAll(/'/g, '"'));
      } catch (e) {
        value = argMatch[2];
      }
    } else {
      value = argMatch[2];
    }
    // @ts-ignore
    args[key] = value;
  }

  return { name, args };
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
