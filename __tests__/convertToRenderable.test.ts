import { describe, expect, it } from "@jest/globals";
import { convertToRenderable } from "../src/lib/utils";

describe("convertToRenderable", () => {
  it("should convert short array of numbers to a markdown table", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `|   |   |   |   |   |   |
|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 |
`,
    );
  });
  it("should convert long array of numbers to a markdown table", () => {
    const input = [1, 2, 3, 4, 5, 6, 7];
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `|   |
|---|
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
| 6 |
| 7 |
`,
    );
  });
  it("should convert object with 1 key and value of long array of numbers to a markdown table", () => {
    const input = { whatsthedifferencebetweenmeandyou: [1, 2, 3, 4, 5, 6, 7] };
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `### Whatsthedifferencebetweenmeandyou

|   |
|---|
| 1 |
| 2 |
| 3 |
| 4 |
| 5 |
| 6 |
| 7 |
`,
    );
  });
  it("should convert array of arrays to a markdown table", () => {
    const input = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `|   0   |   1   |   2   |
| :---: | :---: | :---: |
|   1   |   2   |   3   |
|   4   |   5   |   6   |
|   7   |   8   |   9   |
`,
    );
  });
  it("should convert an array of objects to a markdown table", () => {
    const input = [
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 },
    ];
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `|   a   |   b   |   c   |
| :---: | :---: | :---: |
|   1   |   2   |   3   |
|   4   |   5   |   6   |
`,
    );
  });
  it("should convert an array of objects with nested arrays to a markdown table", () => {
    const input = [
      { a: 1, b: 2, c: [1, 2, 3] },
      { a: 4, b: 5, c: [4, 5, 6] },
    ];
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `|   a   |   b   |   c   |
| :---: | :---: | :---: |
|   1   |   2   | 1,2,3 |
|   4   |   5   | 4,5,6 |
`,
    );
  });
  it("should convert an array of objects with nested objects to a markdown table", () => {
    const input = [
      { a: 1, b: 2, c: { fire: 1, sale: 2, aaaa: 3, theburning: 4 } },
      { a: 4, b: 5, c: { fire: 1, sale: 2, aaaa: 3, theburning: 4 } },
    ];
    const output = convertToRenderable(input);
    expect(output)
      .toEqual(`|   a   |   b   | c -> Fire | c -> Sale | c -> Aaaa | c -> Theburning |
| :---: | :---: | :-------: | :-------: | :-------: | :-------------: |
|   1   |   2   |     1     |     2     |     3     |        4        |
|   4   |   5   |     1     |     2     |     3     |        4        |
`);
  });
  it("should convert object with long array of objects into a markdown table", () => {
    const input = {
      responses: [
        {
          score: 5,
          comment: "Very quick and easy to sort out",
          updated_at: "2023-08-02T14:02:18.818Z",
          data_source: "Trustpilot",
          themes: [
            {
              name: "Ease of Use / Navigation",
            },
            {
              name: "Speed of Use / Navigation",
            },
          ],
        },
        {
          score: 1,
          comment:
            "This bank has the worst customer service ever as soon as they open I'm shutting down my accounts,,,\nSHHIIIIITTTTTT SERVICE 45 MINUTES ON HOLD !!!!",
          updated_at: "2023-08-02T14:02:10.108Z",
          data_source: "Trustpilot",
        },
        {
          score: 5,
          comment: "Have been great for when abroad.",
          updated_at: "2023-08-02T14:02:18.945Z",
          data_source: "Trustpilot",
          themes: [
            {
              name: "General",
            },
          ],
        },
      ],
    };
    const out = convertToRenderable(input);
    expect(out).toEqual(`### Responses

| Score |                                                                        Comment                                                                         |        Updated At        | Data Source |                              Themes                              |
| :---: | :----------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------: | :---------: | :--------------------------------------------------------------: |
|   5   |                                                            Very quick and easy to sort out                                                             | 2023-08-02T14:02:18.818Z | Trustpilot  | {name:Ease of Use / Navigation},{name:Speed of Use / Navigation} |
|   1   | This bank has the worst customer service ever as soon as they open I'm shutting down my accounts,,,&#10;SHHIIIIITTTTTT SERVICE 45 MINUTES ON HOLD !!!! | 2023-08-02T14:02:10.108Z | Trustpilot  |                                                                  |
|   5   |                                                            Have been great for when abroad.                                                            | 2023-08-02T14:02:18.945Z | Trustpilot  |                          {name:General}                          |
`);
  });
  it("should convert simple object to a markdown table", () => {
    const input = {
      if: "you can keep your head",
      when: "all about you are losing theirs",
      and: "blaming it on you",
    };
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `| Name  | Value                           |
| :---- | :------------------------------ |
| if    | you can keep your head          |
| when  | all about you are losing theirs |
| and   | blaming it on you               |
`,
    );
  });
  it("should convert object with 1 array field to a markdown table", () => {
    const input = {
      if: ["you ", "can ", "trust", " yourself"],
      when: "all men doubt you",
      but: "keep allowance for their doubting too",
    };
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `| Name  | Value                                 |
| :---- | :------------------------------------ |
| if    | you ,can ,trust, yourself             |
| when  | all men doubt you                     |
| but   | keep allowance for their doubting too |
`,
    );
  });
  it("should convert object with 1 object field to a markdown table", () => {
    const input = {
      if: ["you ", "can ", "wait"],
      and: { not: "be", tired: "of", waiting: "." },
    };
    const output = convertToRenderable(input);
    const expected = `| Name           | Value          |
| :------------- | :------------- |
| if             | you ,can ,wait |
| and -> not     | be             |
| and -> tired   | of             |
| and -> waiting | .              |
`;
    expect(output).toEqual(expected);
  });

  it("removes uuid from key:value pairs", () => {
    const input = {
      well: "i dreamed i saw the knights in armor coming",
      saying: "something about a queen",
      uuid: crypto.randomUUID(),
    };
    const output = convertToRenderable(input);
    expect(output).toEqual(
      `| Name   | Value                                       |
| :----- | :------------------------------------------ |
| well   | i dreamed i saw the knights in armor coming |
| saying | something about a queen                     |
`,
    );
  });

  it("removes uuid from array", () => {
    const input = "look at mother nature on the run".split(" ");
    input.push(crypto.randomUUID());
    const output = convertToRenderable(input);
    const expected = `|   |
|---|
| look |
| at |
| mother |
| nature |
| on |
| the |
| run |
`;
    expect(output).toEqual(expected);
  });
  it("removes nested uuid from array", () => {
    const input = [
      ["i", "was"],
      ["lying", "in"],
      ["a", "burned"],
      ["out", "basement"],
      ["with", crypto.randomUUID()],
    ];
    const output = convertToRenderable(input);
    const expected = `|   0   |    1     |
| :---: | :------: |
|   i   |   was    |
| lying |    in    |
|   a   |  burned  |
|  out  | basement |
| with  |          |
`;
    expect(output).toEqual(expected);
  });
  it("removes uuid from nested object", () => {
    const input = [
      { flying: "mother nature's silver seed", to: "a new home in the sun" },
      { flying: "mother nature's on the run", to: crypto.randomUUID() },
    ];
    const output = convertToRenderable(input);
    const expected = `|           Flying            |          To           |
| :-------------------------: | :-------------------: |
| mother nature's silver seed | a new home in the sun |
| mother nature's on the run  |                       |
`;
    expect(output).toEqual(expected);
  });
});
