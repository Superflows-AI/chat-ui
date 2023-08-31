import tablemark from "tablemark";
import { validate } from "uuid";

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

  functionOutput = removeUUIDs(functionOutput);

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

  // Do this here so we get the correct caption
  functionOutput = removeSingleKeyNodes(functionOutput);

  if (Array.isArray(functionOutput)) {
    // Assume all elements have the same type
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
        return item.map((subItem: any) => {
          // .slice() cuts out the starting and end [] or {}
          if (typeof subItem === "object") return stringify(subItem);
          else return subItem;
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

function isUUID(str: string): boolean {
  return validate(str);
}

export function removeUUIDs(
  data: Record<string, any> | any[],
): Record<string, any> | any[] {
  if (Array.isArray(data)) {
    return data.filter((item) => !isUUID(item)).map(removeUUIDs);
  } else if (typeof data === "object" && data !== null) {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (!isUUID(key) && !isUUID(value)) {
        result[key] = removeUUIDs(value);
      }
    }
    return result;
  } else {
    return data;
  }
}

export function removeSingleKeyNodes(
  data: Record<string, any> | any[],
  fieldName: string[] = [],
): Record<string, any> | any[] {
  // Recursively removes nodes with a single key where the value of the node
  // is an object

  // Handle special case where parent object is e.g. {a: [1,2,3]}, should return [1,2,3]
  if (!Array.isArray(data)) {
    const specialCaseRes = specialCaseDeNesting(data);
    if (specialCaseRes) {
      return specialCaseRes;
    }
  }

  if (Array.isArray(data)) {
    const result: any[] = [];
    data.forEach((item) => {
      result.push(removeSingleKeyNodes(item, fieldName));
    });
    return result;
  }

  function helper(
    obj: Record<string, any>,
    result: Record<string, any>,
    fieldNames: string[],
  ): Record<string, any> {
    if (typeof obj !== "object") {
      return obj;
    }

    const keys = Object.keys(obj);
    if (keys.length === 1) {
      const value = obj[keys[0]];
      fieldNames.push(keys[0]);
      if (typeof value === "object" && !Array.isArray(value)) {
        return helper(value, result, fieldNames);
      } else {
        result[fieldNames.join(" -> ")] = value;
        return result;
      }
    } else {
      const fieldResult: Record<string, any> = {};
      keys.forEach((key) => {
        const value = obj[key];
        const thisFieldName = [...fieldNames, key];
        if (typeof value === "object" && !Array.isArray(value)) {
          result = { ...result, ...helper(value, fieldResult, thisFieldName) };
        } else {
          result[thisFieldName.join(" -> ")] = value;
        }
      });
      return result;
    }
  }

  const initialResult: Record<string, any> = {};
  return helper(data, initialResult, fieldName);
}

function specialCaseDeNesting(obj: Record<string, any>): any[] | null {
  // If obj contains only single key: value pairs and an array. Return the array. Else return null
  if (typeof obj !== "object") return null;
  const keys = Object.keys(obj);
  if (keys.length !== 1) {
    return null;
  }
  const value = obj[keys[0]];
  if (Array.isArray(value)) {
    return value;
  } else {
    return specialCaseDeNesting(value);
  }
}
