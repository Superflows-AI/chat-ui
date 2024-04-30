import tablemark from "tablemark";
import { validate } from "uuid";
import { MutableRefObject } from "react";

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

export function convertToMarkdownTable(
  data: Record<string, any> | any[],
  caption?: string,
): string {
  /** Converts data (either a function's output or confirmation data) to a Markdown table **/

  data = removeUUIDs(data);

  let output = "";
  if (caption) {
    output += `### ${caption}\n\n`;
  }
  // Format: {data: {...interestingData}}
  if (
    !Array.isArray(data) &&
    Object.keys(data).length === 1 &&
    typeof data[Object.keys(data)[0]] === "object"
  ) {
    if (!caption) {
      // Make the first key the caption
      output += `### ${functionNameToDisplay(Object.keys(data)[0] ?? "")}\n\n`;
    }
    data = data[Object.keys(data)[0]];
  }

  // Do this here so we get the correct caption
  data = processObjectForDisplay(data);

  if (Array.isArray(data)) {
    // Assume all elements have the same type
    if (typeof (data as any[])[0] !== "object") {
      if (data.length < 7) {
        // And did those feet in ancient time,
        return (
          output +
          ("|" +
            data.map(() => "   ").join("|") +
            "|\n|" +
            data.map(() => "---").join("|") +
            "|\n| " +
            data.join(" | ") +
            " |\n")
        );
      } else {
        // Walk upon England's mountains green?
        return output + "|   |\n|---|\n| " + data.join(" |\n| ") + " |\n";
      }
    }
    // Otherwise, we have an array of arrays/objects
    let columns: { name?: string; align: "center" }[];
    if (Array.isArray((data as any[])[0])) {
      data = data.map((item: any) => {
        // Format: [[{a,b,c,d}, {a,b,c,d}], [{a,b,c,d}, {a,b,c,d}]]
        return item.map((subItem: any) => {
          // .slice() cuts out the starting and end [] or {}
          if (typeof subItem === "object") return stringify(subItem);
          else return subItem;
        });
      });
      columns = (data as any[])[0].map(() => ({ align: "center" }));
    } else {
      // Array of objects
      data = data.map((item: any) => {
        // Format: [{a,b,c,d}, {a,b,c,d}, {a,b,c,d}, {a,b,c,d}]
        Object.entries(item).forEach(([key, value]: any) => {
          // Deal with nested objects: [{a,b:{c,d}}, {a,b:{c,d}}]
          if (typeof value === "object" && !Array.isArray(value)) {
            Object.entries(value).forEach(([subKey, subValue]: any) => {
              if (typeof subValue === "object") {
                item[`${key}: ${subKey}`] = stringify(subValue);
              } else {
                item[`${key}: ${functionNameToDisplay(subKey ?? "")}`] =
                  subValue;
              }
            });
            delete item[key];
          } else if (Array.isArray(value)) {
            item[key] = stringify(value);
          } else if (typeof value === "string") {
            item[key] = value.trim().replaceAll("\n", "&#10;");
          } else if (typeof value === "number") {
            item[key] = value.toLocaleString(navigator?.language ?? "en-US");
          } else item[key] = value;
        });
        return item;
      });
      columns = Object.keys((data as object[])[0]).map((n) => ({
        name: functionNameToDisplay(n),
        align: "center",
      }));
    }
    // And was the holy Lamb of God,
    return output + tablemark(data as any[], { columns });
  } else {
    // If the data is empty, just return the caption with a blank table so it formats nicely
    if (Object.keys(data).length === 0) {
      return output + "\n|    |\n|----|\n";
    }
    // Format: {a, b}
    output += tablemark(
      Object.entries(data).map(([key, value]) => {
        return {
          Name: key,
          Value:
            typeof value === "object"
              ? stringify(value)
              : typeof value === "string"
              ? value.trim().replaceAll("\n", "&#10;")
              : value,
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

export function processObjectForDisplay(
  data: Record<string, any> | any[],
  fieldName: string[] = [],
): Record<string, any> | any[] {
  /**
   * Processes an arbitrary object for display in a table
   * Returns a flattened form of the object, with nested keys separated by " -> "
   * also recursively replaces nodes with a single key with the value of the node
   *  (e.g. {key: [1,2,3,4]} becomes [1,2,3,4])
   */

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
      if (typeof item === "object" && Object.keys(item).length > 1) {
        result.push(processObjectForDisplay(item, fieldName));
      } else {
        result.push(item);
      }
    });
    return result;
  }

  function helper(
    obj: Record<string, any>,
    result: Record<string, any>,
    fieldNames: string[],
  ): Record<string, any> {
    if (typeof obj !== "object" || !obj) {
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
  /** If obj contains only single key: value pairs and an array.
   * Return the array.
   * Else return null
   */
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

export function addTrailingSlash(string: string): string {
  return string.endsWith("/") ? string : string + "/";
}

export function scrollToBottom(
  scrollRef: MutableRefObject<HTMLDivElement>,
  behavior: "smooth" | "instant" | "auto" = "auto",
  force: boolean = false,
  threshold: number = 150,
): void {
  if (scrollRef && scrollRef?.current) {
    const ele = scrollRef.current;
    // If the element exists, and it's near the bottom (or force=true), scroll to the bottom
    if (
      ele &&
      (ele.scrollHeight - ele.scrollTop - ele.offsetHeight <= threshold ||
        force)
    ) {
      ele.scrollTo({ top: ele.scrollHeight, behavior });
    }
  }
}

export function getRandomThree<Item>(array: Item[]): Item[] {
  if (array.length <= 3) return array;
  const result: Item[] = [];

  while (result.length < 3) {
    const random = Math.floor(Math.random() * array.length); //get random index
    if (result.indexOf(array[random]) === -1) {
      //check if item is already in result
      result.push(array[random]); //if not, add it
    }
  }

  return result;
}
