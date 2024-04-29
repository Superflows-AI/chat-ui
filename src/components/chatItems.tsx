import {
  ArrowDownIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  LightBulbIcon,
  MinusIcon,
  PlusIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ParsedOutput, parseOutput } from "../lib/parser";
import {
  AssistantMessage,
  GraphMessage,
  Json,
  StreamingStepInput,
  UserMessage,
} from "../lib/types";
import {
  classNames,
  convertToMarkdownTable,
  functionNameToDisplay,
  scrollToBottom,
} from "../lib/utils";
import { Graph } from "./graph";
import { LoadingSpinner } from "./loadingspinner";
import {
  BoltIcon,
  MapIcon,
  LightBulbIcon as LightBulbSolidIcon,
} from "@heroicons/react/24/solid";
import { loadMoreNumRowsToAdd, startingTableRows } from "../lib/consts";
import { exportDataAsCSV } from "../lib/export";

export interface FunctionCall {
  name: string;
  args: { [key: string]: any };
}

export interface ToConfirm extends FunctionCall {
  actionId: number;
}

type ChatItemRole = Pick<StreamingStepInput, "role">["role"];

export default function ChatItem(props: {
  chatItem: StreamingStepInput;
  devMode: boolean;
  AIname?: string;
  onConfirm?: (confirm: boolean) => Promise<void>;
  isLoading?: boolean;
  prevAndNextChatRoles?: (ChatItemRole | undefined)[];
  precedingUrls?: { name: string; url: string }[];
  showThoughts?: boolean;
  showFunctionCalls?: boolean;
  width: number;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom(
        props.scrollRef,
        "auto",
        false,
        props.chatItem.role === "graph" ? 400 : 200,
      );
    }, 100);
  }, [props.chatItem, props.chatItem.content]);

  const chatItem = props.chatItem;
  if (chatItem.role === "loading") {
    return (
      <LoadingItem
        text={chatItem.content}
        isLast={props.prevAndNextChatRoles[1] === undefined}
      />
    );
  } else if (chatItem.role === "confirmation") {
    return <ConfirmationChatItem {...props} />;
  } else if (chatItem.role === "user") {
    return <UserChatItem {...props} chatItem={chatItem} />;
  } else if (props.devMode || chatItem.role === "error") {
    return <PlainTextChatItem {...props} chatItem={chatItem} />;
  } else if (chatItem.role === "graph") {
    return <GraphVizChatItem {...props} chatItem={chatItem} />;
  } else if (chatItem.role === "assistant") {
    return <AssistantChatItem {...props} chatItem={chatItem} />;
  } else if (chatItem.role === "debug") {
    return <></>;
  } else if (chatItem.role === "function" && props.showFunctionCalls) {
    return <FunctionVizChatItem {...props} chatItem={chatItem} />;
  }
  return <></>;
}

function LoadingItem(props: { text: string; isLast: boolean }) {
  if (!props.isLast) {
    return <></>;
  }
  return (
    <div
      className={
        "sf-w-full sf-flex sf-flex-row sf-justify-center sf-text-sm sf-mt-1.5"
      }
    >
      <div
        className={classNames(
          "sf-px-8 sf-py-1 sf-rounded sf-border sf-flex sf-flex-col sf-place-items-center",
          props.text === "Thinking"
            ? "sf-border-orange-300 sf-bg-orange-200 sf-text-orange-700"
            : "sf-border-blue-300 sf-bg-blue-200 sf-text-blue-700",
        )}
      >
        <div className="sf-flex sf-flex-row sf-place-items-center sf-gap-x-1">
          <LightBulbSolidIcon className="sf-w-4 sf-h-4" />
          {props.text}...
        </div>
        <LoadingSpinner classes={"sf-mt-1 sf-w-5 sf-h-5 sf-mx-auto"} />
      </div>
    </div>
  );
}

export function UserChatItem(props: {
  chatItem: UserMessage;
  prevAndNextChatRoles?: ChatItemRole[];
  width: number;
}) {
  return (
    <div
      className={classNames(
        "sf-my-2 sf-py-3 sf-mx-1.5 sf-flex sf-flex-col sf-w-full sf-border-y sf-border-gray-200 first:sf-border-t-0",
      )}
    >
      <p
        className={classNames(
          "sf-mb-1 sf-px-1.5 sf-text-gray-900",
          props.width > 640
            ? "sf-font-semibold sf-text-base"
            : "sf-font-medium sf-text-little",
        )}
      >
        You
      </p>
      <div className="sf-px-2 sf-mt-1 sf-text-little sf-text-gray-900 sf-w-full sf-whitespace-pre-wrap">
        {props.chatItem.content}
      </div>
    </div>
  );
}

