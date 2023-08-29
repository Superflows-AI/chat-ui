import tablemark from "tablemark";

export function classNames(
  ...classes: (string | undefined | null | boolean)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function functionNameToDisplay(name: string): string {
  return (
    name
      // Insert a space before all camelCased and PascalCased characters
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      // Replace underscores with a space
      .replace(/_/g, " ")
      // Convert all text to lower case
      .toLowerCase()
      // Capitalize the first letter of each word
      .replace(/\b[a-z](?=[a-z]{1})/g, (letter) => letter.toUpperCase())
  );
}

export function convertToRenderable(
  functionOutput: Record<string, any> | any[],
  caption?: string,
): string {
  /** Converts a function's output to a Markdown table **/
  let output = "";
  if (caption) {
    output += `### ${caption}\n\n`;
  }
  // Format: {data: {...interestingData}}
  if (
    !Array.isArray(functionOutput) &&
    Object.keys(functionOutput).length === 1 &&
    typeof functionOutput[Object.keys(functionOutput)[0]] === "object"
  ) {
    if (!caption) {
      // Make the first key the caption
      output += `### ${functionNameToDisplay(
        Object.keys(functionOutput)[0],
      )}\n\n`;
    }
    functionOutput = functionOutput[Object.keys(functionOutput)[0]];
  }

  if (Array.isArray(functionOutput)) {
    // Assume all elements have the same type
    functionOutput = functionOutput.filter((item: any) => {
      return !(typeof item === "string") || !isUUID(item);
    });
    if (typeof (functionOutput as any[])[0] !== "object") {
      if (functionOutput.length < 7) {
        // And did those feet in ancient time,
        return (
          output +
          ("|" +
            functionOutput.map(() => "   ").join("|") +
            "|\n|" +
            functionOutput.map(() => "---").join("|") +
            "|\n| " +
            functionOutput.join(" | ") +
            " |\n")
        );
      } else {
        // Walk upon England's mountains green?
        return (
          output + "|   |\n|---|\n| " + functionOutput.join(" |\n| ") + " |\n"
        );
      }
    }
    // Otherwise, we have an array of arrays/objects
    let columns: { name?: string; align: "center" }[];
    if (Array.isArray((functionOutput as any[])[0])) {
      functionOutput = functionOutput.map((item: any) => {
        // Format: [[{a,b,c,d}, {a,b,c,d}], [{a,b,c,d}, {a,b,c,d}]]
        return item
          .filter(
            (subItem: any) => typeof subItem !== "string" || !isUUID(subItem),
          )
          .map((filteredSubItem: any) => {
            // .slice() cuts out the starting and end [] or {}
            if (typeof filteredSubItem === "object")
              return stringify(filteredSubItem);
            else return filteredSubItem;
          });
      });
      columns = (functionOutput as any[])[0].map(() => ({ align: "center" }));
    } else {
      // Array of objects
      functionOutput = functionOutput.map((item: any) => {
        // Format: [{a,b,c,d}, {a,b,c,d}, {a,b,c,d}, {a,b,c,d}]
        Object.entries(item).forEach(([key, value]: any) => {
          // Deal with nested objects: [{a,b:{c,d}}, {a,b:{c,d}}]
          if (typeof value === "object" && !Array.isArray(value)) {
            Object.entries(value).forEach(([subKey, subValue]: any) => {
              if (typeof subValue === "object") {
                item[`${key}: ${subKey}`] = stringify(subValue);
              } else {
                item[`${key}: ${functionNameToDisplay(subKey)}`] = subValue;
              }
            });
            delete item[key];
          } else if (isUUID(value)) {
            item[key] = undefined;
          } else if (Array.isArray(value)) {
            item[key] = stringify(value);
          } else if (typeof value === "string") {
            item[key] = value.replaceAll("\n", "&#10;");
          } else item[key] = value;
        });
        return item;
      });
      columns = Object.keys((functionOutput as object[])[0]).map((n) => ({
        name: functionNameToDisplay(n),
        align: "center",
      }));
    }
    // And was the holy Lamb of God,
    return output + tablemark(functionOutput as any[], { columns });
  } else {
    // Format: {a, b}
    functionOutput = Object.entries(functionOutput)
      .filter(([_, value]) => {
        return !isUUID(value);
      })
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    output += tablemark(
      Object.entries(functionOutput).map(([key, value]) => {
        return {
          Name: key,
          Value: typeof value === "object" ? stringify(value) : value,
        };
      }),
    );
  }
  // On England's pleasant pastures seen?
  return output;
}

function stringify(obj: Record<string, any> | any[]): string {
  return (
    JSON.stringify(obj)
      // .slice() cuts out the starting and end [] or {}
      .slice(1, -1)
      // .replaceAll() replaces all " with nothing
      .replaceAll('"', "")
  );
}

export function splitContentByParts(content: string): string[] {
  /** We split the message into different parts (based on whether they're a <button> or just text),
   * and then render parts one-by-one **/
  // TODO: Remove this - it's no longer necessary!
  const fullRegex = /(<button>.*?<\/button>)|([\s\S]+?)/g;

  let match;
  const matches: string[] = [];
  while ((match = fullRegex.exec(content)) !== null) {
    if (match[1]) matches.push(match[1]);
    if (match[2]) {
      // This is because the 3rd match group is lazy, so only captures 1 character at a time
      const prev = matches[matches.length - 1];
      if (
        matches.length === 0 ||
        (prev.startsWith("<") && prev.endsWith(">"))
      ) {
        matches.push(match[2]);
      } else matches[matches.length - 1] += match[2];
    }
  }
  return matches;
}

export function isUUID(str: string): boolean {
  const regexExp =
    /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
  return regexExp.test(str);
}
