import * as React from "react";
import {
  ComposedChart,
  LineChart,
  Label,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { classNames } from "../lib/utils";

export interface GraphData {
  data: { x: number | string; y: number }[];
  xLabel?: string;
  yLabel?: string;
}

export function Graph(props: GraphData) {
  return (
    <ResponsiveContainer width="80%" aspect={2} className="sf-mx-auto sf-mt-2">
      <LineChart data={props.data}>
        <XAxis dataKey="x" />
        <YAxis allowDecimals={false}>
          <Label
            value={"lovely label"}
            angle={-90}
            style={{ textAnchor: "middle" }}
            position="insideLeft"
            // offset={-5}
          />
        </YAxis>
        <Line dataKey="y" />
      </LineChart>
    </ResponsiveContainer>
  );
}

const possibleXlabels = [
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

const possibleYlabels = [
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
  "Density",
  "UnitsSold",
  "Satisfaction",
];

export function extractGraphData(data: string): GraphData | null {
  console.log("extracting graph data", data);
  try {
    data = JSON.parse(data);
  } catch {
    console.log("this be null");
    return null;
  }

  const array = findFirstArray(data);
  if (array === null) return null;
  if (typeof array[0] === "number")
    return { data: array.map((value, index) => ({ x: index, y: value })) };

  if (
    typeof array[0] === "string" &&
    array.every((val) => /^[0-9]+$/.test(val))
  )
    return {
      data: array.map((value, index) => ({ x: index, y: Number(value) })),
    };

  if (typeof array[0] === "object") {
    // Fields that match the possible x labels and are in every object in the array
    const xMatches = Object.keys(array[0])
      .filter((key) => checkStringMatch(key, possibleXlabels))
      .filter((key) => array.every((obj) => key in obj));

    const yMatches = Object.keys(array[0])
      .filter((key) => checkStringMatch(key, possibleYlabels))
      .filter((key) => array.every((obj) => key in obj));

    if (xMatches.length === 0 || yMatches.length === 0) return null;

    if (yMatches.length > 0 && xMatches.length === 0) {
      const yLabel = yMatches[0];
      return {
        data: array.map((obj, index) => ({
          x: index,
          y: obj[yLabel],
        })),
        yLabel,
      };
    } else {
      const xLabel = xMatches[0];
      const yLabel = yMatches[0];
      return {
        data: array.map((obj) => ({
          x: obj[xLabel],
          y: obj[yLabel],
        })),
        xLabel,
        yLabel,
      };
    }
  }

  return null;
}

export function findFirstArray(json: any): any[] | null {
  /**
   * Recursively search through the object's properties for an array.
   * Return first array found (which will be at the highest level) of nesting
   **/
  // check if the input is an object or array
  if (typeof json === "object" && json !== null) {
    // if the input is an array, return it
    if (Array.isArray(json)) {
      return json;
    }
    // otherwise, recursively search through the object's properties
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        const result = findFirstArray(json[key]);
        // if this property is an array, or contains an array, return it
        if (result) {
          return result;
        }
      }
    }
  }
  // no array found
  return null;
}
export function checkStringMatch(
  fieldName: string,
  possibleLabels: string[],
): boolean {
  // Match insensitive to punctuation, spaces, case and trailing s
  const processStr = (str: string) => {
    let processed = str.toLowerCase().replace(/[\W\s]/g, "");
    return processed.endsWith("s") ? processed.slice(0, -1) : processed;
  };

  return possibleLabels.some((y) => processStr(fieldName) === processStr(y));
}
