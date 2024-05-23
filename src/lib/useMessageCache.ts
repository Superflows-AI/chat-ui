import { StreamingStepInput } from "./types";
import React, { useCallback } from "react";

export default function useMessageCache(
  setConversationId: React.Dispatch<React.SetStateAction<number>>,
  setDevChatContents: React.Dispatch<
    React.SetStateAction<StreamingStepInput[]>
  >,
  superflowsApiKey: string,
) {
  const TIME_TO_EXPIRE_MINS = 15;

  function isExpired(date: Date) {
    const expirationDate = new Date(
      Date.now() - TIME_TO_EXPIRE_MINS * 60 * 1000,
    );
    return date < expirationDate;
  }

  const getMessagesFromCache = useCallback(() => {
    const cachedConversationString = localStorage.getItem(
      `conversationCache_${superflowsApiKey}`,
    );

    if (!cachedConversationString) return;

    const cachedConversation: {
      conversationId: number;
      messages: StreamingStepInput[];
      updated: Date;
    } = JSON.parse(cachedConversationString);
    cachedConversation.updated = new Date(cachedConversation.updated);

    if (!cachedConversation) return;

    if (
      !isExpired(cachedConversation.updated) &&
      cachedConversation?.messages.length
    ) {
      setConversationId(cachedConversation.conversationId);
      setDevChatContents(cachedConversation.messages);
    }
  }, [setConversationId, setDevChatContents, superflowsApiKey]);

  const updateMessagesCache = useCallback(
    (conversationId: number | null, messages: StreamingStepInput[]) => {
      if (!conversationId) {
        return;
      }

      const cachedConversation: {
        conversationId: number;
        messages: StreamingStepInput[];
        updated: Date;
      } = {
        conversationId: conversationId,
        messages: messages,
        updated: new Date(),
      };

      localStorage.setItem(
        `conversationCache_${superflowsApiKey}`,
        JSON.stringify(cachedConversation),
      );
    },
    [superflowsApiKey],
  );

  const clearMessageCache = useCallback(() => {
    localStorage.removeItem(`conversationCache_${superflowsApiKey}`);
  }, [superflowsApiKey]);

  const updateDevChatContents = useCallback(
    (conversationId: number | null, messages: StreamingStepInput[]) => {
      setDevChatContents(messages);
      updateMessagesCache(
        conversationId,
        messages.filter((m) => m.role !== "loading"),
      );
    },
    [setDevChatContents, updateMessagesCache],
  );

  return { clearMessageCache, updateDevChatContents, getMessagesFromCache };
}
