export function classNames(
  ...classes: (string | undefined | null | boolean)[]
): string {
  return classes.filter(Boolean).join(" ");
}

export function parseKeyValues(
  keyValueText: string,
): { key: string; value: string }[] {
  console.log("Parsing key values from", keyValueText);
  return keyValueText.split("<br/>").map((line) => {
    const [key, ...value] = line.split(":");
    return { key: key.trim(), value: value.join(":").trim() };
  });
}

export function convertToRenderable(
  functionOutput: Record<string, any> | any[],
): string {
  let output = "";
  if (Array.isArray(functionOutput)) {
    if (
      typeof functionOutput[0] === "object" &&
      !Array.isArray(functionOutput[0])
    ) {
      // Format: [{a,b}, {a,b}]
      functionOutput.forEach((item) => {
        output += "<table>";
        Object.entries(item).forEach(([key, value]) => {
          output += `${camelToCapitalizedWords(key)}: ${
            typeof value === "object" ? JSON.stringify(value) : value
          }<br/>`;
        });
        output += "</table>";
      });
    } else {
      // Format: [x, y, z]
      output += "<table>";
      functionOutput.forEach((val) => {
        output += `Value: ${camelToCapitalizedWords(val)}<br/>`;
      });
      output += "</table>";
    }
  } else {
    // Format: {data: {a, b}}
    if ("data" in functionOutput) {
      functionOutput = functionOutput.data;
    }
    // Format: {a, b}
    output += "<table>";
    Object.entries(functionOutput).forEach(([key, value]) => {
      output += `${camelToCapitalizedWords(key)}: ${
        typeof value === "object" ? JSON.stringify(value) : value
      }<br/>`;
    });
    output += "</table>";
  }
  return output;
}

export function camelToCapitalizedWords(camelCaseStr: string): string {
  return camelCaseStr
    .replace(/([A-Z])/g, " $1") // Add a space before each uppercase letter
    .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
}
