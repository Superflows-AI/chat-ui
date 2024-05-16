import { loadMoreNumRowsToAdd, startingTableRows } from "../lib/consts";
import { convertToMarkdownTable } from "../lib/utils";
import { ArrowDownIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { GraphData } from "../lib/types";
import { StyledMarkdown } from "./StyledMarkdown";

export default function Table(props: { graphData: GraphData }) {
  const [tableData, setTableData] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [tableString, setTableString] = useState<string>("");
  const [tableNumRows, setTableNumRows] = useState<number>(startingTableRows);

  useEffect(() => {
    const removeX =
      !props.graphData.xLabel &&
      !props.graphData.data.some((d) => d.x !== props.graphData.data[0].x);
    const removeY =
      !props.graphData.yLabel &&
      !props.graphData.data.some((d) => d.y !== props.graphData.data[0].y);
    const localData = props.graphData.data.map((item) => {
      const out: Record<string, unknown> = { ...item };
      if (
        props.graphData.xLabel &&
        "x" in item &&
        !out[props.graphData.xLabel]
      ) {
        out[props.graphData.xLabel] = item.x;
        delete out.x;
      }
      if (
        props.graphData.yLabel &&
        "y" in item &&
        !out[props.graphData.yLabel]
      ) {
        out[props.graphData.yLabel] = item.y;
        delete out.y;
      }
      if (removeX) delete out.x;
      if (removeY) delete out.y;
      return out;
    });
    setTableData(localData);
    setTableString(
      convertToMarkdownTable(localData.slice(0, startingTableRows)),
    );
  }, [props.graphData.data]);
  if (!tableData) return <></>;

  return (
    <div className="sf-flex sf-flex-col sf-w-full sf-mb-2">
      <StyledMarkdown
        totals={[
          undefined,
          {
            average: "\n" + 6.4,
            total: "\n" + 64,
          },
          {
            average: "\n" + 923.54,
            total: "\n" + (9235.4).toLocaleString(),
          },
          {
            average: "\n" + (3002.79).toLocaleString(),
            total: "\n" + (30027.9).toLocaleString(),
          },
        ]}
        tableExtender={
          tableData.length > tableNumRows && (
            <tr
              className="sf-w-full sf-relative sf-cursor-pointer sf-bg-gray-50 sf-border-b sf-border-x sf-border-gray-300 hover:sf-bg-gray-100 sf-transition"
              onClick={() => {
                const newNumRows = Math.min(
                  tableNumRows + loadMoreNumRowsToAdd,
                  tableData.length,
                );
                setTableNumRows(newNumRows);
                setTableString(
                  convertToMarkdownTable(tableData.slice(0, newNumRows)),
                );
              }}
            >
              <td className="sf-h-7" />
              <td className="sf-h-7" />
              <td className="sf-h-7" />
              <td className="sf-absolute sf-top-0 sf-py-1.5 sf-inset-x-0 sf-flex sf-place-items-center sf-justify-center sf-text-little sf-text-gray-500">
                <ArrowDownIcon className="sf-w-4 sf-h-4 sf-mr-1" />
                Load{" "}
                {Math.min(
                  loadMoreNumRowsToAdd,
                  tableData.length - tableNumRows,
                )}{" "}
                more
              </td>
            </tr>
          )
        }
      >
        {tableString}
      </StyledMarkdown>
      {props.graphData.data.length > tableNumRows && (
        <div className="sf-w-full sf-flex sf-justify-end sf-text-sm sf-text-gray-500 sf-py-0.5 sf-pr-5">
          {props.graphData.data.length - tableNumRows} more rows
        </div>
      )}
    </div>
  );
}
