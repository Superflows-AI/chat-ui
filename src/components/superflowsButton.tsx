import { classNames } from "../lib/utils";
import { SparklesIcon } from "@heroicons/react/24/outline";
import ChatBotSlideover from "./chatBotSlideover";
import { useState } from "react";
import { Styling } from "../lib/types";
import * as React from "react";

export default function SuperflowsButton(props: {
  superflowsApiKey: string;
  hostname?: string;
  language?: "English" | "Espanol";
  AIname?: string;
  userApiKey?: string;
  userDescription?: string;
  suggestions?: string[];
  devMode?: boolean;
  testMode?: boolean;
  styling?: Styling;
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
          className="h-5 w-5"
          style={{ height: "1.25rem", width: "1.25rem" }}
          aria-hidden="true"
        />
      </button>
      {/* <ChatBotSlideover open={open} setOpen={setOpen} {...props} /> */}
    </>
  );
}
