import { describe, expect, it } from "@jest/globals";
import { checkStringMatch } from "../src/components/graph";

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
