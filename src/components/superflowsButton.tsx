import * as React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import SuperflowsSidebar from "./SuperflowsSidebar";
import { useState } from "react";
import { ButtonProps } from "../lib/types";

export default function SuperflowsButton(props: ButtonProps) {
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
