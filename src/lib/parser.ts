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
  sectionName: string,
  nextSectionName: string,
): string {
  const sectionIndex = inputStr.indexOf(sectionName + ":");
  const nextSectionIdx = inputStr.indexOf(nextSectionName + ":");

  if (sectionIndex === -1 || sectionIndex > nextSectionIdx) {
    return "Invalid input string: " + inputStr;
  }

  if (nextSectionIdx === -1) {
    return inputStr.slice(sectionIndex + sectionName.length + 1).trim();
  }

  return inputStr
    .slice(sectionIndex + sectionName.length + 1, nextSectionIdx)
    .trim();
}

export function parseOutput(gptString: string): ParsedOutput {
  // TODO: Below booleans could be wrong if by chance any of the below strings are used
  //  by GPT in an earlier stage of the response
  const reasoningIn = gptString.toLowerCase().includes("reasoning:");
  const planIn = gptString.toLowerCase().includes("plan:");
  const tellUserIn = gptString.toLowerCase().includes("tell user:");
  const commandsIn = gptString.toLowerCase().includes("commands:");

  let reasoning = "";
  if (reasoningIn && (planIn || tellUserIn || commandsIn)) {
    reasoning = getSectionText(
      gptString,
      "Reasoning",
      planIn ? "Plan" : tellUserIn ? "Tell user" : "Commands",
    );
  } else if (reasoningIn) {
    // Response streaming in, reasoning present, but no other sections yet
    reasoning = gptString.split("Reasoning:")[1].trim();
  } // Either streaming in, reasoning word incomplete, or no reasoning

  let plan: string = "";
  if (planIn) {
    if (tellUserIn) {
      plan = getSectionText(gptString, "Plan", "Tell user");
    } else if (commandsIn) {
      plan = getSectionText(gptString, "Plan", "Commands");
    } else {
      plan = gptString.split("Plan:")[1].trim();
    }
  }

  let tellUser: string = "";
  if (tellUserIn) {
    if (commandsIn) {
      tellUser = getSectionText(gptString, "Tell user", "Commands");
    } else {
      tellUser = gptString.split("Tell user:")[1].trim();
    }
  }

  let commands: FunctionCall[] = [];
  if (commandsIn) {
    const commandsText = gptString.split("Commands:")[1].trim();
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
  // When the response is not in the expected format, for example if the user says "hi"
  if (!reasoningIn && !planIn && !tellUserIn && !commandsIn) {
    return { reasoning, plan, tellUser: gptString, commands, completed: true };
  }
  // Note: this gives true while streaming in. This is of course, incorrect!
  const completed =
    (reasoningIn || planIn || tellUserIn || commandsIn) &&
    commands.length === 0;

  return { reasoning, plan, tellUser, commands, completed };
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
