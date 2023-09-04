import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Fragment, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { classNames } from "../lib/utils";
import { SidebarStyle, SuperflowsSidebarProps } from "../lib/types";
import Chat from "./chat";

export default function SuperflowsSidebar(props: SuperflowsSidebarProps) {
  const focusRef = useRef(null);
  return (
    <Dialog
      open={props.open}
      as="div"
      className="relative z-50"
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
        <div
          className="fixed inset-0 cursor-pointer bg-gray-500 bg-opacity-50 transition-opacity"
          onClick={() => {
            props.setOpen(false);
          }}
        />
      </Transition>
      <div
        className={classNames(
          "pointer-events-none fixed inset-y-0 flex max-w-full",
          props.styling?.slideoverSide === "left" ? "left-0" : "right-0",
        )}
      >
        <Transition
          show={props.open}
          as={Fragment}
          enter="ease-in-out duration-300 sm:duration-300"
          enterFrom={
            props.styling?.slideoverSide === "left"
              ? "-translate-x-full"
              : "translate-x-full"
          }
          enterTo="translate-x-0"
          leave="ease-in-out duration-200 sm:duration-200"
          leaveFrom="translate-x-0"
          leaveTo={
            props.styling?.slideoverSide === "left"
              ? "-translate-x-full"
              : "translate-x-full"
          }
        >
          <Dialog.Overlay className="pointer-events-auto w-screen md:w-96">
            <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
              <div
                className={classNames(
                  `py-4 px-3 min-h-[3.75rem] text-gray-900 border-b border-gray-200`,
                )}
                style={{
                  backgroundColor: props.styling?.headerBackgroundColor,
                  color: props.styling?.headerTextColor,
                }}
              >
                <div className="relative flex flex-row place-items-center justify-center">
                  <Dialog.Title
                    className={classNames(
                      "block text-xl font-semibold leading-6",
                    )}
                  >
                    {props.AIname ?? "Chatbot"}
                  </Dialog.Title>
                  <div
                    className={classNames(
                      "absolute top-0 flex h-7 items-center right-0",
                      // Only set on the left if screen is large and sidebar on the left
                      props.styling?.slideoverSide === "left"
                        ? ""
                        : "md:left-0",
                    )}
                  >
                    <button
                      type="button"
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 hover:opacity-60 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                      onClick={() => props.setOpen(false)}
                    >
                      <span className="sr-only">Close panel</span>
                      {props.styling?.slideoverSide === "left" ? (
                        <ChevronLeftIcon
                          className="h-6 w-6 hidden md:block"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronRightIcon
                          className="h-6 w-6 hidden md:block"
                          aria-hidden="true"
                        />
                      )}
                      <XMarkIcon
                        className="h-6 w-6 block md:hidden"
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
