import { describe, expect, it } from "@jest/globals";
import {
  GraphData,
  checkStringMatch,
  extractGraphData,
  findFirstArray,
} from "../src/components/graph";

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
});

describe("findFirstArray", () => {
  it("basic match", () => {
    const data = { x: [1, 2, 3] };
    expect(findFirstArray(data)).toEqual([1, 2, 3]);
  });

  it("data is array", () => {
    const data = [1, 2, 3];
    expect(findFirstArray(data)).toEqual([1, 2, 3]);
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
    };

    expect(findFirstArray(data)).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 4 },
    ]);
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
    };
    expect(findFirstArray(data)).toEqual([200, 300, 400]);
  });
});

describe("extractGraphData", () => {
  it("basic match", () => {
    const data = `{ "numberOfCustomers": [1, 2, 3] }`;
    const expected: GraphData = {
      data: [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
    };
    expect(extractGraphData(data)).toEqual(expected);
  });
  it("match array of objects", () => {
    const data = `{ "numberOfCustomers": [{"date": 1, "value": 2}, {"date": 2, "value": 3}]}`;
    const expected: GraphData = {
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 3 },
      ],
      xLabel: "date",
      yLabel: "value",
    };
    expect(extractGraphData(data)).toEqual(expected);
  });
});
