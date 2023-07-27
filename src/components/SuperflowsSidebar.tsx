import * as React from "react";
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { LoadingSpinner } from "./loadingspinner";
import {
  classNames,
  convertToRenderable,
  functionNameToDisplay,
} from "../lib/utils";
import { AutoGrowingTextArea } from "./autoGrowingTextarea";
import {
  ChatItem,
  Json,
  StreamingStep,
  StreamingStepInput,
  Styling,
} from "../lib/types";
import { DevChatItem, UserChatItem } from "./chatItems";

export default function SuperflowsSidebar(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  superflowsApiKey: string;
  hostname?: string;
  AIname?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  mockApiResponses?: boolean;
  styling?: Styling;
}) {
  const ref = useRef(null);
  const [userText, setUserText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // This is a hack to prevent the effect from running twice in development
  // It's because React strict mode runs in development, which renders everything
  // twice to check for bugs/side effects
  const alreadyRunning = useRef(false);

  // TODO: Grab suggestions from DB if none are provided
  // Get suggestions from past conversations
  // const [suggestions, setSuggestions] = useState<string[]>(props.suggestions ?? []);

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [devChatContents, setDevChatContents] = useState<StreamingStepInput[]>(
    []
  );

  useEffect(() => {
    const ele = document.getElementById("scrollable-chat-contents");
    // If the element exists, and it's near the bottom, scroll to the bottom
    if (ele && ele.scrollHeight - ele.scrollTop >= 50) {
      ele.scrollTop = ele.scrollHeight;
    }
  }, [devChatContents]);

  const killSwitchClicked = useRef(false);

  const hostname = props.hostname ?? "https://dashboard.superflows.ai";

  const callSuperflowsApi = useCallback(
    async (chat: StreamingStepInput[]) => {
      setDevChatContents(chat);
      if (loading || alreadyRunning.current) return;
      alreadyRunning.current = true;
      setLoading(true);
      const response = await fetch(new URL("/api/v1/answers", hostname).href, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.superflowsApiKey}`,
        },
        body: JSON.stringify({
          user_input: chat[chat.length - 1].content,
          conversation_id: conversationId,
          user_api_key: props.userApiKey,
          user_description: props.userDescription,
          mock_api_responses: props.mockApiResponses ?? false,
          stream: true,
        }),
      });

      if (!response.ok) {
        const responseJson: { error: string } = (await response.json()) as {
          error: string;
        };
        throw new Error(responseJson.error);
      }

      const data = response.body;
      if (!data) return;

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;
      const outputMessages = [{ role: "assistant", content: "" }] as ChatItem[];

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading || killSwitchClicked.current;
        const chunkValue = decoder.decode(value);
        try {
          // Can be multiple server-side chunks in one client-side chunk,
          // separated by "data:". The .slice(5) removes the "data:" at
          // the start of the string
          chunkValue
            .slice(5)
            .split("data:")
            .forEach((chunkOfChunk) => {
              if (chunkOfChunk.length === 0) return;
              const data = JSON.parse(chunkOfChunk) as StreamingStep;
              if (conversationId === null) setConversationId(data.id);
              if (
                data.role !== outputMessages[outputMessages.length - 1]?.role
              ) {
                outputMessages.push({ ...data });
              } else {
                outputMessages[outputMessages.length - 1].content +=
                  data.content;
              }
              setDevChatContents([...chat, ...outputMessages]);
            });
        } catch (e) {
          console.error(e);
        }
      }
      // TODO: Add a confirmation step when taking non-GET actions
      setLoading(false);
      alreadyRunning.current = false;
      killSwitchClicked.current = false;
    },
    [
      props.userApiKey,
      props.userDescription,
      loading,
      setLoading,
      devChatContents,
      setDevChatContents,
      killSwitchClicked.current,
      alreadyRunning.current,
    ]
  );
  const onConfirm = useCallback(
    async (confirm: boolean): Promise<void> => {
      setLoading(true);
      const response = await fetch("/api/v1/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${props.superflowsApiKey}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          user_api_key: props.userApiKey ?? "", // Need a fallback or zod fails
          confirm: confirm,
          mock_api_responses: props.mockApiResponses,
        }),
      });

      const json = (await response.json()) as {
        outs: StreamingStepInput[];
        error: string;
      };
      if (response.status === 200) {
        const newChat = [...devChatContents, ...json.outs];
        setDevChatContents(newChat);
        if (confirm) {
          // TODO: This adds an empty message to the DB and GPT chat history.
          //  This is hacky, since all we actually want to do is restart Angela with the existing
          //  chat history. We should refactor this to do that instead.
          await callSuperflowsApi([...newChat, { role: "user", content: "" }]);
        }
      } else {
        // Handle errors here - add them to chat
        console.error(json.error);
        setDevChatContents((prevState) => [
          ...prevState,
          {
            role: "error",
            content: json.error,
          },
        ]);
      }

      setLoading(false);
    },
    [
      devChatContents,
      setDevChatContents,
      callSuperflowsApi,
      conversationId,
      setLoading,
      props.userApiKey,
      props.mockApiResponses,
    ]
  );

  return (
    <Transition.Root show={props.open} as={Fragment}>
      {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
      {/* @ts-ignore */}
      <Dialog
        as="div"
        className="relative z-50"
        onClose={props.setOpen}
        initialFocus={ref}
      >
        <div className="fixed inset-0" />
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div
              className={classNames(
                "pointer-events-none fixed inset-y-0 flex max-w-full",
                props.styling?.slideoverSide === "left" ? "left-0" : "right-0"
              )}
            >
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-200 sm:duration-200"
                enterFrom={
                  props.styling?.slideoverSide === "left"
                    ? "-translate-x-full"
                    : "translate-x-full"
                }
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-200 sm:duration-200"
                leaveFrom="translate-x-0"
                leaveTo={
                  props.styling?.slideoverSide === "left"
                    ? "-translate-x-full"
                    : "translate-x-full"
                }
              >
                <Dialog.Panel className="pointer-events-auto w-96">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="flex min-h-0 flex-1 flex-col pb-1">
                      <div
                        className={classNames(
                          `py-4 px-3 min-h-[3.75rem]`,
                          props.styling?.sidebarHeaderTextColor === "light"
                            ? "text-gray-50"
                            : "text-gray-900 border-b border-gray-200"
                        )}
                        style={{ backgroundColor: props.styling?.brandColor }}
                      >
                        <div className="relative flex flex-row place-items-center justify-center">
                          <Dialog.Title
                            className={classNames(
                              "block text-xl font-semibold leading-6"
                            )}
                          >
                            {props.AIname ?? "Chatbot"}
                          </Dialog.Title>
                          <div
                            className={classNames(
                              "absolute top-0 left-0 flex h-7 items-center",
                              props.styling?.slideoverSide === "right"
                                ? "order-first"
                                : "order-last"
                            )}
                          >
                            <button
                              type="button"
                              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:opacity-60 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                              onClick={() => props.setOpen(false)}
                            >
                              <span className="sr-only">Close panel</span>
                              {props.styling?.slideoverSide === "left" ? (
                                <ChevronLeftIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ChevronRightIcon
                                  className="h-6 w-6"
                                  aria-hidden="true"
                                />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div
                        className="relative overflow-y-auto h-full flex flex-col"
                        id={"scrollable-chat-contents"}
                      >
                        {/* Show clear chat button only when there is chat to clear */}
                        {devChatContents.length > 0 && (
                          <button
                            className={
                              "absolute top-2 right-2 flex flex-row place-items-center gap-x-1 px-2 py-1 rounded-md bg-white border focus:outline-none focus:ring-2 focus:ring-gray-500 transition border-gray-300 hover:border-gray-400 text-gray-500 hover:text-gray-600"
                            }
                            onClick={() => {
                              setDevChatContents([]);
                            }}
                          >
                            <ArrowPathIcon className="h-4 w-4" /> Clear chat
                          </button>
                        )}
                        <div className="mt-6 flex-1 px-1 shrink-0 flex flex-col justify-end gap-y-2">
                          {devChatContents.map((chatItem, idx) => {
                            if (
                              props.devMode ||
                              ["error", "confirmation", "user"].includes(
                                chatItem.role
                              )
                            ) {
                              return (
                                <DevChatItem
                                  key={idx.toString() + chatItem.content}
                                  chatItem={chatItem}
                                  onConfirm={onConfirm}
                                />
                              );
                            } else if (chatItem.role === "debug") return <></>;
                            else if (chatItem.role === "function") {
                              let contentString = "";
                              const functionJsonResponse = JSON.parse(
                                chatItem.content
                              ) as Json;
                              if (
                                // Empty array
                                (Array.isArray(functionJsonResponse) &&
                                  functionJsonResponse.length === 0) ||
                                // Empty object
                                (functionJsonResponse &&
                                  typeof functionJsonResponse === "object" &&
                                  Object.entries(functionJsonResponse)
                                    .length === 0)
                              ) {
                                if (
                                  devChatContents[idx - 1].role ===
                                    "function" ||
                                  devChatContents[idx + 1].role === "function"
                                ) {
                                  // If the function call is adjacent to other function calls we don't need to tell them it
                                  // was empty - otherwise we get a lot of empty messages clogging up the chat interface
                                  return (
                                    <div
                                      key={idx.toString() + chatItem.content}
                                    />
                                  );
                                }
                                contentString = "No data returned";
                              } else if (
                                functionJsonResponse &&
                                typeof functionJsonResponse === "object"
                              ) {
                                contentString = convertToRenderable(
                                  functionJsonResponse,
                                  `${functionNameToDisplay(
                                    chatItem?.name ?? ""
                                  )} result`
                                );
                              }
                              return (
                                <DevChatItem
                                  chatItem={{
                                    ...chatItem,
                                    content: contentString,
                                  }}
                                  key={idx.toString() + chatItem.content}
                                />
                              );
                            }
                            return (
                              <UserChatItem
                                chatItem={chatItem}
                                key={idx.toString() + chatItem.content}
                              />
                            );
                          })}
                          {devChatContents.length === 0 &&
                            props.suggestions &&
                            props.suggestions.length > 0 && (
                              <div className="py-4 px-1.5">
                                <h2 className="ml-2 font-medium">
                                  Suggestions
                                </h2>
                                <div className="mt-1 flex flex-col gap-y-2 place-items-baseline">
                                  {props.suggestions.map((text) => (
                                    <button
                                      key={text}
                                      className="text-left px-2 py-1 rounded-md border bg-white text-little text-gray-800 shadow hover:shadow-md"
                                      onClick={() => setUserText(text)}
                                    >
                                      {text}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    {/* Textbox user types into */}
                    <div className="flex flex-col pt-4">
                      <AutoGrowingTextArea
                        className={classNames(
                          "text-sm resize-none mx-1 rounded py-2 border-gray-300 focus:border-purple-300 focus:ring-1 focus:ring-purple-300 placeholder:text-gray-400",
                          userText.length > 300
                            ? "overflow-auto-y"
                            : "overflow-hidden"
                        )}
                        placeholder={"Send a message"}
                        value={userText}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setUserText(e.target.value)
                        }
                        onKeyDown={(
                          e: React.KeyboardEvent<HTMLTextAreaElement>
                        ) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (userText.length > 3) {
                              void callSuperflowsApi([
                                ...devChatContents,
                                { role: "user", content: userText },
                              ]);
                              setUserText("");
                            }
                          }
                        }}
                      />
                      <div className="flex flex-shrink-0 w-full justify-between px-1 pb-4 pt-2">
                        {
                          <button
                            className={classNames(
                              "flex flex-row gap-x-1 place-items-center ml-4 justify-center rounded-md px-3 py-2 text-sm text-gray-500 shadow-sm bg-gray-100 border border-gray-300",
                              !loading
                                ? "bg-gray-200 cursor-not-allowed"
                                : "hover:bg-gray-200 "
                            )}
                            onClick={() => {
                              killSwitchClicked.current = true;
                              alreadyRunning.current = false;
                              setLoading(false);
                            }}
                          >
                            Cancel
                          </button>
                        }
                        <button
                          ref={ref}
                          type="submit"
                          className={classNames(
                            "flex flex-row gap-x-1 place-items-center ml-4 justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm",
                            loading || userText.length <= 3
                              ? "bg-gray-500 cursor-not-allowed"
                              : `hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 bg-purple-500`
                          )}
                          onClick={() => {
                            if (!loading && userText.length > 3) {
                              void callSuperflowsApi([
                                ...devChatContents,
                                { role: "user", content: userText },
                              ]);
                              setUserText("");
                              killSwitchClicked.current = false;
                            }
                          }}
                        >
                          {loading && <LoadingSpinner classes="h-4 w-4" />}
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
