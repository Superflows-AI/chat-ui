import { Ref } from "react";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type ChatItemType =
  | StreamingStep
  | {
      role: "user";
      content: string;
    };

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

export type ChatGPTMessage =
  | {
      role: "system" | "user" | "assistant";
      content: string;
    }
  | {
      role: "function";
      content: string;
      name: string;
      summary?: string;
    };

type NonSystemGPTMessage = Exclude<ChatGPTMessage, { role: "system" }>;

export type StreamingStepInput =
  | NonSystemGPTMessage
  | { role: "error" | "debug" | "confirmation"; content: string };
export type StreamingStep = StreamingStepInput & { id: number };

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
  AIname?: string;
  styling?: SuperflowsStyle;
  buttonStyling?: string; // TODO: weird mismatch in type between this and styling
}

export interface ChatProps {
  superflowsApiKey: string;
  superflowsUrl?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  mockApiResponses?: boolean;
  styling?: ChatStyle;
  initialMessage?: string;
  welcomeText?: string;
  initialFocus?: Ref<any>;
}
