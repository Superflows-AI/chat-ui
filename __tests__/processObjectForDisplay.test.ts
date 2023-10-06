import { describe, expect, it } from "@jest/globals";
import { processObjectForDisplay } from "../src/lib/utils";

describe("remove single key nodes", () => {
  it("Handles empty object", () => {
    const data = {};
    const expected = {};

    expect(processObjectForDisplay(data)).toEqual(expected);
  });

  it("array returns same array", () => {
    const data = [1, 2, 3];
    const expected = [1, 2, 3];

    const output = processObjectForDisplay(data);
    expect(output).toEqual(expected);
  });

  it("special case single array", () => {
    const data = { oldGregg: [1, 2, 3] };
    const expected = [1, 2, 3];
    const output = processObjectForDisplay(data);
    expect(output).toEqual(expected);
  });
  it("nested special case", () => {
    const data = { root: { branch: { leaf: [1, 2, 3] } } };
    const expected = [1, 2, 3];

    expect(processObjectForDisplay(data)).toEqual(expected);
  });
  it("more complex nested special case", () => {
    const data = {
      a: {
        b: [
          { nice: 1, nested: { boy: 2 } },
          { nice: 2, nested: { boy: 3 } },
        ],
      },
    };

    const expected = [
      { nice: 1, nested: { boy: 2 } },
      { nice: 2, nested: { boy: 3 } },
    ];

    const output = processObjectForDisplay(data);
    expect(output).toEqual(expected);
  });

  it("array of objects", () => {
    const data = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
    ];
    const output = processObjectForDisplay(data);
    expect(output).toEqual(data);
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
      "umbrella -> responses -> data": [1, 2, 3],
      "umbrella -> theHitcher": "put you in the picture",
      "umbrella -> tony -> harrison": "outrage",
    };
    const output = processObjectForDisplay(data);
    expect(output).toEqual(expected);
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
      "outer -> middle -> inner": "value",
      "outer -> middle2": "value2",
    };

    expect(processObjectForDisplay(data)).toEqual(expected);
  });

  it("Does not lose data for deeply nested structures", () => {
    const data = {
      first: {
        second: {
          third: {
            fourth: { fifth: "minor fall, major lift" },
          },
          other: "value2",
        },
        third: {
          fifth: [
            "i",
            "remember",
            "you",
            "well",
            "in",
            "the",
            "chelsea",
            "hotel",
          ],
        },
      },
    };

    const expected = {
      "first -> second -> third -> fourth -> fifth": "minor fall, major lift",
      "first -> second -> other": "value2",
      "first -> third -> fifth": [
        "i",
        "remember",
        "you",
        "well",
        "in",
        "the",
        "chelsea",
        "hotel",
      ],
    };

    expect(processObjectForDisplay(data)).toEqual(expected);
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

    const result = processObjectForDisplay(data);
    expect(data).toEqual(originalData);
    expect(result).not.toBe(data);
  });

  it("Array of single key not changed", () => {
    const data = [
      { make: "Alfa Romeo" },
      { make: "Ferrari" },
      { make: "Dodge" },
      { make: "Subaru" },
      { make: "Toyota" },
      { make: "Volkswagen" },
      { make: "Volvo" },
      { make: "Audi" },
    ];

    const result = processObjectForDisplay(data);
    expect(result).toEqual(data);
  });
});
