import * as React from "react";
import { useEffect, useState } from "react";
import {
  classNames,
  convertToRenderable,
  functionNameToDisplay,
  parseTableTags,
} from "../lib/utils";
import {
  CheckCircleIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  LightBulbIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { parseOutput } from "../lib/parser";
import { StreamingStepInput } from "../lib/types";

const fullRegex = /(<button>.*?<\/button>)|(<table>.*?<\/table>)|([\s\S]+?)/g;
const feedbackRegex = /<button>Feedback<\/button>/;
const buttonRegex = /<button>(?![^<]*<button>)(.*?)<\/button>/;
const tableRegex = /<table>(.*?)<\/table>/;

export function splitContentByParts(content: string): string[] {
  /** We split the message into different parts (based on whether they're a <table>, <button> or just text),
   * and then render parts one-by-one **/
  let match;
  const matches: string[] = [];
  while ((match = fullRegex.exec(content)) !== null) {
    if (match[1]) matches.push(match[1]);
    if (match[2]) matches.push(match[2]);
    if (match[3]) {
      // This is because the 3rd match group is lazy, so only captures 1 character at a time
      const prev = matches[matches.length - 1];
      if (
        matches.length === 0 ||
        (prev.startsWith("<") && prev.endsWith(">"))
      ) {
        matches.push(match[3]);
      } else matches[matches.length - 1] += match[3];
    }
  }
  return matches;
}

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

  const matches = splitContentByParts(content);

  return (
    <div
      className={classNames(
        "py-4 px-1.5 rounded flex flex-col",
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
          : ""
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
          : "Unknown"}
      </p>
      {matches.map((text, idx) => {
        if (feedbackRegex.exec(text) && feedbackRegex.exec(text)!.length > 0) {
          return (
            <div
              key={idx}
              className="my-5 w-full flex flex-col place-items-center gap-y-2"
            >
              Did this response answer your question?
              <div className="flex flex-row gap-x-4">
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`flex flex-row gap-x-1.5 font-medium place-items-center text-gray-50 px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 bg-red-500 ring-red-500 hover:bg-red-600`}
                >
                  <HandThumbDownIcon className="h-5 w-5" />
                  No
                </button>
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`flex flex-row gap-x-1.5 font-medium place-items-center text-gray-50 px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 bg-green-500 ring-green-500 hover:bg-green-600`}
                >
                  <HandThumbUpIcon className="h-5 w-5" />
                  Yes
                </button>
              </div>
              <div
                className={classNames(
                  "flex flex-row place-items-center gap-x-1",
                  saveSuccessfulFeedback ? "visible" : "invisible"
                )}
              >
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div className="text-sm">Thanks for your feedback!</div>
              </div>
            </div>
          );
        }
        const buttonMatches = buttonRegex.exec(text);
        if (buttonMatches && buttonMatches.length > 0) {
          return (
            <div
              key={idx}
              className="my-5 w-full flex flex-col place-items-center gap-y-2"
            >
              <button
                onClick={() => setSaveSuccessfulFeedback(true)}
                className={`px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 ring-purple-600 bg-purple-600 text-white`}
              >
                {buttonMatches[1].trim()}
              </button>
              <div className="flex flex-row place-items-center gap-x-1">
                {saveSuccessfulFeedback && (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <div className="text-sm">Successful!</div>
                  </>
                )}
              </div>
            </div>
          );
        }
        const tableMatches = tableRegex.exec(text);
        if (tableMatches && tableMatches.length > 0) {
          return <Table chatKeyValueText={tableMatches[1]} key={idx} />;
        }
        return (
          <p
            key={idx}
            className="text-little text-gray-900 whitespace-pre-line break-all"
          >
            {text}
          </p>
        );
      })}
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
                saveSuccessfulFeedback ? "visible" : "invisible"
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

export function Table(props: { chatKeyValueText: string }) {
  const parsedValues = parseTableTags(props.chatKeyValueText);

  return (
    <div className="inline-block min-w-full py-4 align-middle sm:px-6 lg:px-8">
      <div className="min-w-full border border-gray-300">
        <table className="w-full divide-y divide-gray-300">
          <caption className="text-md text-gray-900 bg-gray-100 py-2 font-extrabold">
            {parsedValues.find((keyValue) => keyValue.key === "caption")?.value}
          </caption>
          <tbody className="bg-gray-300 rounded-full">
            {parsedValues.map(
              (keyValue) =>
                keyValue.key !== "caption" && (
                  <tr key={keyValue.key} className="even:bg-[#DADDE3]">
                    <td className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-gray-900">
                      {keyValue.key}
                    </td>
                    <td className="whitespace-wrap px-2 py-2.5 text-sm text-gray-700">
                      {keyValue.value}
                    </td>
                  </tr>
                )
            )}
          </tbody>
        </table>
      </div>
    </div>
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
    <div className="py-4 px-1.5 rounded flex flex-col bg-gray-200 text-left place-items-baseline">
      <p className="text-xs text-gray-600 mb-1">
        {(props.AIname ?? "Assistant") + " AI"}
      </p>
      {matches.map((text, idx) => {
        if (feedbackRegex.exec(text) && feedbackRegex.exec(text)!.length > 0) {
          return (
            <div
              key={idx}
              className="my-5 w-full flex flex-col place-items-center gap-y-2"
            >
              Did this response answer your question?
              <div className="flex flex-row gap-x-4">
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`flex flex-row gap-x-1.5 font-medium place-items-center text-gray-50 px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 bg-red-500 ring-red-500 hover:bg-red-600`}
                >
                  <HandThumbDownIcon className="h-5 w-5" />
                  No
                </button>
                <button
                  onClick={() => setSaveSuccessfulFeedback(true)}
                  className={`flex flex-row gap-x-1.5 font-medium place-items-center text-gray-50 px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 bg-green-500 ring-green-500 hover:bg-green-600`}
                >
                  <HandThumbUpIcon className="h-5 w-5" />
                  Yes
                </button>
              </div>
              <div
                className={classNames(
                  "flex flex-row place-items-center gap-x-1",
                  saveSuccessfulFeedback ? "visible" : "invisible"
                )}
              >
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <div className="text-sm">Thanks for your feedback!</div>
              </div>
            </div>
          );
        }
        const buttonMatches = buttonRegex.exec(text);
        if (buttonMatches && buttonMatches.length > 0) {
          return (
            <div
              key={idx}
              className="my-5 w-full flex flex-col place-items-center gap-y-2"
            >
              <button
                onClick={() => setSaveSuccessfulFeedback(true)}
                className={`px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2 ring-purple-600 bg-purple-600 text-white`}
              >
                {buttonMatches[1].trim()}
              </button>
              <div className="flex flex-row place-items-center gap-x-1">
                {saveSuccessfulFeedback && (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                    <div className="text-sm">Successful!</div>
                  </>
                )}
              </div>
            </div>
          );
        }
        const tableMatches = tableRegex.exec(text);
        if (tableMatches && tableMatches.length > 0) {
          return <Table chatKeyValueText={tableMatches[1]} key={idx} />;
        }
        return (
          <div key={idx} className="w-full">
            {outputObj.reasoning && (
              <div className="bg-yellow-100 rounded-md px-4 py-2 border border-yellow-300 w-full">
                <p className="flex flex-row gap-x-1.5 text-yellow-800">
                  <LightBulbIcon className="h-5 w-5 text-yellow-600" /> Thoughts
                </p>
                <p className="mt-1 text-little whitespace-pre-line text-gray-700">
                  {outputObj.reasoning}
                </p>
              </div>
            )}
            {outputObj.tellUser && (
              <p
                key={idx}
                className="px-2 mt-3 text-base text-gray-900 whitespace-pre-line w-full"
              >
                {outputObj.tellUser}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
