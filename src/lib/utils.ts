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

export function parseTableTags(text: string): { key: string; value: string }[] {
  const captionRegex = /<caption>(.*?)<\/caption>/;
  const caption = {
    key: "caption",
    value: text.match(captionRegex)?.[1] ?? "",
  };
  text = text.replace(captionRegex, "");

  const rows = text.split("<br/>").map((line) => {
    const [key, ...value] = line.split(":");
    return { key: key.trim(), value: value.join(":").trim() };
  });
  return [caption, ...rows];
}

export function convertToRenderable(
  functionOutput: Record<string, any> | any[],
  caption?: string
): string {
  let output = "<table>";
  if (caption) {
    output += `<caption>${caption}</caption>`;
  }
  if (Array.isArray(functionOutput)) {
    if (
      typeof functionOutput[0] === "object" &&
      !Array.isArray(functionOutput[0])
    ) {
      // Format: [{a,b}, {a,b}]
      functionOutput.forEach((item: Record<string, any>) => {
        Object.entries(item).forEach(([key, value]) => {
          output += `${functionNameToDisplay(key)}: ${
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            typeof value === "object" ? JSON.stringify(value) : value
          }<br/>`;
        });
      });
    } else {
      // Format: [x, y, z]
      functionOutput.forEach((val) => {
        output += `Value: ${functionNameToDisplay(String(val))}<br/>`;
      });
    }
  } else {
    // Format: {data: {a, b}}
    if ("data" in functionOutput) {
      functionOutput = functionOutput.data as Record<string, any>;
    }
    // Format: {a, b}
    Object.entries(functionOutput).forEach(([key, value]) => {
      output += `${functionNameToDisplay(key)}: ${
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        typeof value === "object" ? JSON.stringify(value) : value
      }<br/>`;
    });
    output = output.slice(0, -5);
  }
  output += "</table>";
  return output;
}
