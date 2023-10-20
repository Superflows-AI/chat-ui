import { StreamingStepInput } from "../lib/types";
import { Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { scrollToBottom } from "../lib/utils";

export function FollowUpSuggestions(props: {
  devChatContents: StreamingStepInput[];
  followUpSuggestions: string[];
  onClick: (text: string) => void;
}) {
  const [localFollowUps, setLocalFollowUps] = useState<string[]>([]);

  useEffect(() => {
    setLocalFollowUps(props.followUpSuggestions);
    setTimeout(() => {
      scrollToBottom("smooth");
    }, 50);
  }, [props.followUpSuggestions]);

  return (
    <Transition
      show={
        props.devChatContents.length > 2 && props.followUpSuggestions.length > 0
      }
      as={Fragment}
    >
      <div className="sf-overflow-hidden sf--mb-2.5 sf-pb-1 sf-mx-1.5 sf-mt-1 sf-flex sf-flex-col sf-gap-y-1 sf-place-items-baseline">
        {localFollowUps.map((text) => (
          <button
            key={text}
            className="sf-text-left sf-px-2 sf-py-1 sf-rounded-md sf-border sf-bg-white sf-text-sm sf-text-gray-800 sf-transition sf-shadow hover:sf-border-gray-400"
            onClick={() => props.onClick(text)}
          >
            {text}
          </button>
        ))}
      </div>
    </Transition>
  );
}
