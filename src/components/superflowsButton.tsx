import React, { useState } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { SparklesIcon as SparklesSolidIcon } from "@heroicons/react/24/solid";
import SuperflowsSidebar from "./sidebar";
import SuperflowsModal from "./modal";
import { ButtonProps } from "../lib/types";

export default function SuperflowsButton(props: ButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {props.styling?.solidIcon ? (
        <SparklesSolidIcon
          className={`p-1 focus:outline-none cursor-pointer bg-transparent text-gray-500 hover:text-[#146ef5] h-7 w-7 ${
            props.buttonStyling ?? ""
          }`}
          aria-hidden="true"
          onClick={() => setOpen(!open)}
        />
      ) : (
        <SparklesIcon
          className={`p-1 focus:outline-none cursor-pointer bg-transparent text-gray-500 hover:text-[#146ef5] h-7 w-7 ${
            props.buttonStyling ?? ""
          }`}
          aria-hidden="true"
          onClick={() => setOpen(!open)}
        />
      )}
      {props.styling?.type === "sidebar" ? (
        <SuperflowsSidebar open={open} setOpen={setOpen} {...props} />
      ) : (
        <SuperflowsModal open={open} setOpen={setOpen} {...props} />
      )}
    </>
  );
}
