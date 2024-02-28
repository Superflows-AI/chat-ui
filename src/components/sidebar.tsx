import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { classNames } from "../lib/utils";
import { SuperflowsSidebarProps } from "../lib/types";
import Chat from "./chat";

export default function SuperflowsSidebar(props: SuperflowsSidebarProps) {
  const focusRef = useRef(null);
  return (
    <Dialog
      open={props.open}
      as="div"
      className="superflows-styling sf-relative sf-z-50"
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
        <div
          className="sf-fixed sf-inset-0 sf-cursor-pointer sf-bg-gray-500 sf-bg-opacity-50 sf-transition-opacity"
          onClick={() => {
            props.setOpen(false);
          }}
        />
      </Transition>
      <div
        className={classNames(
          "sf-pointer-events-none sf-fixed sf-inset-y-0 sf-flex sf-max-w-full",
          props.styling?.slideoverSide === "left" ? "sf-left-0" : "sf-right-0",
        )}
      >
        <Transition
          show={props.open}
          as={Fragment}
          enter="sf-ease-in-out sf-duration-300 sm:sf-duration-300"
          enterFrom={
            props.styling?.slideoverSide === "left"
              ? "sf--translate-x-full"
              : "sf-translate-x-full"
          }
          enterTo="sf-translate-x-0"
          leave="sf-ease-in-out sf-duration-200 sm:sf-duration-200"
          leaveFrom="sf-translate-x-0"
          leaveTo={
            props.styling?.slideoverSide === "left"
              ? "sf--translate-x-full"
              : "sf-translate-x-full"
          }
        >
          <Dialog.Overlay className="sf-pointer-events-auto sf-w-screen md:sf-w-96">
            <div className="sf-flex sf-h-full sf-flex-col sf-divide-y sf-divide-gray-200 sf-bg-white sf-shadow-xl">
              <div
                className={classNames(
                  `sf-py-4 sf-px-3 sf-min-h-[3.75rem] sf-text-gray-900 sf-border-b sf-border-gray-200`,
                )}
                style={{
                  backgroundColor: props.styling?.headerBackgroundColor,
                  color: props.styling?.headerTextColor,
                }}
              >
                <div className="sf-relative sf-flex sf-flex-row sf-place-items-center sf-justify-center">
                  <Dialog.Title
                    className={classNames(
                      "sf-block sf-text-xl sf-font-semibold sf-leading-6",
                    )}
                  >
                    {props.AIname ?? "Chatbot"}
                  </Dialog.Title>
                  <div
                    className={classNames(
                      "sf-absolute sf-top-0 sf-flex sf-h-7 sf-items-center sf-right-0",
                      // Only set on the left if screen is large and sidebar on the left
                      props.styling?.slideoverSide === "left"
                        ? ""
                        : "md:sf-left-0",
                    )}
                  >
                    <button
                      type="button"
                      className="sf-p-1.5 sf-rounded-md sf-text-gray-400 hover:sf-text-gray-700 hover:sf-bg-gray-100 hover:sf-opacity-60 sf-transition focus:sf-outline-none focus:sf-ring-2 focus:sf-ring-gray-500"
                      onClick={() => props.setOpen(false)}
                    >
                      <span className="sf-sr-only">Close panel</span>
                      {props.styling?.slideoverSide === "left" ? (
                        <ChevronLeftIcon
                          className="sf-h-6 sf-w-6 sf-hidden md:sf-block"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronRightIcon
                          className="sf-h-6 sf-w-6 sf-hidden md:sf-block"
                          aria-hidden="true"
                        />
                      )}
                      <XMarkIcon
                        className="sf-h-6 sf-w-6 sf-block md:sf-hidden"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <Chat {...props} initialFocus={focusRef} />
            </div>
          </Dialog.Overlay>
        </Transition>
      </div>
    </Dialog>
  );
}
