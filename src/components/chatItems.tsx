import {
  CheckCircleIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import React from "react";
import { useEffect, useState } from "react";
// import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ParsedOutput, parseOutput } from "../lib/parser";
import { Json, StreamingStepInput } from "../lib/types";
import {
  classNames,
  convertToRenderable,
  functionNameToDisplay,
} from "../lib/utils";
import { Graph, GraphData, extractGraphData } from "./graph";
import { LoadingSpinner } from "./loadingspinner";
import {
  BoltIcon,
  MapIcon,
  LightBulbIcon as LightBulbSolidIcon,
} from "@heroicons/react/24/solid";

export interface FunctionCall {
  name: string;
  args: { [key: string]: any };
}

export interface ToConfirm extends FunctionCall {
  actionId: number;
}

export function DevChatItem(props: {
  chatItem: StreamingStepInput;
  AIname?: string;
  onConfirm?: (confirm: boolean) => Promise<void>;
}) {
  // TODO: Refactor this and UserChatItem into components for each chat role
  const [content, setContent] = useState(props.chatItem.content);

  useEffect(() => {
    if (props.chatItem.role === "confirmation") {
      const toConfirm = JSON.parse(props.chatItem.content) as ToConfirm[];
      setContent(
        `The following action${
          toConfirm.length > 1 ? "s require" : " requires"
        } confirmation:\n\n${toConfirm
          .map((action) => {
            return `${convertToRenderable(
              action.args,
              functionNameToDisplay(action.name),
            )}`;
          })
          .join("")}`,
      );
    } else if (props.chatItem.role === "function") {
      try {
        setContent(JSON.stringify(JSON.parse(props.chatItem.content), null, 2));
      } catch {
        setContent(props.chatItem.content);
      }
    } else {
      setContent(props.chatItem.content);
    }
  }, [props.chatItem.content]);

  const [saveSuccessfulFeedback, setSaveSuccessfulFeedback] =
    useState<boolean>(false);
  // Confirmed is null if the user hasn't confirmed yet, true if the user has confirmed, and false if the user has cancelled
  const [confirmed, setConfirmed] = useState<boolean | null>(null);
  useEffect(() => {
    if (saveSuccessfulFeedback) {
      setTimeout(() => {
        setSaveSuccessfulFeedback(false);
      }, 3000);
    }
  }, [saveSuccessfulFeedback]);

  useEffect(scrollToBottom, [content]);

  if (!content) return <></>;
  return (
    <div
      className={classNames(
        "py-4 px-1.5 rounded flex flex-col  w-full",
        props.chatItem.role === "user"
          ? "bg-gray-100 text-right place-items-end"
          : "bg-gray-200 text-left place-items-baseline",
        props.chatItem.role === "error"
          ? "bg-red-200"
          : props.chatItem.role === "debug"
          ? "bg-green-100"
          : props.chatItem.role === "function"
          ? "bg-green-200"
          : props.chatItem.role === "confirmation"
          ? "bg-blue-100"
          : "",
      )}
    >
      <p className="text-xs text-gray-600 mb-1">
        {props.chatItem.role === "assistant"
          ? (props.AIname ?? "Assistant") + " AI"
          : props.chatItem.role === "function"
          ? "Function called"
          : props.chatItem.role === "confirmation"
          ? "Confirmation required"
          : props.chatItem.role === "user"
          ? "You"
          : props.chatItem.role === "debug"
          ? "Debug"
          : props.chatItem.role === "error"
          ? "Error"
          : ""}
      </p>
      {props.chatItem.role === "confirmation" ? (
        <StyledMarkdown>{content}</StyledMarkdown>
      ) : (
        <div className="px-2 mt-1 text-little text-gray-900 w-full whitespace-pre-wrap">
          {content}
        </div>
      )}
      {props.onConfirm &&
        props.chatItem.role === "confirmation" &&
        (confirmed === null ? (
          <div className="my-5 w-full flex flex-col place-items-center gap-y-2">
            Are you sure you want to continue?
            <div className="flex flex-row gap-x-8">
              <button
                onClick={() => {
                  setConfirmed(false);
                  void props.onConfirm!(false);
                }}
                className={`flex flex-row gap-x-1.5 font-medium place-items-center text-gray-700 px-4 border border-gray-400 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 bg-gray-100 ring-gray-500 hover:bg-gray-200`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setConfirmed(true);
                  void props.onConfirm!(true);
                }}
                className={`flex flex-row gap-x-1.5 font-medium place-items-center text-gray-50 px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 bg-blue-500 ring-blue-500 hover:bg-blue-600`}
              >
                Confirm
              </button>
            </div>
            <div
              className={classNames(
                "flex flex-row place-items-center gap-x-1",
                saveSuccessfulFeedback ? "visible" : "invisible",
              )}
            >
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <div className="text-sm">Thanks for your feedback!</div>
            </div>
          </div>
        ) : confirmed ? (
          <div className="my-5 w-full font-semibold flex flex-row justify-center gap-x-1 place-items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
            Confirmed
          </div>
        ) : (
          <div className="my-5 w-full flex flex-row font-semibold justify-center gap-x-2 place-items-center">
            <XCircleIcon className="h-5 w-5 text-red-500" />
            Cancelled
          </div>
        ))}
    </div>
  );
}

