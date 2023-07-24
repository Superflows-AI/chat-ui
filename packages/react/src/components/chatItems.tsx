import { useEffect, useState } from "react";
import { classNames, parseKeyValues } from "../lib/utils";
import {
  CheckCircleIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import { parseOutput } from "../lib/parser";
import { ChatItem } from "../lib/types";

const fullRegex = /(<button>.*?<\/button>)|(<table>.*?<\/table>)|([^<]+)/g;
const confirmRegex = /<button>Confirm<\/button>/;
const buttonRegex = /<button>(.*?)<\/button>/;
const tableRegex = /<table>(.*?)<\/table>/;

const BrandColourAction = "#5664d1";
const BrandActionTextColour = "#ffffff";

export function DevChatItem(props: { chatItem: ChatItem; AIname?: string }) {
  const [saveSuccessfulFeedback, setSaveSuccessfulFeedback] = useState(false);
  useEffect(() => {
    if (saveSuccessfulFeedback) {
      setTimeout(() => {
        setSaveSuccessfulFeedback(false);
      }, 3000);
    }
  }, [saveSuccessfulFeedback]);
  let match;
  let matches = [];
  while ((match = fullRegex.exec(props.chatItem.content)) !== null) {
    if (match[1]) matches.push(match[1]);
    if (match[2]) matches.push(match[2]);
    if (match[3]) matches.push(match[3].trim());
  }
  // TODO: if it's a function call, hide it from the user
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
          ? "bg-purple-100"
          : "",
      )}
    >
      <p className="text-xs text-gray-600 mb-1">
        {props.chatItem.role === "assistant"
          ? props.AIname
          : props.chatItem.role === "function"
          ? "Function called"
          : props.chatItem.role === "user"
          ? "You"
          : props.chatItem.role === "debug"
          ? "Debug"
          : props.chatItem.role === "error"
          ? "Error"
          : "Unknown"}
      </p>
      {matches.map((text, idx) => {
        if (confirmRegex.exec(text) && confirmRegex.exec(text)!.length > 0) {
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
                  saveSuccessfulFeedback ? "visible" : "invisible",
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
                className={`px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2`}
                style={{
                  backgroundColor: BrandColourAction,
                  color: BrandActionTextColour,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  "--tw-ring-color": BrandColourAction,
                }}
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
    </div>
  );
}

function Table(props: { chatKeyValueText: string }) {
  const parsedValues = parseKeyValues(props.chatKeyValueText);

  return (
    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
      <table className="min-w-full divide-y divide-gray-300">
        <tbody className="bg-gray-300 rounded-full">
          {parsedValues.map((keyValue) => (
            <tr key={keyValue.key} className="even:bg-[#DADDE3]">
              <td className="whitespace-nowrap px-3 py-2.5 text-sm font-medium text-gray-900">
                {keyValue.key}
              </td>
              <td className="whitespace-wrap px-2 py-2.5 text-sm text-gray-700">
                {keyValue.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function UserChatItem(props: { chatItem: ChatItem; AIname?: string }) {
  const [saveSuccessfulFeedback, setSaveSuccessfulFeedback] = useState(false);
  useEffect(() => {
    if (saveSuccessfulFeedback) {
      setTimeout(() => {
        setSaveSuccessfulFeedback(false);
      }, 3000);
    }
  }, [saveSuccessfulFeedback]);
  let match;
  const matches = [];
  while ((match = fullRegex.exec(props.chatItem.content)) !== null) {
    if (match[1]) matches.push(match[1]);
    if (match[2]) matches.push(match[2]);
    if (match[3]) matches.push(match[3].trim());
  }
  const outputObj = parseOutput(props.chatItem.content);
  return (
    <div className="py-4 px-1.5 rounded flex flex-col bg-gray-200 text-left place-items-baseline">
      {props.AIname && (
        <p className="text-xs text-gray-600 mb-1">{props.AIname}</p>
      )}
      {matches.map((text, idx) => {
        if (confirmRegex.exec(text) && confirmRegex.exec(text)!.length > 0) {
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
                  saveSuccessfulFeedback ? "visible" : "invisible",
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
                className={`px-4 rounded-md py-2 text-base hover:opacity-90 transition focus:ring-2 focus:ring-offset-2`}
                style={{
                  backgroundColor: BrandColourAction,
                  color: BrandActionTextColour,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  "--tw-ring-color": BrandColourAction,
                }}
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
          <>
            <div className="bg-yellow-100 rounded-md px-4 py-2 border border-yellow-300 w-full">
              <p className="flex flex-row gap-x-1.5 text-yellow-800">
                <LightBulbIcon className="h-5 w-5 text-yellow-600" /> Thoughts
              </p>
              <p className="mt-1 text-little whitespace-pre-line text-gray-700">
                {outputObj.reasoning}
              </p>
            </div>
            {outputObj.tellUser && (
              <p
                key={idx}
                className="px-2 mt-3 text-base text-gray-900 whitespace-pre-line"
              >
                {outputObj.tellUser}
              </p>
            )}
          </>
        );
      })}
    </div>
  );
}
