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
    };

type NonSystemGPTMessage = Exclude<ChatGPTMessage, { role: "system" }>;

export type StreamingStepInput =
  | NonSystemGPTMessage
  | { role: "error" | "debug" | "confirmation"; content: string };
export type StreamingStep = StreamingStepInput & { id: number };
