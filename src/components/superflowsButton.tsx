import * as React from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolidIcon } from "@heroicons/react/24/solid";
import SuperflowsSidebar from "./sidebar";
import { useState } from "react";
import SuperflowsModal from "./modal";
import { ButtonProps } from "../lib/types";

export default function SuperflowsButton(props: ButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className={"superflows-styling"}>
      {props.styling?.solidIcon ? (
        <SparklesSolidIcon
          className={`sf-p-1 focus:sf-outline-none sf-cursor-pointer sf-bg-transparent sf-text-gray-500 hover:sf-text-[#146ef5] sf-h-7 sf-w-7 ${props.buttonStyling}`}
          aria-hidden="true"
          onClick={() => setOpen(!open)}
        />
      ) : (
        <SparklesIcon
          className={`sf-p-1 focus:sf-outline-none sf-cursor-pointer sf-bg-transparent sf-text-gray-500 hover:sf-text-[#146ef5] sf-h-7 sf-w-7 ${props.buttonStyling}`}
          aria-hidden="true"
          onClick={() => setOpen(!open)}
        />
      )}
      {props.styling?.type === "sidebar" ? (
        <SuperflowsSidebar open={open} setOpen={setOpen} {...props} />
      ) : (
        <SuperflowsModal open={open} setOpen={setOpen} {...props} />
      )}
    </div>
  );
}
