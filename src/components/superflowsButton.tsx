import * as React from "react";
import { classNames } from "../lib/utils";
import { SparklesIcon } from "@heroicons/react/24/outline";
import SuperflowsSidebar from "./SuperflowsSidebar";
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
  mockApiResponses?: boolean;
  styling?: Styling;
  buttonStyling?: string; // TODO: weird mismatch in type between this and styling
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={classNames(
          "sf-p-1 focus:sf-outline-none sf-bg-transparent sf-text-gray-500 hover:sf-text-[#146ef5]"
        )}
        onClick={() => setOpen(!open)}
      >
        <SparklesIcon
          className={props.buttonStyling || "sf-h-5 sf-w-5"}
          aria-hidden="true"
        />
      </button>
      <SuperflowsSidebar open={open} setOpen={setOpen} {...props} />
    </>
  );
}
