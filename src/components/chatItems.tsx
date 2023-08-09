import {
  CheckCircleIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import * as React from "react";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { parseOutput } from "../lib/parser";
import { Json, StreamingStepInput } from "../lib/types";
import {
  classNames,
  convertToRenderable,
  functionNameToDisplay,
  splitContentByParts,
} from "../lib/utils";
import { Graph, GraphData, extractGraphData } from "./graph";

export interface FunctionCall {
  name: string;
  args: { [key: string]: any };
}

export interface ToConfirm extends FunctionCall {
  actionId: number;
}

const feedbackRegex = /<button>Feedback<\/button>/;
const buttonRegex = /<button>(?![^<]*<button>)(.*?)<\/button>/;

export function DevChatItem(props: {
  chatItem: StreamingStepInput;
  AIname?: string;
  onConfirm?: (confirm: boolean) => Promise<void>;
}) {
  let graphedData: GraphData | null = null;
  let content = props.chatItem.content;
  if (!content) return <></>;

  if (props.chatItem.role === "confirmation") {
    const toConfirm = JSON.parse(props.chatItem.content) as ToConfirm[];
    content = `The following action${
      toConfirm.length > 1 ? "s require" : " requires"
    } confirmation:\n\n${toConfirm
      .map((action) => {
        return `${convertToRenderable(
          action.args,
          functionNameToDisplay(action.name)
        )}`;
      })
      .join("")}`;
  }

  if (props.chatItem.role === "function") {
    graphedData = extractGraphData(props.chatItem.content);
    try {
      const functionJsonResponse = JSON.parse(props.chatItem.content) as Json;
      if (functionJsonResponse && typeof functionJsonResponse === "object") {
        content = convertToRenderable(
          functionJsonResponse,
          `${functionNameToDisplay(props.chatItem?.name ?? "")} result`
        );
      }
    } catch {}
  }

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

  const [tabOpen, setTabOpen] = useState<"table" | "graph">("table");

  const matches = splitContentByParts(content);

  return (
    <>
      <div
        className={classNames(
          "sf-py-4 sf-px-1.5 sf-rounded sf-flex sf-flex-col  sf-w-full",
          props.chatItem.role === "user"
            ? "sf-bg-gray-100 sf-text-right sf-place-items-end"
            : "sf-bg-gray-200 sf-text-left sf-place-items-baseline",
          props.chatItem.role === "error"
            ? "sf-bg-red-200"
            : props.chatItem.role === "debug"
            ? "sf-bg-green-100"
            : props.chatItem.role === "function"
            ? "sf-bg-green-200"
            : props.chatItem.role === "confirmation"
            ? "sf-bg-blue-100"
            : ""
        )}
      >
        {graphedData && (
          <div className="-sf-py-4">
            <Tabs setTabOpen={setTabOpen} />{" "}
          </div>
        )}
        <p className="sf-text-xs sf-text-gray-600 sf-mb-1">
          {props.chatItem.role === "assistant"
            ? (props.AIname ?? "Assistant") + " AI"
            : props.chatItem.role === "function" && tabOpen === "table"
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
        {matches.map((text, idx) => {
          if (
            feedbackRegex.exec(text) &&
            feedbackRegex.exec(text)!.length > 0
          ) {
            return (
              <div
                key={idx}
                className="sf-my-5 sf-w-full sf-flex sf-flex-col sf-place-items-center sf-gap-y-2"
              >
                Did this response answer your question?
                <div className="sf-flex sf-flex-row sf-gap-x-4">
                  <button
                    onClick={() => setSaveSuccessfulFeedback(true)}
                    className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-50 sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-red-500 sf-ring-red-500 hover:sf-bg-red-600`}
                  >
                    <HandThumbDownIcon className="sf-h-5 sf-w-5" />
                    No
                  </button>
                  <button
                    onClick={() => setSaveSuccessfulFeedback(true)}
                    className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-50 sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-green-500 sf-ring-green-500 hover:sf-bg-green-600`}
                  >
                    <HandThumbUpIcon className="sf-h-5 sf-w-5" />
                    Yes
                  </button>
                </div>
                <div
                  className={classNames(
                    "sf-flex sf-flex-row sf-place-items-center sf-gap-x-1",
                    saveSuccessfulFeedback ? "sf-visible" : "sf-invisible"
                  )}
                >
                  <CheckCircleIcon className="sf-h-5 sf-w-5 sf-text-green-500" />
                  <div className="sf-text-sm">Thanks for your feedback!</div>
                </div>
              </div>
            );
          }
          const buttonMatches = buttonRegex.exec(text);
          if (buttonMatches && buttonMatches.length > 0) {
            return (
              <div
                key={idx}
                className="sf-my-5 sf-w-full sf-flex sf-flex-col sf-place-items-center sf-gap-y-2"
              >
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-ring-purple-600 sf-bg-purple-600 sf-text-white`}
                >
                  {buttonMatches[1].trim()}
                </button>
                <div className="sf-flex sf-flex-row sf-place-items-center sf-gap-x-1">
                  {saveSuccessfulFeedback && (
                    <>
                      <CheckCircleIcon className="sf-h-5 sf-w-5 sf-text-green-500" />
                      <div className="sf-text-sm">Successful!</div>
                    </>
                  )}
                </div>
              </div>
            );
          }

          if (tabOpen === "graph") return <Graph {...graphedData} />;
          else return <StyledMarkdown key={idx}>{text}</StyledMarkdown>;
        })}
        {props.onConfirm &&
          props.chatItem.role === "confirmation" &&
          (confirmed === null ? (
            <div className="sf-my-5 sf-w-full sf-flex sf-flex-col sf-place-items-center sf-gap-y-2">
              Are you sure you want to continue?
              <div className="sf-flex sf-flex-row sf-gap-x-8">
                <button
                  onClick={() => {
                    setConfirmed(false);
                    void props.onConfirm!(false);
                  }}
                  className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-700 sf-px-4 sf-border sf-border-gray-400 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-gray-100 sf-ring-gray-500 hover:sf-bg-gray-200`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmed(true);
                    void props.onConfirm!(true);
                  }}
                  className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-50 sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-blue-500 sf-ring-blue-500 hover:sf-bg-blue-600`}
                >
                  Confirm
                </button>
              </div>
              <div
                className={classNames(
                  "sf-flex sf-flex-row sf-place-items-center sf-gap-x-1",
                  saveSuccessfulFeedback ? "sf-visible" : "sf-invisible"
                )}
              >
                <CheckCircleIcon className="sf-h-5 sf-w-5 sf-text-green-500" />
                <div className="sf-text-sm">Thanks for your feedback!</div>
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
    </>
  );
}

export function UserChatItem(props: {
  chatItem: StreamingStepInput;
  AIname?: string;
}) {
  const [saveSuccessfulFeedback, setSaveSuccessfulFeedback] = useState(false);
  useEffect(() => {
    if (saveSuccessfulFeedback) {
      setTimeout(() => {
        setSaveSuccessfulFeedback(false);
      }, 3000);
    }
  }, [saveSuccessfulFeedback]);
  if (!props.chatItem.content) return <></>;
  const matches = splitContentByParts(props.chatItem.content);

  const outputObj = parseOutput(props.chatItem.content);
  return (
    <div className="sf-py-4 sf-px-1.5 sf-rounded sf-flex sf-flex-col sf-bg-gray-200 sf-text-left sf-place-items-baseline">
      <p className="sf-text-xs sf-text-gray-600 sf-mb-1">
        {(props.AIname ?? "Assistant") + " AI"}
      </p>
      {matches.map((text, idx) => {
        if (feedbackRegex.exec(text) && feedbackRegex.exec(text)!.length > 0) {
          return (
            <div
              key={idx}
              className="sf-my-5 sf-w-full sf-flex sf-flex-col sf-place-items-center sf-gap-y-2"
            >
              Did this response answer your question?
              <div className="sf-flex sf-flex-row sf-gap-x-4">
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-50 sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-red-500 sf-ring-red-500 hover:sf-bg-red-600`}
                >
                  <HandThumbDownIcon className="sf-h-5 sf-w-5" />
                  No
                </button>
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`sf-flex sf-flex-row sf-gap-x-1.5 sf-font-medium sf-place-items-center sf-text-gray-50 sf-px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-bg-green-500 sf-ring-green-500 hover:sf-bg-green-600`}
                >
                  <HandThumbUpIcon className="sf-h-5 sf-w-5" />
                  Yes
                </button>
              </div>
              <div
                className={classNames(
                  "sf-flex sf-flex-row sf-place-items-center sf-gap-x-1",
                  saveSuccessfulFeedback ? "sf-visible" : "sf-invisible"
                )}
              >
                <CheckCircleIcon className="sf-h-5 sf-w-5 sf-text-green-500" />
                <div className="sf-text-sm">Thanks for your feedback!</div>
              </div>
            </div>
          );
        }
        const buttonMatches = buttonRegex.exec(text);
        if (buttonMatches && buttonMatches.length > 0) {
          return (
            <div
              key={idx}
              className="sf-my-5 sf-w-full sf-flex sf-flex-col sf-place-items-center sf-gap-y-2"
            >
              <button
                onClick={() => setSaveSuccessfulFeedback(true)}
                className={`px-4 sf-rounded-md sf-py-2 sf-text-base hover:sf-opacity-90 sf-transition focus:sf-ring-2 focus:sf-ring-offset-2 sf-ring-purple-600 sf-bg-purple-600 sf-text-white`}
              >
                {buttonMatches[1].trim()}
              </button>
              <div className="sf-flex sf-flex-row sf-place-items-center sf-gap-x-1">
                {saveSuccessfulFeedback && (
                  <>
                    <CheckCircleIcon className="sf-h-5 sf-w-5 sf-text-green-500" />
                    <div className="sf-text-sm">Successful!</div>
                  </>
                )}
              </div>
            </div>
          );
        }
        return (
          <div key={idx} className="sf-w-full">
            {outputObj.reasoning && (
              <div className="sf-bg-yellow-100 sf-rounded-md sf-px-4 sf-py-2 sf-border sf-border-yellow-300 sf-w-full">
                <p className="sf-flex sf-flex-row sf-gap-x-1.5 sf-text-yellow-800">
                  <LightBulbIcon className="sf-h-5 sf-w-5 sf-text-yellow-600" />{" "}
                  Thoughts
                </p>
                <p className="sf-mt-1 sf-text-little sf-whitespace-pre-line sf-text-gray-700">
                  {outputObj.reasoning}
                </p>
              </div>
            )}
            {outputObj.tellUser && (
              <StyledMarkdown>{outputObj.tellUser}</StyledMarkdown>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StyledMarkdown(props: { children: string }) {
  return (
    <ReactMarkdown
      className="sf-px-2 sf-mt-3 sf-text-little sf-text-gray-900 sf-whitespace-pre-line sf-w-full"
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
            className="sf-border sf-border-gray-300 sf-font-normal sf-px-2 sf-py-2"
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
            className="sf-bg-gray-200 sf-border sf-border-gray-300 sf-whitespace-wrap sf-px-2 sf-py-2.5 sf-text-xs md:sf-text-sm sf-text-gray-700 sf-break-words sf-break"
            style={{ ...props.style, wordBreak: "break-word" }}
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

const tabs = [
  { name: "Table", current: true },
  { name: "Graph", current: false },
];

export function Tabs(props: { setTabOpen: (tab: "table" | "graph") => void }) {
  return (
    <nav
      className="isolate sf-flex sf-divide-x sf-divide-gray-200 sf-rounded-lg sf-shadow sf-mb-4"
      aria-label="Tabs"
    >
      {tabs.map((tab, tabIdx) => (
        <a
          key={tab.name}
          className={classNames(
            tab.current
              ? "sf-text-gray-900"
              : "sf-text-gray-500 hover:sf-text-gray-700",
            tabIdx === 0 ? "sf-rounded-l-lg" : "",
            tabIdx === tabs.length - 1 ? "sf-rounded-r-lg" : "",
            "group sf-relative cursor-pointer sf-min-w-0 sf-flex-1 sf-overflow-hidden sf-bg-white sf-py-2 sf-px-2 sf-text-center sf-text-sm sf-font-sm hover:sf-bg-gray-50 focus:sf-z-10"
          )}
          aria-current={tab.current ? "page" : undefined}
          onClick={() => {
            tabs[tabIdx].current = true;
            tabs[Number(!tabIdx)].current = false;
            props.setTabOpen(tabIdx === 0 ? "table" : "graph");
          }}
        >
          <span>{tab.name}</span>
          <span
            aria-hidden="true"
            className={classNames(
              tab.current ? "sf-bg-indigo-500" : "sf-bg-transparent",
              "sf-absolute sf-inset-x-0 sf-bottom-0 sf-h-0.5"
            )}
          />
        </a>
      ))}
    </nav>
  );
}
