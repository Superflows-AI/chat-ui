import { StreamingStepInput } from "../lib/types";
import React, { useEffect } from "react";
import { scrollToBottom } from "../lib/utils";

export default function FollowUpSuggestions(props: {
  devChatContents: StreamingStepInput[];
  followUpSuggestions: string[];
  onClick: (text: string) => void;
}) {
  useEffect(() => {
    setTimeout(() => {
      scrollToBottom("smooth");
    }, 50);
  }, [props.followUpSuggestions]);

  return (
    <div className="sf-z-20 sf-overflow-hidden sf--mb-3 sf-pb-0.5 sf-mx-1.5 sf-mt-0.5 sf-flex sf-flex-col sf-gap-y-1 sf-place-items-baseline">
      {props.followUpSuggestions.map((text) => (
        <button
          key={text}
          className="sf-text-left sf-px-2 sf-py-1 sf-rounded-md sf-border sf-bg-white sf-text-sm sf-text-gray-800 sf-transition sf-shadow hover:sf-border-gray-400"
          onClick={() => props.onClick(text)}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
