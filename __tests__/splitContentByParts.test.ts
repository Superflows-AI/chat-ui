import { describe, expect, it } from "@jest/globals";
import { splitContentByParts } from "../src/lib/utils";

describe("splitContentByParts", () => {
  it("Does nothing to simple string", () => {
    const matches = splitContentByParts("Hello world");
    expect(matches).toEqual(["Hello world"]);
  });
  it("Splits on <button>", () => {
    const matches = splitContentByParts("Hello <button>world</button>");
    expect(matches).toEqual(["Hello ", "<button>world</button>"]);
  });
});
