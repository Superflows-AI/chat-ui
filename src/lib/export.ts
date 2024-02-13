import { GraphData } from "./types";

export function exportDataAsCSV(data: GraphData): string {
  const columnOrder = Object.keys(data.data[0]);
  // Add columns that aren't present in the first row
  data.data.forEach((row) => {
    columnOrder.push(
      ...Object.keys(row).filter((col) => !columnOrder.includes(col)),
    );
  });

  return `${columnOrder
    .map((colName) => {
      if (colName === "x" && data.xLabel) {
        return data.xLabel;
      } else if (colName === "y" && data.yLabel) {
        return data.yLabel;
      }
      return colName;
    })
    .join(",")}
${data.data
  .map((dataRow) => {
    return columnOrder
      .map((colName) => {
        // @ts-ignore
        return dataRow[colName] ?? "";
      })
      .join(",");
  })
  .join("\n")}`;
}
