import * as React from "react";
import {
  LineChart,
  Label,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export interface GraphData {
  data: { x: number | string; y: number }[];
  xLabel?: string;
  yLabel?: string;
  graphTitle?: string | number;
}

export function Graph(props: GraphData) {
  // Title currently does nothing in recharts, though there's an open
  // ticket for it
  return (
    <ResponsiveContainer width="80%" aspect={2} className="sf-mx-auto sf-mt-2">
      <LineChart data={props.data}>
        <XAxis dataKey="x">
          <Label
            value={props.xLabel || ""}
            offset={-5}
            position="insideBottom"
          />
        </XAxis>
        <YAxis allowDecimals={false}>
          <Label
            value={props.yLabel || ""}
            angle={-90}
            style={{ textAnchor: "middle" }}
            position="insideLeft"
          />
        </YAxis>
        <title>{props.graphTitle}</title>
        <Line dataKey="y" />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const possibleXlabels = [
  "Time",
  "Date",
  "Event",
  "Product",
  "Category",
  "Grades",
  "Days",
  "Months",
  "Hours",
  "Teams",
  "State",
  "City",
  "Country",
  "Models",
  "Versions",
  "Classes",
  "Years",
  "Quarters",
  "Genre",
  "Groups",
  "Label",
];

export const possibleYlabels = [
  "Value",
  "Price",
  "Weight",
  "Size",
  "Length",
  "Width",
  "Height",
  "Distance",
  "Quantity",
  "Score",
  "Population",
  "Revenue",
  "Sales",
  "GDP",
  "Exposure",
  "Temperature",
  "Speed",
  "Frequency",
  "numberOfCustomers",
  "Density",
  "UnitsSold",
  "Satisfaction",
];

export function extractGraphData(data: string): GraphData | null {
  try {
    data = JSON.parse(data);
  } catch {
    console.log(`Could not parse data: ${data} as json`);
    return null;
  }

  const { result: array, arrayKey } = findFirstArray(data);

  if (array === null) {
    console.log(`no array found in data: ${data}`);
    return null;
  }
  if (typeof array[0] === "number")
    return {
      data: array.map((value, index) => ({ x: index, y: value })),
      graphTitle: arrayKey,
    };

  if (
    typeof array[0] === "string" &&
    // We can graph if every value in the array is a stringified number
    array.every((val) => !isNaN(Number(val)))
  )
    return {
      data: array.map((value, index) => ({ x: index, y: Number(value) })),
      graphTitle: arrayKey,
    };

  // TODO: Currently don't support arrays of arrays
  if (typeof array[0] === "object" && !(array[0] instanceof Array)) {
    // Fields that match the possible x labels and are in every object in the array
    const xMatches = Object.keys(array[0])
      .filter((key) => checkStringMatch(key, possibleXlabels))
      .filter((key) => array.every((obj) => key in obj));

    const yMatches = Object.keys(array[0])
      .filter((key) => checkStringMatch(key, possibleYlabels))
      .filter((key) => array.every((obj) => key in obj));

    if (xMatches.length === 0 && yMatches.length === 0) {
      console.log(
        `no x or y matches found in array keys ${Object.keys(array[0])}`
      );
      return null;
    }

    if (yMatches.length > 0 && xMatches.length === 0) {
      const yLabel = yMatches[0];
      return {
        data: array.map((obj, index) => ({
          x: index,
          y: obj[yLabel],
        })),
        yLabel,
        graphTitle: arrayKey,
      };
    } else if (xMatches.length > 0 && yMatches.length > 0) {
      const xLabel = xMatches[0];
      const yLabel = yMatches[0];
      return {
        data: array.map((obj) => ({
          x: obj[xLabel],
          y: obj[yLabel],
        })),
        xLabel,
        yLabel,
        graphTitle: arrayKey,
      };
    }
  }

  return null;
}

export function findFirstArray(
  json: any,
  key: string | number | null = null
): { result: any[] | null; arrayKey: string | number | null } {
  /**
   * Recursively search through the object's properties for an array.
   * Return first array found (which will be at the highest level) of nesting
   **/
  // check if the input is an object or array
  if (typeof json === "object" && json !== null) {
    // if the input is an array, return it
    if (Array.isArray(json)) {
      return { result: json, arrayKey: key };
    }
    // otherwise, recursively search through the object's properties
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        const { result } = findFirstArray(json[key], key);
        // if this property is an array, or contains an array, return it
        if (result) {
          return { result, arrayKey: key };
        }
      }
    }
  }
  // no array found
  return { result: null, arrayKey: key };
}
export function checkStringMatch(
  fieldName: string,
  possibleLabels: string[]
): boolean {
  // Match insensitive to punctuation, spaces, case and trailing s
  const processStr = (str: string) => {
    let processed = str.toLowerCase().replace(/[\W\s]/g, "");
    return processed.endsWith("s") ? processed.slice(0, -1) : processed;
  };

  return possibleLabels.some((y) => processStr(fieldName) === processStr(y));
}