export function PlainTextChatItem(props: {
  chatItem: StreamingStepInput;
  AIname?: string;
  onConfirm?: (confirm: boolean) => Promise<void>;
}) {
  const [content, setContent] = useState("");

  useEffect(() => {
    if (props.chatItem.role === "function") {
      try {
        setContent(JSON.stringify(JSON.parse(props.chatItem.content), null, 2));
      } catch {
        setContent(props.chatItem.content);
      }
    } else if (props.chatItem.role === "graph") {
      setContent(JSON.stringify(props.chatItem.content, null, 2));
    } else {
      setContent(props.chatItem.content);
    }
  }, [props.chatItem.content]);

  if (!content) return <></>;
  return (
    <div
      className={classNames(
        "sf-py-2 sf-px-1.5 sf-rounded sf-flex sf-flex-col sf-w-full sf-mt-2 sf-border sf-border-gray-400",
        props.chatItem.role === "assistant"
          ? "sf-bg-gray-200"
          : props.chatItem.role === "error"
          ? "sf-bg-red-200"
          : props.chatItem.role === "debug"
          ? "sf-bg-blue-100"
          : props.chatItem.role === "function"
          ? "sf-bg-green-100"
          : props.chatItem.role === "graph"
          ? "sf-bg-blue-100"
          : "",
      )}
    >
      <p className="sf-text-xs sf-text-gray-600 sf-mb-1">
        {props.chatItem.role === "assistant"
          ? (props.AIname ?? "Assistant") + " AI"
          : props.chatItem.role === "function"
          ? "Function called"
          : props.chatItem.role === "user"
          ? "You"
          : props.chatItem.role === "debug"
          ? "Debug"
          : props.chatItem.role === "error"
          ? "Error"
          : ""}
      </p>
      <div className="sf-px-2 sf-mt-1 sf-text-little sf-text-gray-900 sf-w-full sf-whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

export function FunctionVizChatItem(props: {
  chatItem: Extract<StreamingStepInput, { role: "function" }>;
  prevAndNextChatRoles?: ChatItemRole[];
  width: number;
}) {
  if (props.chatItem.role !== "function")
    throw new Error("Not a function chat item");

  const [expanded, setExpanded] = useState<boolean>(false);
  const [content, setContent] = useState(props.chatItem.content);
  const [isJson, setIsJson] = useState(false);
  const [fullTableString, setFullTableString] = useState<string>("");
  const [tableNumRows, setTableNumRows] = useState<number>(startingTableRows);

  useEffect(() => {
    if (["[]", "{}"].includes(props.chatItem.content)) {
      setContent("No data returned");
      return;
    }
    try {
      const functionJsonResponse = JSON.parse(props.chatItem.content) as Json;
      setIsJson(true);

      // First check is for null
      if (functionJsonResponse && typeof functionJsonResponse === "object") {
        const localTableString = convertToMarkdownTable(functionJsonResponse);
        setFullTableString(localTableString);
        setContent(
          localTableString
            .split("\n")
            .slice(0, startingTableRows + 2)
            .join("\n"),
        );
      }
    } catch {
      let dataToShow = props.chatItem.content.slice(0, 100);
      if (props.chatItem.content.length > 100) dataToShow += "...";
      console.log(`Could not parse data: ${dataToShow} as json`);
      // If not JSON, then there may be a summary
      setContent(props.chatItem.summary ?? props.chatItem.content);
    }
  }, []);

  // TODO: Perhaps remove this?
  // If this chat item is empty and the previous and next chat items are functions, then don't show anything
  // if (
  //   ["[]", "{}"].includes(props.chatItem.content) ||
  //   (props.prevAndNextChatRoles &&
  //     props.prevAndNextChatRoles.every((role) => role === "function"))
  // ) {
  //   return <></>;
  // }

  return (
    <div className="sf-w-full sf-flex sf-flex-row sf-justify-center sf-my-1">
      <div
        className={classNames(
          "sf-rounded sf-flex sf-flex-col sf-w-full sf-text-left sf-place-items-baseline sf-bg-gray-50 sf-border sf-border-gray-200",
          props.width > 640
            ? expanded
              ? "sf-mx-8 md:sf-mx-12 lg:sf-mx-16 xl:sf-mx-20"
              : "hover:sf-bg-gray-100 sf-cursor-pointer sf-mx-8 md:sf-mx-20 lg:sf-mx-28 xl:sf-mx-40"
            : expanded
            ? "sf-mx-4"
            : "hover:sf-bg-gray-100 sf-cursor-pointer sf-mx-4",
        )}
      >
        <button
          className="sf-group sf-flex sf-flex-row sf-w-full sf-justify-between sf-py-1 sf-px-1.5"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <p className="sf-text-xs sf-text-gray-600 sf-mb-1">
            Data{props.width > 640 ? " received" : ""}
          </p>
          <div className="sf-text-sm sf-text-gray-800">
            <b
              className={classNames(
                props.width > 640
                  ? "sf-font-medium"
                  : "sf-font-normal sf-text-sm",
              )}
            >
              {functionNameToDisplay(props.chatItem?.name ?? "")}
            </b>
          </div>
          {expanded ? (
            <MinusIcon className={"sf-w-5 sf-h-5 sf-mr-6"} />
          ) : (
            <PlusIcon className={"sf-w-5 sf-h-5 sf-mr-6"} />
          )}
        </button>
        {expanded && (
          <>
            {content &&
              (isJson ? (
                <div className="sf-flex sf-flex-col sf-w-full">
                  <StyledMarkdown>{content}</StyledMarkdown>
                  {fullTableString &&
                    fullTableString.split("\n").length > tableNumRows + 2 && (
                      <button
                        className="sf-w-[calc(100%-2rem)] sf-flex sf-place-items-center sf-justify-center sf-bg-gray-50 sf-mx-4 sf-border-b sf-border-x sf-text-little sf-text-gray-600 sf-py-1.5"
                        onClick={() => {
                          const splitFullTableString =
                            fullTableString.split("\n");
                          const newNumRows = Math.min(
                            tableNumRows + 2 + loadMoreNumRowsToAdd,
                            splitFullTableString.length,
                          );
                          setTableNumRows(newNumRows);
                          setContent(
                            splitFullTableString
                              .slice(0, newNumRows)
                              .join("\n"),
                          );
                        }}
                      >
                        <ArrowDownIcon className="sf-w-4 sf-h-4 sf-mr-1" />
                        Load{" "}
                        {Math.min(
                          loadMoreNumRowsToAdd,
                          fullTableString.split("\n").length - tableNumRows - 2,
                        )}{" "}
                        more
                      </button>
                    )}
                  {fullTableString.split("\n").length > tableNumRows + 2 && (
                    <div className="sf-w-full sf-flex sf-justify-end sf-text-sm sf-text-gray-500 sf-py-0.5 sf-pr-5">
                      {fullTableString.split("\n").length - (tableNumRows + 2)}{" "}
                      more rows
                    </div>
                  )}
                </div>
              ) : (
                <div className="sf-px-2 sf-mt-1 sf-text-little sf-text-gray-900 sf-whitespace-pre-line sf-w-full sf-break-words">
                  {content}
                </div>
              ))}
            {props.chatItem.urls && props.chatItem.urls.length > 0 && (
              <div className="sf-w-full sf-border-t sf-mt-2 sf-mb-1">
                <div className="sf-mt-1 sf-flex sf-flex-row sf-gap-x-1 sf-flex-wrap sf-justify-end sf-text-gray-700 sf-px-3 sf-text-xs">
                  More info:
                  {props.chatItem.urls.map((url, idx) => (
                    <div key={idx} className="sf-flex sf-flex-row">
                      <a
                        href={url.url}
                        className="sf-text-blue-500 hover:sf-underline visited:sf-text-purple-500"
                        target={"_blank"}
                        rel={"noreferrer noopener"}
                      >
                        {props.chatItem.urls.length > 1 && `${idx + 1}.`}{" "}
                        {url.name || url.url}
                      </a>
                      {idx + 1 < props.chatItem.urls.length && ","}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function GraphVizChatItem(props: {
  chatItem: GraphMessage;
  prevAndNextChatRoles?: ChatItemRole[];
  width: number;
}) {
  const [expanded, setExpanded] = useState<boolean>(true);
  const [tableData, setTableData] = useState<Record<string, unknown>[] | null>(
    null,
  );
  const [tableString, setTableString] = useState<string>("");
  const [tableNumRows, setTableNumRows] = useState<number>(startingTableRows);
  const [tabOpen, setTabOpen] = useState<"table" | "graph">(
    props.chatItem.content.type === "table" ? "table" : "graph",
  );

  useEffect(() => {
    const removeX =
      !props.chatItem.content.xLabel &&
      !props.chatItem.content.data.some(
        (d) => d.x !== props.chatItem.content.data[0].x,
      );
    const removeY =
      !props.chatItem.content.yLabel &&
      !props.chatItem.content.data.some(
        (d) => d.y !== props.chatItem.content.data[0].y,
      );
    const localData = props.chatItem.content.data.map((item) => {
      const out: Record<string, unknown> = { ...item };
      if (
        props.chatItem.content.xLabel &&
        "x" in item &&
        !out[props.chatItem.content.xLabel]
      ) {
        out[props.chatItem.content.xLabel] = item.x;
        delete out.x;
      }
      if (
        props.chatItem.content.yLabel &&
        "y" in item &&
        !out[props.chatItem.content.yLabel]
      ) {
        out[props.chatItem.content.yLabel] = item.y;
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
  }, [props.chatItem.content.data]);

  if (props.chatItem.content.data?.length === 0) return <></>;

  return (
    <div className="sf-w-full sf-flex sf-flex-row sf-justify-center sf-my-1">
      <div
        className={classNames(
          "sf-relative sf-rounded sf-flex sf-flex-col md:sf-max-w-2xl lg:sf-max-w-3xl sf-w-full sf-text-left sf-place-items-baseline sf-bg-sky-50 sf-border sf-border-gray-200",
          props.width > 640 ? "sf-mx-8" : "sf-mx-4",
          !expanded && "hover:sf-bg-sky-100 sf-cursor-pointer",
        )}
      >
        <button
          className="sf-group sf-flex sf-flex-row sf-w-full sf-justify-between sf-py-2 sf-px-1.5"
          onClick={() => setExpanded((prev) => !prev)}
        >
          <p className="sf-text-xs sf-text-sky-600 sf-mb-1">Plot</p>
          <div className="sf-text-sm sf-text-black">
            {props.chatItem.content.type !== "value" && "Graph of"}{" "}
            <b
              className={classNames(
                props.width > 640 ? "sf-font-semibold" : "sf-font-medium",
              )}
            >
              {props.chatItem.content.graphTitle}
            </b>
          </div>
          {expanded ? (
            <MinusIcon className={"sf-w-5 sf-h-5 sf-mr-6"} />
          ) : (
            <PlusIcon className={"sf-w-5 sf-h-5 sf-mr-6"} />
          )}
        </button>
        {expanded && (
          <>
            <div
              className={classNames(
                "sf-w-full sf--mb-1.5 sf-flex sf-justify-between",
                props.width > 640 ? "sf-mt-1.5" : "sf-mt-0.5",
              )}
            >
              <div>
                {!["table", "value"].includes(props.chatItem.content.type) && (
                  <Tabs
                    tabOpen={tabOpen}
                    setTabOpen={setTabOpen}
                    small={props.width <= 640}
                  />
                )}
              </div>
              <div>
                {props.chatItem.content.type !== "value" && (
                  <button
                    className={classNames(
                      "sf-bg-white sf-rounded-lg sf-border hover:sf-bg-gray-50 sf-text-gray-600 hover:sf-text-gray-700 sf-flex sf-flex-row sf-place-items-center sf-gap-x-1 sf-text-sm sf-shadow-sm",
                      props.width > 640
                        ? "sf-mb-2 sf-mr-4 sf-px-2 sf-py-2"
                        : "sf-mb-1.5 sf-mr-2.5 sf-px-1.5 sf-py-1.5",
                    )}
                    onClick={() => {
                      const graphData = exportDataAsCSV(props.chatItem.content);
                      const blob = new Blob([graphData], {
                        type: "text/csv;charset=utf-8;",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `Export:${props.chatItem.content.graphTitle}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <ArrowTopRightOnSquareIcon
                      className={classNames(
                        "sf-text-gray-800",
                        props.width > 640
                          ? "sf-h-4 sf-w-4"
                          : "sf-h-3.5 sf-w-3.5",
                      )}
                    />
                    Export
                  </button>
                )}
              </div>
            </div>
            {tabOpen !== "table" ? (
              <Graph {...props.chatItem.content} small={props.width <= 640} />
            ) : (
              tableData && (
                <div className="sf-flex sf-flex-col sf-w-full sf-mb-2">
                  <StyledMarkdown>{tableString}</StyledMarkdown>
                  {tableData.length > tableNumRows && (
                    <button
                      className="sf-w-[calc(100%-2rem)] sf-flex sf-place-items-center sf-justify-center sf-bg-gray-50 sf-mx-4 sf-border-b sf-border-x sf-text-little sf-text-gray-600 sf-py-1.5"
                      onClick={() => {
                        const newNumRows = Math.min(
                          tableNumRows + loadMoreNumRowsToAdd,
                          tableData.length,
                        );
                        setTableNumRows(newNumRows);
                        setTableString(
                          convertToMarkdownTable(
                            tableData.slice(0, newNumRows),
                          ),
                        );
                      }}
                    >
                      <ArrowDownIcon className="sf-w-4 sf-h-4 sf-mr-1" />
                      Load{" "}
                      {Math.min(
                        loadMoreNumRowsToAdd,
                        tableData.length - tableNumRows,
                      )}{" "}
                      more
                    </button>
                  )}
                  {props.chatItem.content.data.length > tableNumRows && (
                    <div className="sf-w-full sf-flex sf-justify-end sf-text-sm sf-text-gray-500 sf-py-0.5 sf-pr-5">
                      {props.chatItem.content.data.length - tableNumRows} more
                      rows
                    </div>
                  )}
                </div>
              )
            )}
          </>
        )}
        {/* TODO: Make graph sharing work */}
        {/*<div className="sf-absolute sf-bottom-1 sf-right-3">*/}
        {/*  <div className="sf-relative">*/}
        {/*    <button className="sf-peer hover:sf-bg-sky-100 sf-text-gray-700 hover:sf-text-sky-700 sf-p-1 sf-rounded-full sf-border sf-border-transparent hover:sf-border-sky-200 active:sf-bg-sky-200">*/}
        {/*      <ShareIcon className="sf-w-5 sf-h-5" />*/}
        {/*    </button>*/}
        {/*    <div className="popup sf--right-3.5 sf--top-9 sf-w-fit">Share</div>*/}
        {/*  </div>*/}
        {/*</div>*/}
        {/*{expanded && (*/}
        {/*  <div className="sf-w-full sf-text-center sf-text-xs sf-text-gray-400 sf-my-1">*/}
        {/*    Feature is in beta - no guarantee that graphs are correct*/}
        {/*  </div>*/}
        {/*)}*/}
      </div>
    </div>
  );
}

export function ConfirmationChatItem(props: {
  chatItem: StreamingStepInput;
  onConfirm?: (confirm: boolean) => Promise<void>;
}) {
  if (props.chatItem.role !== "confirmation")
    throw new Error("Not a confirmation chat item");
  const [content, setContent] = useState(props.chatItem.content);
  const toConfirm = JSON.parse(props.chatItem.content) as ToConfirm[];

  useEffect(() => {
    setContent(
      `The following action${
        toConfirm.length > 1 ? "s require" : " requires"
      } confirmation:\n\n${toConfirm
        .map((action) => {
          return `${convertToMarkdownTable(
            action.args,
            functionNameToDisplay(action.name),
          )}`;
        })
        .join("")}`,
    );
  }, [props.chatItem.content]);
  // Confirmed is null if the user hasn't confirmed yet, true if the user has confirmed, and false if the user has cancelled
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  const [expanded, setExpanded] = useState<boolean>(true);

  if (!content) return <></>;
  return (
    <div
      className={classNames(
        "sf-rounded sf-flex sf-flex-col sf-w-full sf-text-left sf-place-items-baseline sf-border sf-border-gray-300 sf-bg-blue-100 ",
        !expanded && "hover:sf-bg-blue-200 sf-cursor-pointer",
      )}
    >
      <button
        className="sf-group sf-flex sf-flex-row sf-w-full sf-justify-between sf-py-2 sf-px-1.5"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <p className="sf-text-xs sf-text-gray-600 sf-mb-1">Confirmation</p>
        <div className="sf-text-sm sf-w-1/2 sf-overflow-hidden sf-overflow-ellipsis sf-whitespace-nowrap">
          Confirmation of{" "}
          <b className="font-medium">
            {toConfirm
              .map((action) => functionNameToDisplay(action.name))
              .join(" & ")}
          </b>
        </div>
        {expanded ? (
          <MinusIcon className={"sf-w-5 sf-h-5 sf-mr-6"} />
        ) : (
          <PlusIcon className={"sf-w-5 sf-h-5 sf-mr-6"} />
        )}
      </button>

      {expanded && (
        <div
          className={
            "sf-py-4 sf-px-1.5 sf-rounded sf-flex sf-flex-col sf-w-full sf-bg-blue-100 sf-text-left sf-place-items-baseline"
          }
        >
          <StyledMarkdown>{content}</StyledMarkdown>
          {props.onConfirm &&
            (confirmed === null ? (
              <div className="sf-my-5 sf-w-full sf-flex sf-flex-col sf-place-items-center sf-gap-y-2">
                Are you sure you want to continue?
                <div className="sf-flex sf-flex-row sf-gap-x-8">
                  <button
                    onClick={() => {
                      setConfirmed(false);
                      setTimeout(() => {
                        setExpanded(false);
                      }, 1000);
                      void props.onConfirm!(false);
                    }}
                    className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-700 sf-px-4 sf-border sf-border-gray-400 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-gray-100 sf-ring-gray-500 hover:sf-bg-gray-200`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setConfirmed(true);
                      setTimeout(() => {
                        setExpanded(false);
                      }, 1000);
                      void props.onConfirm!(true);
                    }}
                    className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-50 sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-blue-500 sf-ring-blue-500 hover:sf-bg-blue-600`}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : confirmed ? (
              <div className="sf-my-5 sf-w-full sf-font-semibold sf-flex sf-flex-row sf-justify-center sf-gap-x-1 sf-place-items-center">
                <CheckCircleIcon className="sf-h-5 sf-w-5 sf-text-green-500" />
                Confirmed
              </div>
            ) : (
              <div className="sf-my-5 sf-w-full sf-flex sf-flex-row sf-font-semibold sf-justify-center sf-gap-x-2 sf-place-items-center">
                <XCircleIcon className="sf-h-5 sf-w-5 sf-text-red-500" />
                Cancelled
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

export function AssistantChatItem(props: {
  chatItem: AssistantMessage;
  AIname?: string;
  isLoading?: boolean;
  prevAndNextChatRoles?: ChatItemRole[];
  precedingUrls?: { name: string; url: string }[];
  showThoughts?: boolean;
  width: number;
}) {
  const [assistantChatObj, setAssistantChatObj] = useState<ParsedOutput>(
    parseOutput(props.chatItem.content),
  );

  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    setAssistantChatObj(parseOutput(props.chatItem.content));
  }, [props.chatItem.content]);

  return (
    <div
      className={classNames(
        "sf-px-1.5 sf-flex sf-flex-col sf-w-full sf-text-left sf-place-items-baseline",
        assistantChatObj.tellUser && "sf-py-1.5",
      )}
    >
      {(!props.prevAndNextChatRoles[0] ||
        props.prevAndNextChatRoles[0] === "user") && (
        <p
          className={classNames(
            "sf-px-1.5 sf-mb-0.5 sf-text-gray-900",
            props.width > 640
              ? "sf-font-semibold sf-text-base"
              : "sf-font-medium sf-text-little",
          )}
        >
          {(props.AIname ?? "Assistant") + " AI"}
        </p>
      )}
      {
        <div className="sf-w-full">
          {assistantChatObj.reasoning && props.showThoughts && (
            <div className="sf-bg-yellow-100 sf-rounded-md sf-px-4 sf-py-2 sf-border sf-border-yellow-300 sf-w-full">
              <button
                className={classNames(
                  "sf-w-full sf-flex sf-flex-row sf-max-h-6 sf-overflow-hidden sf-truncate sf-text-ellipsis sf-justify-between",
                  props.isLoading ? "sf-cursor-default" : "sf-cursor-pointer",
                )}
                onClick={() => {
                  if (!props.isLoading) setExpanded((prev) => !prev);
                }}
              >
                <p className="sf-flex sf-flex-row sf-gap-x-1 sf-text-yellow-800 sf-text-little">
                  <LightBulbIcon className="sf-h-5 sf-w-5 sf-text-yellow-600" />{" "}
                  Thoughts
                </p>
                {!expanded && !props.isLoading && (
                  <p className="sf-text-little sf-whitespace-pre-line sf-max-w-[50%] sf-text-yellow-600">
                    {assistantChatObj.reasoning}
                  </p>
                )}
                {!props.isLoading &&
                  (expanded ? (
                    <MinusIcon className="sf-h-5 sf-w-5 sf-text-yellow-600" />
                  ) : (
                    <PlusIcon className="sf-h-5 sf-w-5 sf-text-yellow-600" />
                  ))}
              </button>
              {(expanded || props.isLoading) && (
                <p className="sf-mt-0.5 sf-text-little sf-whitespace-pre-line sf-break-words sf-text-gray-700">
                  {assistantChatObj.reasoning}
                </p>
              )}
            </div>
          )}
          {assistantChatObj.tellUser && (
            <div className="sf-px-2 sf-mt-1.5 sf-text-little sf-text-gray-900 sf-whitespace-pre-line sf-break-words sf-w-full">
              {assistantChatObj.tellUser
                .match(/(\[[^\]]+]\([^)]+\)|[^[]+|\[)/g)
                .map((text) => (
                  <div className="sf-inline" key={text}>
                    {text.match(/^(\[[^\]]+]\([^)]+\))$/g) ? (
                      <a
                        className="sf-inline sf-text-sky-500 visited:sf-text-purple-500 hover:sf-underline sf-cursor-pointer"
                        href={/\(([^)]+)\)$/g.exec(text)[1]}
                      >
                        {/^\[([^\]]+)]/g.exec(text)[1]}
                      </a>
                    ) : (
                      text
                    )}
                  </div>
                ))}
            </div>
          )}
          {props.isLoading &&
            // No content - below strings are first few strings of output
            (["", "Reason", "Reasoning", "Reasoning:", "Reasoning:\n"].includes(
              props.chatItem.content,
            ) ||
              // Not showing thoughts & thinking
              (!props.showThoughts &&
                assistantChatObj.reasoning &&
                !assistantChatObj.plan &&
                !assistantChatObj.tellUser) ||
              // Planning
              (assistantChatObj.plan && !assistantChatObj.tellUser) ||
              // Taking actions
              props.chatItem.content.includes("Commands:")) && (
              <div
                className={
                  "sf-w-full sf-flex sf-flex-row sf-justify-center sf-text-sm sf-mt-1.5"
                }
              >
                <div
                  className={classNames(
                    "sf-px-8 sf-py-1 sf-rounded sf-border sf-flex sf-flex-col sf-place-items-center",
                    (!props.chatItem.content ||
                      (!props.showThoughts &&
                        !assistantChatObj.plan &&
                        !assistantChatObj.tellUser &&
                        !props.chatItem.content.includes("Commands:"))) &&
                      "sf-border-orange-300 sf-bg-orange-200 sf-text-orange-700",
                    assistantChatObj.plan &&
                      !assistantChatObj.tellUser &&
                      "sf-border-blue-300 sf-bg-blue-200 sf-text-blue-700",
                    props.chatItem.content.includes("Commands:") &&
                      "sf-border-purple-300 sf-bg-purple-200 sf-text-purple-700",
                  )}
                >
                  <div className="sf-flex sf-flex-row sf-place-items-center sf-gap-x-1">
                    {!props.chatItem.content ||
                    (!props.showThoughts &&
                      !assistantChatObj.plan &&
                      !assistantChatObj.tellUser &&
                      !props.chatItem.content.includes("Commands:")) ? (
                      <>
                        <LightBulbSolidIcon className="sf-w-4 sf-h-4" />
                        Thinking...
                      </>
                    ) : props.chatItem.content.includes("Commands:") ? (
                      <>
                        <BoltIcon className="sf-w-4 sf-h-4" />
                        Taking actions...
                      </>
                    ) : (
                      <>
                        <MapIcon className={"sf-w-4 sf-h-4"} />
                        Planning next steps...
                      </>
                    )}
                  </div>
                  <LoadingSpinner
                    classes={"sf-mt-1 sf-w-5 sf-h-5 sf-mx-auto"}
                  />
                </div>
              </div>
            )}
          {!props.isLoading &&
            props.precedingUrls &&
            props.precedingUrls.length > 0 && (
              <div className="sf-flex sf-justify-end sf-text-gray-800 sf-px-3 sf-mt-2.5 sf-text-xs">
                <div className="sf-border sf-border-gray-300 sf-bg-gray-100 sf-rounded-md sf-px-1.5 sf-flex sf-flex-row sf-gap-x-1 sf-flex-wrap">
                  More info:
                  {props.precedingUrls.map((url, idx) => (
                    <div key={idx} className="sf-flex sf-flex-row">
                      <a
                        href={url.url}
                        className="sf-text-blue-500 hover:sf-underline visited:sf-text-purple-500"
                        target={"_blank"}
                        rel={"noreferrer noopener"}
                      >
                        {`${idx + 1}.`}{" "}
                        {url.name ||
                          url.url.replace(/https?:\/\//, "").split("/")[0]}
                      </a>
                      {idx + 1 < props.precedingUrls.length && ","}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      }
    </div>
  );
}

function StyledMarkdown(props: { children: string }) {
  return (
    <ReactMarkdown
      className="sf-px-4 sf-mt-1 sf-text-little sf-text-gray-900 sf-whitespace-pre-line sf-w-full sf-overflow-x-auto"
      components={{
        a: ({ node, ...props }) => (
          <a className="sf-text-blue-500 hover:sf-underline" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li
            className="marker:sf-text-gray-700 sf-ml-4 sf--my-2 sf-text-gray-900 sf-list-decimal"
            {...props}
          />
        ),
        p: ({ node, ...props }) => <p className="sf-my-0" {...props} />,
        h3: ({ node, ...props }) => (
          <h3
            className="sf-text-little sm:sf-text-base lg:sf-text-lg sf-text-center sf-w-full sf-font-extrabold sf-text-gray-900 sf-py-2 sf--mb-6 sf-border sf-bg-gray-50 sf-border-gray-300"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <table
            className="sf-text-center sf-border-collapse sf-w-full sf-divide-y sf-divide-gray-300 sf-border sf-border-gray-300"
            {...props}
          />
        ),
        thead: ({ node, ...props }) => (
          <thead
            className="sf-bg-gray-100 sf-text-xs sm:sf-text-sm lg:sf-text-little sf-text-gray-900 sf-py-2"
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            className="sf-border sf-border-gray-300 sf-break-keep sf-font-normal sf-px-2 sf-py-2"
            {...props}
          />
        ),
        tr: ({ node, ...props }) => (
          <tr
            className="even:sf-bg-gray-300 sf-border sf-border-gray-300"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="sf-bg-gray-200 sf-border sf-border-gray-300 sf-break-keep sf-whitespace-wrap sf-px-2 sf-py-2.5 sf-text-xs md:sf-text-sm sf-text-gray-700 sf-break-words sf-break"
            style={{ wordBreak: "break-word" }}
            {...props}
          />
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {props.children}
    </ReactMarkdown>
  );
}

export function Tabs(props: {
  tabOpen: "table" | "graph";
  setTabOpen: (tab: "table" | "graph") => void;
  small?: boolean;
}) {
  const options: ("table" | "graph")[] = ["graph", "table"];
  return (
    <nav
      className={classNames(
        "sf-isolate sf-flex sf-divide-x sf-divide-gray-200 sf-rounded-lg sf-shadow",
        props.small ? "sf-ml-1.5 sf-mb-1" : "sf-ml-3 sf-mb-2",
      )}
      aria-label="Tabs"
    >
      {options.map((tab, tabIdx) => (
        <a
          key={tab}
          className={classNames(
            props.tabOpen === tab
              ? "sf-text-gray-900"
              : "sf-text-gray-500 hover:sf-text-gray-700",
            tabIdx === 0 ? "sf-rounded-l-lg" : "",
            tabIdx === 1 ? "sf-rounded-r-lg" : "",
            "sf-relative sf-cursor-pointer sf-min-w-0 sf-flex-1 sf-overflow-hidden sf-bg-white sf-text-center sf-text-sm hover:sf-bg-gray-50 focus:sf-z-10",
            props.small ? "sf-py-1.5 sf-px-1.5" : "sf-py-2 sf-px-2",
          )}
          aria-current={props.tabOpen === tab ? "page" : undefined}
          onClick={() => {
            props.setTabOpen(options[tabIdx]);
          }}
        >
          <span>{tab.slice(0, 1).toUpperCase() + tab.slice(1)}</span>
          <span
            aria-hidden="true"
            className={classNames(
              props.tabOpen === tab ? "sf-bg-sky-500" : "sf-bg-transparent",
              "sf-absolute sf-inset-x-0 sf-bottom-0 sf-h-0.5",
            )}
          />
        </a>
      ))}
    </nav>
  );
}
