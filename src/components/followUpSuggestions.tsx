import { StreamingStepInput } from "../lib/types";
import React, { useEffect } from "react";
import { classNames, scrollToBottom } from "../lib/utils";

export default function FollowUpSuggestions(props: {
  devChatContents: StreamingStepInput[];
  followUpSuggestions: string[];
  onClick: (text: string) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  width: number;
}) {
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom(props.scrollRef, "smooth");
    }, 50);
  }, [props.followUpSuggestions]);

  return (
    <div
      className={classNames(
        "sf-z-20 sf-gap-y-1 sf-border-t sf-pt-1 sf--mb-3.5 sf-pb-1 sf-mx-1.5 sf-mt-0.5 sf-flex sf-gap-x-1.5 sf-place-items-baseline",
        props.width > 640
          ? "sf-flex-row sf-overflow-hidden sf-flex-wrap"
          : "sf-flex-col",
      )}
    >
      {props.followUpSuggestions.map((text) => (
        <button
          key={text}
          className="sf-text-left sf-px-2 sf-py-1 sf-rounded-md sf-shrink-0 sf-border sf-bg-white sf-text-sm sf-text-gray-800 sf-transition sf-shadow hover:sf-border-gray-400"
          onClick={() => props.onClick(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
