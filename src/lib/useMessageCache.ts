import { StreamingStepInput } from "./types";

function useMessageCache(
  setConversationId: React.Dispatch<React.SetStateAction<number>>,
  setDevChatContents: React.Dispatch<
    React.SetStateAction<StreamingStepInput[]>
  >,
) {
  const TIME_TO_EXPIRE_MINS = 15;

  function isExpired(date: Date) {
    const expirationDate = new Date(
      Date.now() - TIME_TO_EXPIRE_MINS * 60 * 1000,
    );
    return date < expirationDate;
  }

  const getMessagesFromCache = () => {
    const cachedConversationString = localStorage.getItem("conversationCache");

    if (!cachedConversationString) return;

    const cachedConversation: {
      conversationId: number;
      messages: StreamingStepInput[];
      updated: Date;
    } = JSON.parse(cachedConversationString);
    cachedConversation.updated = new Date(cachedConversation.updated);

    if (!cachedConversation) return;

    console.log(!isExpired(cachedConversation.updated));
    if (
      !isExpired(cachedConversation.updated) &&
      cachedConversation?.messages.length
    ) {
      setConversationId(cachedConversation.conversationId);
      setDevChatContents(cachedConversation.messages);
    }
  };

  const updateMessagesCache = (
    conversationId: number | null,
    messages: StreamingStepInput[],
  ) => {
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
      "conversationCache",
      JSON.stringify(cachedConversation),
    );
  };

  const clearMessageCache = () => {
    localStorage.removeItem("conversationCache");
  };

  const updateDevChatContents = (
    conversationId: number | null,
    messages: StreamingStepInput[],
  ) => {
    setDevChatContents(messages);
    updateMessagesCache(conversationId, messages);
  };

  return { clearMessageCache, updateDevChatContents, getMessagesFromCache };
}

export default useMessageCache;
