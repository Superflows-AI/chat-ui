import React, { Fragment, ReactNode } from "react";
import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/solid";
import Chat from "./chat";
import { ModalStyle, SuperflowsModalProps } from "../lib/types";

export default function SuperflowsModal(props: SuperflowsModalProps) {
  const focusRef = React.useRef(null);

  return (
    <Dialog
      open={props.open}
      as="div"
      className="relative z-30"
      onClose={props.setOpen}
      initialFocus={focusRef}
    >
      <Transition
        show={props.open}
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </Transition>

      <div className="fixed inset-0 z-10">
        <div
          className="flex min-h-full max-h-screen items-end justify-center p-4 text-center sm:items-center cursor-pointer"
          onClick={() => {
            props.setOpen(false);
          }}
        >
          <Transition
            show={props.open}
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Overlay
              as={"div"}
              className={classNames(
                "relative h-[90vh] bg-gray-50 max-w-5xl transform rounded-lg text-left shadow-xl transition-all sm:my-8 sm:w-full",
                props.styling?.modalClasses ?? "",
              )}
            >
              <div
                className="h-full px-4 pb-2 pt-5 sm:p-6 sm:pb-3 flex flex-col cursor-default"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <button
                  className="absolute top-2.5 right-2.5 bg-transparent"
                  onClick={() => props.setOpen(false)}
                >
                  <XMarkIcon className="h-8 w-8 text-gray-300 rounded-md hover:bg-gray-500 hover:opacity-50 p-1 transition focus:outline-0" />
                </button>
                <div className="w-full flex flex-row gap-x-2.5 border-b border-gray-200 pb-1.5">
                  <SparklesIcon className="h-8 w-8 text-gray-500" />
                  <Dialog.Title className="text-xl font-medium">
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
