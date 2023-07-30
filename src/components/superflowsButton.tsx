import * as React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import SuperflowsSidebar from "./SuperflowsSidebar";
import { useState } from "react";
import { SidebarStyle } from "../lib/types";

export default function SuperflowsButton(props: {
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
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SparklesIcon
        className={`sf-p-1 focus:sf-outline-none sf-cursor-pointer sf-bg-transparent sf-text-gray-500 hover:sf-text-[#146ef5] sf-h-7 sf-w-7 ${props.buttonStyling}`}
        aria-hidden="true"
        onClick={() => setOpen(!open)}
      />
      <SuperflowsSidebar open={open} setOpen={setOpen} {...props} />
    </>
  );
}
