import { removeUUIDs } from "../src/lib/utils";

describe("removeUUIDs", () => {
  it("empty object", () => {
    expect(removeUUIDs({})).toEqual({});
  });

  it("simple object with no UUIDs", () => {
    expect(removeUUIDs({ a: "abc", b: "def" })).toEqual({ a: "abc", b: "def" });
  });

  it("simple object with UUIDs", () => {
    expect(
      removeUUIDs({ a: "abc", b: "3b241101-e2bb-4255-8caf-4136c566a964" }),
    ).toEqual({ a: "abc" });
  });

  it("nested object with UUIDs", () => {
    expect(
      removeUUIDs({
        a: "abc",
        b: { c: "3b241101-e2bb-4255-8caf-4136c566a964" },
      }),
    ).toEqual({ a: "abc", b: {} });
  });

  it("simple array with no UUIDs", () => {
    expect(removeUUIDs(["abc", "def"])).toEqual(["abc", "def"]);
  });

  it("simple array with UUIDs", () => {
    expect(
      removeUUIDs(["abc", "3b241101-e2bb-4255-8caf-4136c566a964"]),
    ).toEqual(["abc"]);
  });

  it("nested array with UUIDs", () => {
    expect(
      removeUUIDs([
        "abc",
        ["3b241101-e2bb-4255-8caf-4136c566a964", "cheese is a kind of meat"],
      ]),
    ).toEqual(["abc", ["cheese is a kind of meat"]]);
  });

  it("array of objects with UUIDs", () => {
    expect(
      removeUUIDs([{ a: "abc", b: "3b241101-e2bb-4255-8caf-4136c566a964" }]),
    ).toEqual([{ a: "abc" }]);
  });

  it("complex object and array with UUIDs", () => {
    expect(
      removeUUIDs({
        a: "abc",
        b: "3b241101-e2bb-4255-8caf-4136c566a964",
        c: ["def", "3b241101-e2bb-4255-8caf-4136c566a964"],
      }),
    ).toEqual({ a: "abc", c: ["def"] });
  });

  it("null object", () => {
    expect(removeUUIDs(null)).toEqual(null);
  });

  it("very nested object with UUIDs", () => {
    const input = {
      a: "abc",
      b: {
        c: "3b241101-e2bb-4255-8caf-4136c566a964",
        d: {
          e: "123",
          f: {
            g: "3b241101-e2bb-4255-8caf-4136c566a964",
            h: "456",
          },
        },
      },
      i: "def",
    };
    const expectedOutput = {
      a: "abc",
      b: { d: { e: "123", f: { h: "456" } } },
      i: "def",
    };
    expect(removeUUIDs(input)).toEqual(expectedOutput);
  });

  it("very nested array with UUIDs", () => {
    const input = [
      "abc",
      [
        "def",
        ["ghi", ["3b241101-e2bb-4255-8caf-4136c566a964", "jkl"], "mno"],
        "pqr",
      ],
      "stu",
    ];
    const expectedOutput = [
      "abc",
      ["def", ["ghi", ["jkl"], "mno"], "pqr"],
      "stu",
    ];
    expect(removeUUIDs(input)).toEqual(expectedOutput);
  });
});
