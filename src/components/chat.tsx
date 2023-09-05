import * as React from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { DevChatItem, UserChatItem } from "./chatItems";
import {
  ChatItem,
  ChatProps,
  ChatStyle,
  Json,
  StreamingStep,
  StreamingStepInput,
} from "../lib/types";
import { AutoGrowingTextArea } from "./autoGrowingTextarea";
import { classNames } from "../lib/utils";
import { LoadingSpinner } from "./loadingspinner";
import { useCallback, useEffect, useRef, useState } from "react";

export default function Chat(props: ChatProps) {
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
    props.welcomeText
      ? [{ role: "assistant", content: props.welcomeText }]
      : [],
  );

  const killSwitchClicked = useRef(false);

  const hostname = props.superflowsUrl ?? "https://dashboard.superflows.ai";

  useEffect(() => {
    if (props.initialMessage) {
      callSuperflowsApi([
        ...devChatContents,
        { role: "user", content: props.initialMessage },
      ]);
    }
  }, []);

  const callSuperflowsApi = useCallback(
    async (chat: StreamingStepInput[]) => {
      // Below adds a message so the loading spinner comes up while we're waiting
      setDevChatContents([...chat, { role: "assistant", content: "" }]);
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
                // Different message role from the last message
                data.role !== outputMessages[outputMessages.length - 1]?.role ||
                // Not the assistant (e.g. function, debug etc where the entire contents of a message is 1 chunk)
                data.role !== "assistant" ||
                // Includes explicit new message tag
                data.content.includes("<<[NEW-MESSAGE]>>")
              ) {
                if (data.content.includes("<<[NEW-MESSAGE]>>"))
                  data.content = data.content.replace("<<[NEW-MESSAGE]>>", "");
                // Add new message
                outputMessages.push({ ...data });
              } else {
                // Append message data to preceding message
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
      const response = await fetch(new URL("/api/v1/confirm", hostname).href, {
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
    <div className="flex min-h-0 h-full w-full flex-1 flex-col">
      <div
        className="relative overflow-y-auto h-full flex flex-col flex-1 pb-1"
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
              setConversationId(null);
            }}
          >
            <ArrowPathIcon className="h-4 w-4" /> Clear chat
          </button>
        )}
        <div className="mt-6 flex-1 px-1 shrink-0 flex flex-col justify-end gap-y-2">
          {devChatContents.map((chatItem: StreamingStepInput, idx: number) => {
            if (
              props.devMode ||
              ["error", "confirmation", "user"].includes(chatItem.role)
            ) {
              return (
                <DevChatItem
                  key={idx.toString()}
                  chatItem={chatItem}
                  onConfirm={onConfirm}
                />
              );
            } else if (chatItem.role === "debug") return <></>;
            else if (chatItem.role === "function") {
              let contentString = chatItem.content;
              let functionJsonResponse: Json;
              try {
                functionJsonResponse = JSON.parse(chatItem.content) as Json;
              } catch {
                functionJsonResponse = chatItem.content;
              }
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
                  devChatContents[idx - 1]?.role === "function" ||
                  devChatContents[idx + 1]?.role === "function"
                ) {
                  // If the function call is adjacent to other function calls we don't need to tell them it
                  // was empty - otherwise we get a lot of empty messages clogging up the chat interface
                  return <div key={idx.toString()} />;
                }
                contentString = "No data returned";
              }
              return (
                <UserChatItem
                  chatItem={{
                    ...chatItem,
                    content: contentString,
                  }}
                  key={idx.toString()}
                />
              );
            }
            return (
              <UserChatItem
                chatItem={chatItem}
                key={idx.toString()}
                // Below ensures that loading spinner is only shown on the message currently streaming in
                isLoading={loading && idx === devChatContents.length - 1}
              />
            );
          })}
          {(devChatContents.length === 0 ||
            (devChatContents.length === 1 && props.welcomeText)) &&
            props.suggestions &&
            props.suggestions.length > 0 && (
              <div className="py-4 px-1.5">
                <h2 className="ml-2 font-medium"></h2>
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
      {/* Textbox user types into */}
      <div className="flex flex-col pt-4">
        <AutoGrowingTextArea
          className={classNames(
            "text-sm resize-none mx-1 rounded py-2 px-4 border-gray-300 border focus:ring-1 focus:outline-0 placeholder:text-gray-400",
            userText.length > 300 ? "overflow-auto-y" : "overflow-hidden",
            props.styling?.buttonColor
              ? `focus:border-gray-500 focus:ring-gray-500`
              : "focus:border-purple-300 focus:ring-purple-300",
          )}
          placeholder={"Send a message"}
          value={userText}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setUserText(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (userText) {
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
          <button
            className={classNames(
              "flex flex-row gap-x-1 place-items-center ml-4 justify-center select-none focus:outline-0 rounded-md px-3 py-2 text-sm shadow-sm border",
              loading
                ? "text-gray-500 bg-gray-100 hover:bg-gray-200 border-gray-300"
                : "invisible",
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
            ref={props.initialFocus}
            type="submit"
            className={classNames(
              "flex flex-row gap-x-1 place-items-center ml-4 justify-center select-none focus:outline-0 rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm",
              loading || !userText
                ? "bg-gray-500 cursor-not-allowed"
                : `hover:opacity-90 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-sky-500`,
              !props.styling?.buttonColor &&
                !(loading || !userText) &&
                "bg-purple-500",
            )}
            onClick={() => {
              if (!loading && userText) {
                void callSuperflowsApi([
                  ...devChatContents,
                  { role: "user", content: userText },
                ]);
                setUserText("");
                killSwitchClicked.current = false;
              }
            }}
            style={
              props.styling?.buttonColor && !(loading || !userText)
                ? { backgroundColor: props.styling?.buttonColor }
                : {}
            }
          >
            {loading && <LoadingSpinner classes="h-4 w-4" />}
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