export function UserChatItem(props: {
  chatItem: StreamingStepInput;
  AIname?: string;
  isLoading?: boolean;
}) {
  const [graphedData, setGraphedData] = useState<GraphData | null>(null);
  const [content, setContent] = useState(props.chatItem.content);
  const [assistantChatObj, setAssistantChatObj] = useState<ParsedOutput>(
    parseOutput(props.chatItem.content),
  );
  const [isJson, setIsJson] = useState(false);

  useEffect(() => {
    if (props.chatItem.role === "function") {
      try {
        const functionJsonResponse = JSON.parse(props.chatItem.content) as Json;
        setIsJson(true);
        setGraphedData(extractGraphData(functionJsonResponse));
        if (functionJsonResponse && typeof functionJsonResponse === "object") {
          setContent(
            convertToRenderable(
              functionJsonResponse,
              `${functionNameToDisplay(props.chatItem?.name ?? "")} result`,
            ),
          );
        }
      } catch {
        let dataToShow = props.chatItem.content.slice(0, 100);
        if (props.chatItem.content.length > 100) dataToShow += "...";
        console.log(`Could not parse data: ${dataToShow} as json`);
        // If not JSON, then there may be a summary
        setContent(props.chatItem.summary ?? props.chatItem.content);
      }
    } else {
      setAssistantChatObj(parseOutput(props.chatItem.content));
    }
  }, [props.chatItem.content]);

  const [tabOpen, setTabOpen] = useState<"table" | "graph">("table");

  const [saveSuccessfulFeedback, setSaveSuccessfulFeedback] = useState(false);
  useEffect(() => {
    if (saveSuccessfulFeedback) {
      setTimeout(() => {
        setSaveSuccessfulFeedback(false);
      }, 3000);
    }
  }, [saveSuccessfulFeedback]);

  useEffect(scrollToBottom, [content, assistantChatObj]);

  return (
    <div
      className={classNames(
        "py-4 px-1.5 rounded flex flex-col w-full",
        "sf-py-2 sf-px-1.5 sf-rounded sf-flex sf-flex-col sf-w-full",
        props.chatItem.role === "user"
          ? "bg-gray-100 text-right place-items-end"
          : "bg-gray-200 text-left place-items-baseline",
        props.chatItem.role === "error"
          ? "bg-red-200"
          : props.chatItem.role === "debug"
          ? "bg-green-100"
          : props.chatItem.role === "function"
          ? "bg-green-200"
          : props.chatItem.role === "confirmation"
          ? "bg-blue-100"
          : "",
      )}
    >
      {graphedData && (
        <div className="-py-4">
          <Tabs tabOpen={tabOpen} setTabOpen={setTabOpen} />{" "}
        </div>
      )}
      <p className="text-xs text-gray-600 mb-1">
        {props.chatItem.role === "assistant"
          ? (props.AIname ?? "Assistant") + " AI"
          : "Function called"}
      </p>
      {content && props.chatItem.role === "function" ? (
        tabOpen === "graph" ? (
          <Graph {...graphedData} />
        ) : isJson ? (
          <StyledMarkdown>{content}</StyledMarkdown>
        ) : (
          <div className="px-2 mt-1 text-little text-gray-900 whitespace-pre-line w-full break-words">
            {content}
          </div>
        )
      ) : (
        <div className="w-full">
          {assistantChatObj.reasoning && (
            <div className="bg-yellow-100 rounded-md px-4 py-2 border border-yellow-300 w-full">
              <p className="flex flex-row gap-x-1.5 text-yellow-800">
                <LightBulbIcon className="h-5 w-5 text-yellow-600" /> Thoughts
              </p>
              <p className="mt-1 text-little whitespace-pre-line break-words text-gray-700">
                </p>
            <div className="sf-bg-yellow-100 sf-rounded-md sf-px-4 sf-py-2 sf-border sf-border-yellow-300 sf-w-full">
              <p className="sf-flex sf-flex-row sf-gap-x-1 sf-text-yellow-800 sf-text-little">
                <LightBulbIcon className="sf-h-5 sf-w-5 sf-text-yellow-600" />{" "}
                Thoughts
              </p>
              <p className="sf-mt-0.5 sf-text-little sf-whitespace-pre-line sf-break-words sf-text-gray-700">
                {assistantChatObj.reasoning}
              </p>
            </div>
            </div>
          )}
          {assistantChatObj.tellUser && (
            <div className="px-2 mt-1 text-little text-gray-900 whitespace-pre-line break-words w-full">
            <div className="sf-px-2 sf-mt-2.5 sf-text-little sf-text-gray-900 sf-whitespace-pre-line sf-break-words sf-w-full">
              {assistantChatObj.tellUser}
            </div>
            </div>
          )}
          {props.isLoading &&
            (!props.chatItem.content ||
              (assistantChatObj.plan && !assistantChatObj.tellUser) ||
              props.chatItem.content.includes("Commands:")) && (
              <div
                className={classNames(
                  "sf-w-full sf-flex sf-flex-row sf-justify-center sf-text-sm",
                  !props.chatItem.content ? "" : "sf-mt-1.5",
                )}
              >
                <div
                  className={classNames(
                    "sf-px-8 sf-py-1 sf-rounded sf-border sf-flex sf-flex-col sf-place-items-center",
                    !props.chatItem.content &&
                      "sf-border-orange-300 sf-bg-orange-200 sf-text-orange-700",
                    assistantChatObj.plan &&
                      !assistantChatObj.tellUser &&
                      "sf-border-blue-300 sf-bg-blue-200 sf-text-blue-700",
                    props.chatItem.content.includes("Commands:") &&
                      "sf-border-purple-300 sf-bg-purple-200 sf-text-purple-700",
                  )}
                >
                  <div className="sf-flex sf-flex-row sf-place-items-center sf-gap-x-1">
                    {!props.chatItem.content ? (
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
        </div>
      )}
    </div>
  )
}

function StyledMarkdown(props: { children: string }) {
  return (
    <></>
    // <ReactMarkdown
    //   className="px-2 mt-1 text-little text-gray-900 whitespace-pre-line w-full"
    //   components={{
    //     a: ({ node, ...props }) => (
    //       <a className="text-blue-500 hover:underline" {...props} />
    //     ),
    //     li: ({ node, ...props }) => (
    //       <li
    //         className="marker:text-gray-700 ml-4 -my-2 text-gray-900 list-decimal"
    //         {...props}
    //       />
    //     ),
    //     p: ({ node, ...props }) => <p className="my-0" {...props} />,
    //     h3: ({ node, ...props }) => (
    //       <h3
    //         className="text-little sm:text-base lg:text-lg text-center w-full font-extrabold text-gray-900 py-2 -mb-6 border bg-gray-50 border-gray-300"
    //         {...props}
    //       />
    //     ),
    //     table: ({ node, ...props }) => (
    //       <table
    //         className="text-center border-collapse w-full divide-y divide-gray-300 border border-gray-300"
    //         {...props}
    //       />
    //     ),
    //     thead: ({ node, ...props }) => (
    //       <thead
    //         className="bg-gray-100 text-xs sm:text-sm lg:text-little text-gray-900 py-2"
    //         {...props}
    //       />
    //     ),
    //     th: ({ node, ...props }) => (
    //       <th
    //         className="border border-gray-300 font-normal px-2 py-2"
    //         {...props}
    //       />
    //     ),
    //     tr: ({ node, ...props }) => (
    //       <tr
    //         className="even:bg-gray-300 border border-gray-300"
    //         {...props}
    //       />
    //     ),
    //     td: ({ node, ...props }) => (
    //       <td
    //         className="bg-gray-200 border border-gray-300 whitespace-wrap px-2 py-2.5 text-xs md:text-sm text-gray-700 break-words break"
    //         style={{ ...props.style, wordBreak: "break-word" }}
    //         {...props}
    //       />
    //     ),
    //   }}
    //   remarkPlugins={[remarkGfm]}
    // >
    //   {props.children}
  );
}

export function Tabs(props: {
  tabOpen: "table" | "graph";
  setTabOpen: (tab: "table" | "graph") => void;
}) {
  return (
    <nav
      className="isolate flex divide-x divide-gray-200 rounded-lg shadow mb-4"
      aria-label="Tabs"
    >
      {["table", "graph"].map((tab, tabIdx) => (
        <a
          key={tab}
          className={classNames(
            props.tabOpen === tab
              ? "text-gray-900"
              : "text-gray-500 hover:text-gray-700",
            tabIdx === 0 ? "rounded-l-lg" : "",
            tabIdx === 1 ? "rounded-r-lg" : "",
            "group relative cursor-pointer min-w-0 flex-1 overflow-hidden bg-white py-2 px-2 text-center text-sm font-sm hover:bg-gray-50 focus:z-10",
          )}
          aria-current={props.tabOpen === tab ? "page" : undefined}
          onClick={() => {
            props.setTabOpen(tabIdx === 0 ? "table" : "graph");
          }}
        >
          <span>{tab}</span>
          <span
            aria-hidden="true"
            className={classNames(
              props.tabOpen === tab ? "bg-indigo-500" : "bg-transparent",
              "absolute inset-x-0 bottom-0 h-0.5",
            )}
          />
        </a>
      ))}
    </nav>
  );
}

function scrollToBottom() {
  if (typeof window !== "undefined") {
    const ele = document.getElementById("scrollable-chat-contents");
    // If the element exists, and it's near the bottom, scroll to the bottom
    if (ele && ele.scrollHeight - ele.scrollTop >= 50) {
      ele.scrollTop = ele.scrollHeight;
    }
  }
}
