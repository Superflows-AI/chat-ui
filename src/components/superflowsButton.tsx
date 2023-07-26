import * as React from "react";
import { classNames } from "../lib/utils";
import { SparklesIcon } from "@heroicons/react/24/outline";
import ChatBotSlideover from "./chatBotSlideover";
import { useState } from "react";
import { Styling } from "../lib/types";

export default function SuperflowsButton(props: {
  superflowsApiKey: string;
  hostname?: string;
  AIname?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  testMode?: boolean;
  styling?: Styling;
  buttonStyling?: string; // TODO: weird mismatch in type between this and styling
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={classNames(
          "something p-1 focus:outline-none bg-transparent text-gray-500 hover:text-[#146ef5]"
        )}
        onClick={() => setOpen(!open)}
      >
        <SparklesIcon
          className={props.buttonStyling || "h-5 w-5"}
          aria-hidden="true"
        />
      </button>
      <ChatBotSlideover open={open} setOpen={setOpen} {...props} />
    </>
  );
}
