import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Chat from "./chat";
import { SuperflowsModalProps } from "../lib/types";

export default function SuperflowsModal(props: SuperflowsModalProps) {
  const focusRef = React.useRef(null);

  return (
    <Dialog
      open={props.open}
      as="div"
      className="superflows-styling sf-relative sf-z-30"
      onClose={props.setOpen}
      initialFocus={focusRef}
    >
      <Transition
        show={props.open}
        as={Fragment}
        enter="sf-ease-out sf-duration-300"
        enterFrom="sf-opacity-0"
        enterTo="sf-opacity-100"
        leave="sf-ease-in sf-duration-200"
        leaveFrom="sf-opacity-100"
        leaveTo="sf-opacity-0"
      >
        <div className="sf-fixed sf-inset-0 sf-bg-gray-500 sf-bg-opacity-75 sf-transition-opacity" />
      </Transition>

      <div className="sf-fixed sf-inset-0 sf-z-10">
        <div
          className="sf-flex sf-min-h-full sf-max-h-screen sf-items-end sf-justify-center sf-p-4 sf-text-center sm:sf-items-center sf-cursor-pointer"
          onClick={() => {
            props.setOpen(false);
          }}
        >
          <Transition
            show={props.open}
            as={Fragment}
            enter="sf-ease-out sf-duration-300"
            enterFrom="sf-opacity-0 sf-translate-y-4 sm:sf-translate-y-0 sm:sf-scale-95"
            enterTo="sf-opacity-100 sf-translate-y-0 sm:sf-scale-100"
            leave="sf-ease-in sf-duration-200"
            leaveFrom="sf-opacity-100 sf-translate-y-0 sm:sf-scale-100"
            leaveTo="sf-opacity-0 sf-translate-y-4 sm:sf-translate-y-0 sm:sf-scale-95"
          >
            <Dialog.Overlay
              as={"div"}
              className={classNames(
                "sf-relative sf-h-[90vh] sf-bg-[#fdfdfe] sf-max-w-5xl sf-transform sf-rounded-lg sf-text-left sf-shadow-xl sf-transition-all sm:sf-my-8 sm:sf-w-full",
                props.styling?.modalClasses ?? "",
              )}
            >
              <div
                className="sf-h-full sf-px-4 sm:sf-px-6 sf-pt-5 sm:sf-pt-6 sf-flex sf-flex-col sf-cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  className="sf-absolute sf-top-2.5 sf-right-2.5 sf-bg-transparent"
                  onClick={() => props.setOpen(false)}
                >
                  <XMarkIcon className="sf-h-8 sf-w-8 sf-text-gray-300 sf-rounded-md hover:sf-bg-gray-500 hover:sf-opacity-50 sf-p-1 sf-transition focus:sf-outline-0" />
                </button>
                <div className="sf-w-full sf-flex sf-flex-row sf-gap-x-2.5 sf-border-b sf-border-gray-200 sf-pb-1.5">
                  <SparklesIcon className="sf-h-8 sf-w-8 sf-text-gray-500" />
                  <Dialog.Title className="sf-text-xl sf-font-medium sf-text-gray-900">
                    {props.AIname} AI
                  </Dialog.Title>
                </div>
                <Chat {...props} initialFocus={focusRef} />
              </div>
            </Dialog.Overlay>
          </Transition>
        </div>
      </div>
    </Dialog>
  );
}
