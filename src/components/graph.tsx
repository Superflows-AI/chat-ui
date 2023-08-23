import * as React from "react";
import {
  LineChart,
  Label,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { DateTime } from "luxon";

let formats = [
  "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm",
  "yyyy-MM-dd'T'HH",
  "yyyy-MM-dd",
  "yyyy/MM/dd'T'HH:mm:ss.SSSZ",
  "yyyy/MM/dd'T'HH:mm:ss.SSS",
  "yyyy/MM/dd'T'HH:mm:ss",
  "yyyy/MM/dd'T'HH:mm",
  "yyyy/MM/dd'T'HH",
  "yyyy/MM/dd",
  "yyyy.MM.dd'T'HH:mm:ss.SSSZ",
  "yyyy.MM.dd'T'HH:mm:ss.SSS",
  "yyyy.MM.dd'T'HH:mm:ss",
  "yyyy.MM.dd'T'HH:mm",
  "yyyy.MM.dd'T'HH",
  "yyyy.MM.dd",
  "yyyyMMdd'T'HHmmss.SSSZ",
  "yyyyMMdd'T'HHmmss.SSS",
  "yyyyMMdd'T'HHmmss",
  "yyyyMMdd'T'HHmm",
  "yyyyMMdd'T'HH",
  "yyyyMMdd",
  "HH:mm:ss.SSS",
  "HH:mm:ss",
  "HH:mm",
  "MM-dd-yyyy",
  "dd.MM.yyyy",
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "h:mm a", // 1:30 PM
];

function attemptDatetimeConversion(array: any[]): number[] | null {
  if (typeof array[0] !== "string") return null;

  let matchingFormat = null;

  for (const format of formats) {
    let dt = DateTime.fromFormat(array[0], format);
    if (dt.isValid) {
      matchingFormat = format;
      break;
    }
  }

  if (DateTime.fromISO(array[0]).isValid) {
    matchingFormat = "ISO";
  }

  if (!matchingFormat) return null;

  const convertedArray = [];

  for (const str of array) {
    const dt =
      matchingFormat === "ISO"
        ? DateTime.fromISO(str)
        : DateTime.fromFormat(str, matchingFormat);

    if (!dt.isValid) {
      return null;
    }
    convertedArray.push(dt.toSeconds());
  }

  return convertedArray;
}

export interface GraphData {
  data: { x: number | string; y: number }[];
  xLabel?: string;
  yLabel?: string;
  graphTitle?: string | number;
  xIsdate?: boolean;
}

const secondsToDay = 60 * 60 * 24;

export function Graph(props: GraphData) {
  // Title currently does nothing in recharts, though there's an open
  // ticket for it

  const xIsNumber = typeof props.data[0].x === "number";

  let xRange: number;
  let offset: number;

  if (xIsNumber) {
    // sort the data by x value
    props.data = props.data.sort((a, b) => (a.x as number) - (b.x as number));

    xRange =
      Math.max(...props.data.map((obj) => obj.x as number)) -
      Math.min(...props.data.map((obj) => obj.x as number));
    offset = Math.ceil(xRange * 0.1);
  }

  return (
    <ResponsiveContainer width="80%" aspect={2} className="sf-mx-auto sf-mt-2">
      <LineChart data={props.data}>
        <XAxis
          dataKey="x"
          tick={{ fontSize: 12 }}
          type={xIsNumber ? "number" : "category"}
          angle={0}
          domain={
            xIsNumber
              ? [`dataMin - ${offset}`, `dataMax + ${offset}`]
              : undefined
          }
          tickFormatter={
            props.xIsdate
              ? (x) =>
                  DateTime.fromSeconds(x * secondsToDay).toFormat(
                    xRange < 1 ? "hh:mm" : xRange < 365 ? "MM-dd" : "yyyy-MM-dd"
                  )
              : undefined
          }
        >
          <Label
            value={props.xLabel || ""}
            offset={-2}
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
    // x matches are either in the possible x labels or can be converted to a date
    const xMatches = Object.keys(array[0])
      .filter(
        (key) =>
          checkStringMatch(key, possibleXlabels) ||
          attemptDatetimeConversion(array.map((obj) => obj[key])) !== null
      )
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

      const dateParseRes = attemptDatetimeConversion(
        array.map((obj) => obj[xLabel])
      );

      const x = dateParseRes ? dateParseRes : array.map((obj) => obj[xLabel]);
      const data = [];
      for (let i = 0; i < x.length; i++) {
        data.push({
          x: x[i] / (dateParseRes ? secondsToDay : 1),
          y: array[i][yLabel],
        });
      }

      return {
        data,
        xLabel,
        yLabel,
        graphTitle: arrayKey,
        xIsdate: dateParseRes !== null,
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
