import { Ref } from "react";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

type ContentString = {
  content: string;
};

export type ChatItemType =
  | StreamingStep
  | ({
      role: "user";
    } & ContentString);

export type SuperflowsStyle = {
  solidIcon?: boolean;
} & (
  | ({
      type: "sidebar";
    } & SidebarStyle)
  | ({
      type: "modal";
    } & ModalStyle)
);

export type ModalStyle = { modalClasses?: string } & HeaderStyle & ChatStyle;

export type SidebarStyle = {
  slideoverSide?: "right" | "left";
} & HeaderStyle &
  ChatStyle;

export interface ChatStyle {
  buttonColor?: string;
}

interface HeaderStyle {
  headerBackgroundColor?: string;
  headerTextColor?: string;
}

export type AssistantMessage = { role: "assistant"; content: string };
export type UserMessage = { role: "user"; content: string };
type SystemMessage = { role: "system"; content: string };

export type ChatGPTMessage =
  | SystemMessage
  | AssistantMessage
  | UserMessage
  | {
      role: "function";
      content: string;
      name: string;
      summary?: string;
      urls?: { name: string; url: string }[];
    };

type NonSystemGPTMessage = Exclude<ChatGPTMessage, { role: "system" }>;

export interface GraphMessage {
  role: "graph";
  content: GraphData;
}

export type ErrorMessage = {
  role: "error";
} & ContentString;
export type DebugMessage = {
  role: "debug";
} & ContentString;
export type ConfirmationMessage = {
  role: "confirmation";
} & ContentString;
export type LoadingMessage = {
  role: "loading";
} & ContentString;

export type StreamingStepInput =
  | NonSystemGPTMessage
  | ErrorMessage
  | DebugMessage
  | ConfirmationMessage
  | LoadingMessage
  | GraphMessage;
export type StreamingStep = StreamingStepInput & { id: number };

export type SupportedGraphTypes = "line" | "bar" | "table" | "value";

export interface GraphData {
  type: SupportedGraphTypes;
  data: { x: number | string; y: number }[];
  xLabel?: string;
  yLabel?: string;
  graphTitle?: string | number;
  xIsdate?: boolean;
}

export type SuperflowsModalProps = PrebuiltComponentProps & {
  styling?: ModalStyle;
};

export type SuperflowsSidebarProps = PrebuiltComponentProps & {
  styling?: SidebarStyle;
};

type PrebuiltComponentProps = ButtonProps & {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export interface ButtonProps extends Omit<ChatProps, "initialFocus"> {
  styling?: SuperflowsStyle;
  buttonStyling?: string; // TODO: weird mismatch in type between this and styling
}

export interface ChatProps {
  AIname?: string;
  superflowsApiKey: string;
  superflowsUrl?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  mockApiResponses?: boolean;
  styling?: ChatStyle;
  initialMessage?: string;
  userId?: string;
  welcomeText?: string;
  apiParams?: {
    name: string;
    hostname?: string;
    headers?: Record<string, string>;
  }[];
  initialFocus?: Ref<any>;
  textBelowInput?: string;
  showThoughts?: boolean;
  showFunctionCalls?: boolean;
  enableSpeech?: boolean;
  speechLanguage?: string;
  debugMode?: boolean;
}
