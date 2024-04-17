import SuperflowsButton from "./components/superflowsButton";
import SuperflowsSidebar from "./components/sidebar";
import SuperflowsModal from "./components/modal";
import SuperflowsChat from "./components/chat";
import FollowUpSuggestions from "./components/followUpSuggestions";
import SuperflowsChatItem, {
  PlainTextChatItem,
  AssistantChatItem,
} from "./components/chatItems";
import {
  getLastSectionName,
  parseFunctionCall,
  parseOutput,
} from "./lib/parser";
import type { FunctionCall } from "./lib/parser";

import { convertToMarkdownTable, functionNameToDisplay } from "./lib/utils";
import "./index.css";

export {
  SuperflowsButton,
  PlainTextChatItem,
  AssistantChatItem,
  functionNameToDisplay,
  convertToMarkdownTable,
  parseFunctionCall,
  FunctionCall,
  getLastSectionName,
  parseOutput,
  FollowUpSuggestions,
  SuperflowsSidebar,
  SuperflowsModal,
  SuperflowsChat,
  SuperflowsChatItem,
}; // Add more exports here
