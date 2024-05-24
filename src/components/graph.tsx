import * as React from "react";
import {
  LineChart,
  Label,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  BarChart,
  CartesianGrid,
  Tooltip,
  Bar,
} from "recharts";

import { DateTime } from "luxon";
import { GraphData, Json, SupportedGraphTypes } from "../lib/types";

// Here due to issues with importing from ./utils in tests
function classNames(
  ...classes: (string | undefined | null | boolean)[]
): string {
  return classes.filter(Boolean).join(" ");
}

const formats = [
  "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  "yyyy-MM-dd'T'HH:mm:ss.SSS",
  "yyyy-MM-dd'T'HH:mm:ss'Z'",
  "yyyy-MM-dd'T'HH:mm:ss",
  "yyyy-MM-dd'T'HH:mm",
  "yyyy-MM-dd'T'HH",
  "yyyy-MM-dd",
  "yyyy/MM/dd'T'HH:mm:ss.SSS'Z'",
  "yyyy/MM/dd'T'HH:mm:ss.SSS",
  "yyyy/MM/dd'T'HH:mm:ss",
  "yyyy/MM/dd'T'HH:mm",
  "yyyy/MM/dd'T'HH",
  "yyyy/MM/dd",
  "yyyy.MM.dd'T'HH:mm:ss.SSS'Z'",
  "yyyy.MM.dd'T'HH:mm:ss.SSS",
  "yyyy.MM.dd'T'HH:mm:ss",
  "yyyy.MM.dd'T'HH:mm",
  "yyyy.MM.dd'T'HH",
  "yyyy.MM.dd",
  "yyyyMMdd'T'HHmmss.SSS'Z'",
  "yyyyMMdd'T'HHmmss.SSS",
  "yyyyMMdd'T'HHmmss",
  "yyyyMMdd'T'HHmm",
  "yyyyMMdd'T'HH",
  "yyyyMMdd",
  "MM-dd-yyyy",
  "dd.MM.yyyy",
  "MM/dd/yyyy",
  "dd/MM/yyyy",
  "h:mm a", // 1:30 PM
];

const formatsToSkip = ["HH:mm:ss.SSS", "HH:mm:ss", "HH:mm"];

