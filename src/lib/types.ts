export type StreamingStep =
  | { role: "assistant" | "error" | "debug"; content: string; id: number }
  | { role: "function"; name: string; content: string; id: number };

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
