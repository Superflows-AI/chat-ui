import { describe, expect, it } from "@jest/globals";
import { removeSingleKeyNodes } from "../src/lib/utils";

describe("remove single key nodes", () => {
  it("Handles empty object", () => {
    const data = {};
    const expected = {};

    expect(removeSingleKeyNodes(data)).toEqual(expected);
  });

  it("array returns same array", () => {
    const data = [1, 2, 3];
    const expected = [1, 2, 3];

    const output = removeSingleKeyNodes(data);
    expect(output).toEqual(expected);
  });

  it("single node key nested inside complex object", () => {
    const data = {
      umbrella: {
        responses: { data: [1, 2, 3] },
        theHitcher: "put you in the picture",
        tony: { harrison: "outrage" },
      },
    };

    const expected = {
      data: [1, 2, 3],
      theHitcher: "put you in the picture",
      harrison: "outrage",
    };
    const output = removeSingleKeyNodes(data);
    expect(output).toEqual(expected);
  });

  it("Handles nested single key arrays", () => {
    const data = { root: { branch: { leaf: [1, 2, 3] } } };
    const expected = { leaf: [1, 2, 3] };

    expect(removeSingleKeyNodes(data)).toEqual(expected);
  });

  it("Does not lose data for multiple nested single key", () => {
    const data = {
      outer: {
        middle: {
          inner: "value",
        },
        middle2: "value2",
      },
    };

    const expected = {
      inner: "value",
      middle2: "value2",
    };

    expect(removeSingleKeyNodes(data)).toEqual(expected);
  });

  it("Does not lose data for deeply nested structures", () => {
    const data = {
      first: {
        second: {
          third: {
            fourth: "value",
          },
          other: "value2",
        },
        third: {
          fifth: "value3",
        },
      },
    };

    const expected = {
      fourth: "value",
      other: "value2",
      fifth: "value3",
    };

    expect(removeSingleKeyNodes(data)).toEqual(expected);
  });

  it("doesnt mutate original data", () => {
    const data = {
      first: {
        second: {
          third: {
            fourth: "value",
          },
          other: "value2",
        },
        third: {
          fifth: "value3",
        },
      },
    };

    const originalData = JSON.parse(JSON.stringify(data));

    const result = removeSingleKeyNodes(data);
    expect(data).toEqual(originalData);
    expect(result).not.toBe(data);
  });
});
