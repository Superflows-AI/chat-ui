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

export interface Styling {
  brandColor?: string;
  slideoverSide?: "right" | "left";
  // This sets the colour of the text on the header of the react. Set "dark" if using a white background
  sidebarHeaderTextColor?: "dark" | "light";
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
