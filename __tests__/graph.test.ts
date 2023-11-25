import { describe, expect, it } from "@jest/globals";
import {
  checkStringMatch,
  extractGraphData,
  findFirstArray,
  possibleYlabels,
} from "../src/components/graph";
import { GraphData } from "../src/lib/types";

describe("checkStringMatch", () => {
  it("basic match", () => {
    const possibleLabels = ["Value", "Genre", "Groups", "Label"];
    expect(checkStringMatch("value", possibleLabels)).toBeTruthy();
  });
  it("match plural", () => {
    const possibleLabels = ["Values", "Genre", "Groups", "Label"];
    expect(checkStringMatch("value", possibleLabels)).toBeTruthy();
  });

  it("match camel", () => {
    const possibleLabels = ["Values", "Genre", "TimeDays", "Label"];
    expect(checkStringMatch("time days", possibleLabels)).toBeTruthy();
  });

  it("no match", () => {
    const possibleLabels = ["Values", "Genre", "TimeDays", "Label"];
    expect(checkStringMatch("puppy", possibleLabels)).toBeFalsy();
  });

  it("match score", () => {
    expect(checkStringMatch("score", possibleYlabels)).toBeTruthy();
  });
});

describe("findFirstArray", () => {
  it("basic match", () => {
    const data = { x: [1, 2, 3] };
    const { result, arrayKey } = findFirstArray(data);
    expect(result).toEqual([1, 2, 3]);
    expect(arrayKey).toEqual("x");
  });

  it("data is array", () => {
    const data = [1, 2, 3];
    const { result, arrayKey } = findFirstArray(data);
    expect(result).toEqual([1, 2, 3]);
    expect(arrayKey).toBeNull();
  });

  it("array of objects", () => {
    const data = {
      x: "1",
      y: 200,
      arr: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
        { x: 3, y: 4 },
      ],
      xisDate: false,
    };

    const { result, arrayKey } = findFirstArray(data);

    expect(result).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 4 },
    ]);
    expect(arrayKey).toEqual("arr");
  });

  it("multiple arrays", () => {
    const data = {
      x: "1",
      y: [200, 300, 400],
      a: {
        arr2: [
          { x: 1, y: 2 },
          { x: 2, y: 3 },
          { x: 3, y: 4 },
        ],
      },
      xisDate: false,
    };
    const { result, arrayKey } = findFirstArray(data);
    expect(result).toEqual([200, 300, 400]);
    expect(arrayKey).toEqual("y");
  });

  it("no arrays", () => {
    const data = {
      April: "is",
      the: "cruelest",
      month: 100,
    };
    const { result, arrayKey } = findFirstArray(data);
    expect(result).toEqual(null);
    expect(arrayKey).toEqual(null);
  });
});

describe("extractGraphData", () => {
  it("basic match", () => {
    const data = { numberOfCustomers: [1, 2, 3] };
    const expected: GraphData = {
      type: "line",
      data: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      graphTitle: "numberOfCustomers",
    };
    expect(extractGraphData(data, "line")).toEqual(expected);
  });
  it("match array of objects", () => {
    const data = {
      numberOfCustomers: [
        { category: 1, value: 2 },
        { category: 2, value: 3 },
      ],
    };
    const expected: GraphData = {
      type: "line",
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      xLabel: "category",
      yLabel: "value",
      graphTitle: "numberOfCustomers",
      xIsdate: false,
    };
    expect(extractGraphData(data, "line")).toEqual(expected);
  });
  it("match array of objects date", () => {
    const data = {
      numberOfCustomers: [
        { date: "2023-08-22", value: 2 },
        { date: "2023-08-23", value: 3 },
      ],
    };
    expect(extractGraphData(data, "line")?.xIsdate).toEqual(true);
    expect(extractGraphData(data, "line")?.data[0].y).toEqual(2);
    expect(extractGraphData(data, "line")?.data[1].y).toEqual(3);

    expect(extractGraphData(data, "line")?.data[0].x).toBeGreaterThan(19590);
    expect(extractGraphData(data, "line")?.data[0].x).toBeLessThan(
      19590 + 365 * 100,
    ); // test will fail in 100 years time
    expect(extractGraphData(data, "line")?.data[1].x).toBeGreaterThan(
      extractGraphData(data, "line")?.data[0].x as number,
    );
  });
  it("no arrays", () => {
    const data = { numberOfCustomers: 100 };
    expect(extractGraphData(data, "line")).toEqual(null);
  });
  it("Only y axis match", () => {
    const data = {
      numberOfCustomers: [
        { snooker: 1, score: 2 },
        { snooker: 2, score: 3 },
      ],
    };
    const expected: GraphData = {
      type: "line",
      data: [
        { x: 0, y: 2 },
        { x: 1, y: 3 },
      ],
      yLabel: "score",
      graphTitle: "numberOfCustomers",
    };
    const res = extractGraphData(data, "line");
    expect(res).toEqual(expected);
  });

  it("No y axis match, but x axis match", () => {
    const data = {
      numberOfCustomers: [
        { date: 1, year: 2 },
        { date: 2, year: 3 },
      ],
    };
    expect(extractGraphData(data, "line")).toEqual(null);
  });
  it("multiple y axis match and x axis match", () => {
    const data = {
      numberOfCustomers: [
        { date: 1, year: 2, score: 100 },
        { date: 2, year: 3, score: 105 },
      ],
    };
    // This might be a bad test because the order of keys in a json is not guaranteed
    const expected: GraphData = {
      type: "line",
      data: [
        { x: 1, y: 100 },
        { x: 2, y: 105 },
      ],
      yLabel: "score",
      xLabel: "date",
      graphTitle: "numberOfCustomers",
      xIsdate: false,
    };

    expect(extractGraphData(data, "line")).toEqual(expected);
  });
});
