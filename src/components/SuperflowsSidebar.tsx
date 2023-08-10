import * as React from "react";
import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
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
  SidebarStyle,
} from "../lib/types";
import { DevChatItem, UserChatItem } from "./chatItems";

export default function SuperflowsSidebar(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
  superflowsApiKey: string;
  superflowsUrl?: string;
  AIname?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  mockApiResponses?: boolean;
  styling?: SidebarStyle;
}) {
  const ref = useRef(null);
  const [userText, setUserText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // This is a hack to prevent the effect from running twice in development
  // It's because React strict mode runs in development in nextjs, which renders everything
  // twice to check for bugs/side effects (not sure if this is needed any more)
  const alreadyRunning = useRef(false);

  // TODO: Grab suggestions from DB if none are provided
  // Get suggestions from past conversations
  // const [suggestions, setSuggestions] = useState<string[]>(props.suggestions ?? []);

  const [conversationId, setConversationId] = useState<number | null>(null);
  const [devChatContents, setDevChatContents] = useState<StreamingStepInput[]>(
    [],
  );

  useEffect(() => {
    const ele = document.getElementById("scrollable-chat-contents");
    // If the element exists, and it's near the bottom, scroll to the bottom
    if (ele && ele.scrollHeight - ele.scrollTop >= 50) {
      ele.scrollTop = ele.scrollHeight;
    }
  }, [devChatContents]);

  const killSwitchClicked = useRef(false);

  const hostname = props.superflowsUrl ?? "https://dashboard.superflows.ai";

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
        let responseJson: { error: string };
        if (response.status === 404) {
          responseJson = {
            error: `${response.status}: ${response.statusText}. Check the hostname used is correct ${response.url}`,
          };
        } else {
          try {
            responseJson = (await response.json()) as {
              error: string;
            };
          } catch (e) {
            responseJson = {
              error: `${response.status}: ${response.statusText}`,
            };
          }
        }

        console.error(responseJson.error);
        setDevChatContents([
          ...chat,
          {
            role: "error",
            content: responseJson.error,
          },
        ]);
        setLoading(false);
        return;
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
    ],
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
    ],
  );

  return (
    //    eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //    @ts-ignore
    <Dialog
      open={props.open}
      as="div"
      className="sf-relative sf-z-50"
      onClose={props.setOpen}
      initialFocus={ref}
    >
      <div
        className={classNames(
          "sf-pointer-events-none sf-fixed sf-inset-y-0 sf-flex sf-max-w-full",
          props.styling?.slideoverSide === "left" ? "sf-left-0" : "sf-right-0",
        )}
      >
        <Transition
          show={props.open}
          as={Fragment}
          enter="sf-transform sf-transition sf-ease-in-out sf-duration-200 sm:sf-duration-200"
          enterFrom={
            props.styling?.slideoverSide === "left"
              ? "sf--translate-x-full"
              : "sf-translate-x-full"
          }
          enterTo="sf-translate-x-0"
          leave="sf-transform sf-transition sf-ease-in-out sf-duration-200 sm:sf-duration-200"
          leaveFrom="sf-translate-x-0"
          leaveTo={
            props.styling?.slideoverSide === "left"
              ? "sf--translate-x-full"
              : "sf-translate-x-full"
          }
        >
          <Dialog.Overlay className="sf-pointer-events-auto sf-w-screen md:sf-w-96">
            <div className="sf-flex sf-h-full sf-flex-col sf-divide-y sf-divide-gray-200 sf-bg-white sf-shadow-xl">
              <div className="sf-flex sf-min-h-0 sf-flex-1 sf-flex-col sf-pb-1">
                <div
                  className={classNames(
                    `sf-py-4 sf-px-3 sf-min-h-[3.75rem] sf-text-gray-900 sf-border-b sf-border-gray-200`,
                  )}
                  style={{
                    backgroundColor: props.styling?.headerBackgroundColor,
                    color: props.styling?.headerTextColor,
                  }}
                >
                  <div className="sf-relative sf-flex sf-flex-row sf-place-items-center sf-justify-center">
                    <Dialog.Title
                      className={classNames(
                        "sf-block sf-text-xl sf-font-semibold sf-leading-6",
                      )}
                    >
                      {props.AIname ?? "Chatbot"}
                    </Dialog.Title>
                    <div
                      className={classNames(
                        "sf-absolute sf-top-0 sf-flex sf-h-7 sf-items-center sf-right-0",
                        // Only set on the left if screen is large and sidebar on the left
                        props.styling?.slideoverSide === "left"
                          ? ""
                          : "md:sf-left-0",
                      )}
                    >
                      <button
                        type="button"
                        className="sf-p-1.5 sf-rounded-md sf-text-gray-400 hover:sf-text-gray-700 hover:sf-bg-gray-100 hover:sf-opacity-60 sf-transition focus:sf-outline-none focus:sf-ring-2 focus:sf-ring-gray-500"
                        onClick={() => props.setOpen(false)}
                      >
                        <span className="sf-sr-only">Close panel</span>
                        {props.styling?.slideoverSide === "left" ? (
                          <ChevronLeftIcon
                            className="sf-h-6 sf-w-6 sf-hidden md:sf-block"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronRightIcon
                            className="sf-h-6 sf-w-6 sf-hidden md:sf-block"
                            aria-hidden="true"
                          />
                        )}
                        <XMarkIcon
                          className="sf-h-6 sf-w-6 sf-block md:sf-hidden"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="sf-relative sf-overflow-y-auto sf-h-full sf-flex sf-flex-col"
                  id={"scrollable-chat-contents"}
                >
                  {/* Show clear chat button only when there is chat to clear */}
                  {devChatContents.length > 0 && (
                    <button
                      className={
                        "sf-absolute sf-top-2 sf-right-2 sf-flex sf-flex-row sf-place-items-center sf-gap-x-1 sf-px-2 sf-py-1 sf-rounded-md sf-bg-white sf-border focus:sf-outline-none focus:sf-ring-2 focus:sf-ring-gray-500 sf-transition sf-border-gray-300 hover:sf-border-gray-400 sf-text-gray-500 hover:sf-text-gray-600"
                      }
                      onClick={() => {
                        setDevChatContents([]);
                      }}
                    >
                      <ArrowPathIcon className="sf-h-4 sf-w-4" /> Clear chat
                    </button>
                  )}
                  <div className="sf-mt-6 sf-flex-1 sf-px-1 sf-shrink-0 sf-flex sf-flex-col sf-justify-end sf-gap-y-2">
                    {devChatContents.map((chatItem, idx) => {
                      if (
                        props.devMode ||
                        ["error", "confirmation", "user"].includes(
                          chatItem.role,
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
                          chatItem.content,
                        ) as Json;
                        if (
                          // Empty array
                          (Array.isArray(functionJsonResponse) &&
                            functionJsonResponse.length === 0) ||
                          // Empty object
                          (functionJsonResponse &&
                            typeof functionJsonResponse === "object" &&
                            Object.entries(functionJsonResponse).length === 0)
                        ) {
                          if (
                            devChatContents[idx - 1].role === "function" ||
                            devChatContents[idx + 1]?.role === "function"
                          ) {
                            // If the function call is adjacent to other function calls we don't need to tell them it
                            // was empty - otherwise we get a lot of empty messages clogging up the chat interface
                            return (
                              <div key={idx.toString() + chatItem.content} />
                            );
                          }
                          contentString = "No data returned";
                        } else if (
                          functionJsonResponse &&
                          typeof functionJsonResponse === "object"
                        ) {
                          contentString = chatItem.content;
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
                        <div className="sf-py-4 sf-px-1.5">
                          <h2 className="sf-ml-2 sf-font-medium">
                            Suggestions
                          </h2>
                          <div className="sf-mt-1 sf-flex sf-flex-col sf-gap-y-2 sf-place-items-baseline">
                            {props.suggestions.map((text) => (
                              <button
                                key={text}
                                className="sf-text-left sf-px-2 sf-py-1 sf-rounded-md sf-border sf-bg-white sf-text-little sf-text-gray-800 sf-shadow hover:sf-shadow-md"
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
              <div className="sf-flex sf-flex-col sf-pt-4">
                <AutoGrowingTextArea
                  className={classNames(
                    "sf-text-sm sf-resize-none sf-mx-1 sf-rounded sf-py-2 sf-px-4 sf-border-gray-300 sf-border focus:sf-ring-1 focus:sf-outline-0 placeholder:sf-text-gray-400",
                    userText.length > 300
                      ? "sf-overflow-auto-y"
                      : "sf-overflow-hidden",
                    props.styling?.buttonColor
                      ? `focus:sf-border-gray-500 focus:sf-ring-gray-500`
                      : "focus:sf-border-purple-300 focus:sf-ring-purple-300",
                  )}
                  placeholder={"Send a message"}
                  value={userText}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setUserText(e.target.value)
                  }
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
                <div className="sf-flex sf-flex-shrink-0 sf-w-full sf-justify-between sf-px-1 sf-pb-4 sf-pt-2">
                  <button
                    className={classNames(
                      "sf-flex sf-flex-row sf-gap-x-1 sf-place-items-center sf-ml-4 sf-justify-center sf-select-none focus:sf-outline-0 sf-rounded-md sf-px-3 sf-py-2 sf-text-sm sf-shadow-sm sf-border",
                      loading
                        ? "sf-text-gray-500 sf-bg-gray-100 hover:sf-bg-gray-200 sf-border-gray-300"
                        : "sf-invisible",
                    )}
                    onClick={() => {
                      killSwitchClicked.current = true;
                      alreadyRunning.current = false;
                      setLoading(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    ref={ref}
                    type="submit"
                    className={classNames(
                      "sf-flex sf-flex-row sf-gap-x-1 sf-place-items-center sf-ml-4 sf-justify-center sf-select-none focus:sf-outline-0 sf-rounded-md sf-px-3 sf-py-2 sf-text-sm sf-font-semibold sf-text-white sf-shadow-sm",
                      loading || userText.length <= 3
                        ? "sf-bg-gray-500 sf-cursor-not-allowed"
                        : `hover:sf-opacity-90 focus:sf-outline focus:sf-outline-2 focus:sf-outline-offset-2 focus:sf-outline-sky-500`,
                      !props.styling?.buttonColor &&
                        !(loading || userText.length <= 3) &&
                        "sf-bg-purple-500",
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
                    style={
                      props.styling?.buttonColor &&
                      !(loading || userText.length <= 3)
                        ? { backgroundColor: props.styling?.buttonColor }
                        : {}
                    }
                  >
                    {loading && <LoadingSpinner classes="sf-h-4 sf-w-4" />}
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </Dialog.Overlay>
        </Transition>
      </div>
    </Dialog>
  );
}