function attemptDatetimeConversion(array: any[]): number[] | null {
  if (typeof array[0] !== "string") return null;

  let matchingFormat = null;

  if (
    formatsToSkip
      .map((format) => {
        const dt = DateTime.fromFormat(array[0], format);
        if (dt.isValid) return format;
        return null;
      })
      .filter(Boolean).length > 0
  ) {
    return null;
  }

  for (const format of formats) {
    const dt = DateTime.fromFormat(array[0], format);
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

const secondsToDay = 60 * 60 * 24;

export function Graph(props: GraphData & { small: boolean }) {
  if (props.data.length === 0) return <></>;
  const xIsNumber = typeof props.data[0].x === "number";

  let xRange: number;
  let offset: number;
  const graphData = formatGraphData(props);
  const data = [...graphData.data];

  if (xIsNumber) {
    xRange =
      Math.max(...props.data.map((obj) => obj.x as number)) -
      Math.min(...props.data.map((obj) => obj.x as number));
    offset = Math.floor(xRange * 0.1);
  }
  const nonXYLabels: string[] = [];
  for (const key of Object.keys(props.data[0])) {
    if (key !== "x" && key !== "y") {
      nonXYLabels.push(key);
    }
  }
  const yLabel = props.yLabel || "";
  const yUnitReg = /\((.*)\)$/.exec(yLabel);
  const yUnit = yUnitReg ? yUnitReg[1] : undefined;

  if (props.type === "value") {
    const value = formatValue(props.data[0].y);
    const valueWithUnits = includeUnits(value, yUnit);
    return (
      <div
        className={
          "sf-w-full sf-flex sf-flex-col sf-place-items-center sf-justify-center"
        }
      >
        <div
          className={
            "sf-px-2 sf-py-7 sf-my-2 sf-rounded-lg sf-border-2 sf-border-gray-500 sf-bg-white"
          }
        >
          <div className="sf-flex sf-flex-row">
            <div className="sf-text-center sf-text-gray-950 sf-font-medium sf-text-4xl sf-mb">
              {valueWithUnits}
            </div>
          </div>
        </div>
      </div>
    );
  }
  const tickFontSize = props.small ? 10 : 12;
  const labelFontSize = props.small ? 12 : 15;

  return (
    <ResponsiveContainer
      width={props.small ? "95%" : "80%"}
      aspect={2}
      className={classNames(
        "sf-mx-auto sf-mt-2",
        props.small ? "sf-mb-1.5" : "sf-mb-3",
      )}
    >
      {props.type === "bar" ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: tickFontSize }}
            label={
              props.xLabel
                ? {
                    value: props.xLabel,
                    fontSize: labelFontSize,
                    dy: 10,
                  }
                : {}
            }
          />
          <YAxis
            dataKey="y"
            label={{
              value: yLabel,
              angle: yLabel.length > 5 ? -90 : 0,
              fontSize: labelFontSize,
              position: "insideLeft",
              dy: yLabel.length * 3,
              dx: -4,
            }}
            tick={{ fontSize: tickFontSize }}
          />
          <Tooltip
            content={(vals) => {
              const payload =
                vals.payload.length > 0 ? vals.payload[0].payload : {};
              const value = formatValue(payload.y);
              const valueWithUnits = includeUnits(value, yUnit);
              const splitYLabel = yLabel.split("(");
              return (
                <div
                  className={classNames(
                    "sf-bg-white sf-border sf-flex sf-flex-col",
                    props.small ? "sf-text-xs sf-p-2" : "sf-text-sm sf-p-3",
                  )}
                >
                  <h3 className="sf-font-medium">{payload.x}</h3>
                  <div className="sf-flex sf-flex-row sf-gap-x-1">
                    {splitYLabel[0]
                      ? splitYLabel[0].replaceAll("_", " ").trim()
                      : splitYLabel[0].trim()}
                    :
                    <div className="sf-text-center sf-text-[#0369a1]">
                      {valueWithUnits}
                    </div>
                  </div>
                  {nonXYLabels.map((label) => (
                    <div
                      key={label}
                      className="sf-flex sf-flex-row sf-gap-x-1 sf-text-gray-500"
                    >
                      {capitaliseFirstLetter(
                        label ? label.replaceAll("_", " ") : label,
                      )}
                      : {payload[label]}
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <title>{props.graphTitle}</title>
          <Bar dataKey="y" fill="#0369a1" />
        </BarChart>
      ) : (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="x"
            tick={{ fontSize: tickFontSize }}
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
                    DateTime.fromSeconds(x * secondsToDay).toLocaleString(
                      xRange < 1 / 24
                        ? DateTime.TIME_24_WITH_SECONDS
                        : xRange < 1
                        ? DateTime.TIME_24_SIMPLE
                        : DateTime.DATE_SHORT,
                    )
                : undefined
            }
          >
            <Label
              value={props.xLabel || ""}
              offset={-2}
              style={{ fontSize: labelFontSize }}
              position="insideBottom"
            />
          </XAxis>
          <Tooltip
            content={(vals) => {
              const payload =
                vals.payload.length > 0 ? vals.payload[0].payload : {};
              const value = formatValue(payload.y);
              const valueWithUnits = includeUnits(value, yUnit);
              const splitYLabel = yLabel.split("(");
              return (
                <div
                  className={classNames(
                    "sf-bg-white sf-border sf-flex sf-flex-col",
                    props.small ? "sf-text-sm sf-p-2" : "sf-text-base sf-p-3",
                  )}
                >
                  <h3 className="sf-font-medium">{payload.x}</h3>
                  <div className="sf-flex sf-flex-row sf-gap-x-1">
                    {splitYLabel[0]
                      ? splitYLabel[0].replaceAll("_", " ").trim()
                      : splitYLabel[0].trim()}
                    :
                    <div className="sf-text-center sf-text-[#0369a1]">
                      {valueWithUnits}
                    </div>
                  </div>
                  {nonXYLabels.map((label) => (
                    <div
                      key={label}
                      className="sf-flex sf-flex-row sf-gap-x-1 sf-text-gray-500"
                    >
                      {capitaliseFirstLetter(
                        label ? label.replaceAll("_", " ") : label,
                      )}
                      : {payload[label]}
                    </div>
                  ))}
                </div>
              );
            }}
          />
          <YAxis allowDecimals={false} tick={{ fontSize: tickFontSize }}>
            <Label
              value={yLabel}
              angle={-90}
              style={{ textAnchor: "middle", fontSize: labelFontSize }}
              position="insideLeft"
            />
          </YAxis>
          <title>{props.graphTitle}</title>
          <Line dataKey="y" />
        </LineChart>
      )}
    </ResponsiveContainer>
  );
}

function capitaliseFirstLetter(str: string | undefined) {
  if (str === undefined) return undefined;
  return str.charAt(0).toUpperCase() + str.slice(1);
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

function formatGraphData(graphData: GraphData): GraphData {
  if (graphData.type === "value") {
    return graphData;
  }
  if (typeof graphData.data[0].x === "number") {
    return {
      ...graphData,
      data: graphData.data.sort((a, b) => (a.x as number) - (b.x as number)),
    };
  } else if (typeof graphData.data[0].x === "string") {
    const dates = attemptDatetimeConversion(graphData.data.map((obj) => obj.x));
    if (dates) {
      const xRange = Math.max(...dates) - Math.min(...dates);
      return {
        ...graphData,
        data: graphData.data
          .map((obj, index) => ({
            ...obj,
            x: dates[index],
          }))
          .sort((a, b) => a.x - b.x)
          .map((obj) => ({
            ...obj,
            x: DateTime.fromSeconds(obj.x).toLocaleString(
              xRange < 1 / 24
                ? DateTime.TIME_24_WITH_SECONDS
                : xRange < 1
                ? DateTime.TIME_24_SIMPLE
                : DateTime.DATE_SHORT,
            ),
          })),
        xIsdate: true,
      };
    }
  }
  return graphData;
}

export function extractGraphData(
  data: Json,
  type: SupportedGraphTypes,
): GraphData | null {
  const { result: array, arrayKey } = findFirstArray(data);

  if (array === null) {
    console.log(`no array found in data: ${data}`);
    return null;
  }
  if (typeof array[0] === "number")
    return {
      type,
      data: array.map((value, index) => ({ x: index, y: value })),
      graphTitle: arrayKey,
    };

  if (
    typeof array[0] === "string" &&
    // We can graph if every value in the array is a stringified number
    array.every((val) => !isNaN(Number(val)))
  )
    return {
      type,
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
          attemptDatetimeConversion(array.map((obj) => obj[key])) !== null,
      )
      .filter((key) => array.every((obj) => key in obj));

    const yMatches = Object.keys(array[0])
      .filter((key) => checkStringMatch(key, possibleYlabels))
      .filter((key) => array.every((obj) => key in obj));

    if (xMatches.length === 0 && yMatches.length === 0) {
      console.log(
        `no x or y matches found in array keys ${Object.keys(array[0])}`,
      );
      return null;
    }

    if (yMatches.length > 0 && xMatches.length === 0) {
      const yLabel = yMatches[0];
      return {
        type,
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
        array.map((obj) => obj[xLabel]),
      );

      const x = dateParseRes ?? array.map((obj) => obj[xLabel]);
      const data = [];
      for (let i = 0; i < x.length; i++) {
        data.push({
          x: dateParseRes ? x[i] / secondsToDay : x[i],
          y: array[i][yLabel],
        });
      }

      return {
        type,
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
  key: string | number | null = null,
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
  possibleLabels: string[],
): boolean {
  // Match insensitive to punctuation, spaces, case and trailing s
  const processStr = (str: string) => {
    const processed = str.toLowerCase().replace(/[\W\s]/g, "");
    return processed.endsWith("s") ? processed.slice(0, -1) : processed;
  };

  return possibleLabels.some((y) => processStr(fieldName) === processStr(y));
}

function formatValue(value: number | string): string {
  if (typeof value === "number") {
    if (Math.abs(value) >= 1000) {
      return numberWithCommas(Math.round(value));
    } else if (Math.abs(value) > 0.1) {
      return (Math.round(value * 100) / 100).toString();
    } else if (Math.abs(value) > 0) {
      return value.toExponential(2);
    } else {
      return "0";
    }
  }
  return value;
}

function numberWithCommas(x: number): string {
  /** Converts a number to a string containing commas */
  const parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function includeUnits(value: string, unit: string | undefined): string {
  if (!unit || value === undefined || value == null) return value;
  if (unit in mapCurrencyNameToSymbol) {
    unit = mapCurrencyNameToSymbol[unit];
  }
  value = value.toString();
  if (["£", "$", "€"].includes(unit)) {
    const isNeg = value.startsWith("-");
    if (isNeg) {
      return `-${unit}${value.slice(1)}`;
    }
    return `${unit}${value}`;
  }
  return `${value}${unit}`;
}

const mapCurrencyNameToSymbol: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};
