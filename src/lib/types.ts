export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export type ChatItem =
  | StreamingStep
  | {
      role: "user";
      content: string;
    };

export interface SidebarStyle {
  slideoverSide?: "right" | "left";
  buttonColor?: string;
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

export interface ButtonProps {
  superflowsApiKey: string;
  superflowsUrl?: string;
  AIname?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  mockApiResponses?: boolean;
  styling?: SidebarStyle;
  buttonStyling?: string; // TODO: weird mismatch in type between this and styling
  initialMessage?: string;
  welcomeText?: string;
}
