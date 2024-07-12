import { Dialog, Transition } from "@headlessui/react";
import { UsersIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useState } from "react";
import { classNames } from "../lib/utils";

const suggestions = [
  "What % of bookings are cancelled?",
  "Show me weekly bookings over the past 6 months",
  "Break down revenue from bookings by booking channel",
  "What are the top 10 properties by average stay duration?",
  "What are the top 10 properties by occupancy rate?",
  "What are the top 10 properties by average number of guests?",
  "What is the average booking lead time?",
  "How many reservations do I get from Airbnb vs direct?",
  "What % of guests bring pets?",
  "What are the top 10 most common words used in messages?",
  "What times of day are response times longest?",
  "What is my average response time to guests?",
  "What % of guests were never replied to in the last week?",
  "Which guests have unanswered messages?",
  "How many guests have any unread messages?",
  "Which guests have unread messages?",
  "How many guests have any unanswered messages?",
  "What percentage of guests have any unanswered messages?",
  "What percentage of guests have any unread messages?",
  "What is the most common number of nights stayed across all properties?",
  "Which properties have generated the most revenue?",
  "What are the average response times for Airbnb and whatsapp in the past month?",
  "What's the average property floor space?",
  "Breakdown listings by type",
  "What % of listings are active?",
  "What's the average number of maximum guests per listing?",
  "Break down the number of guests by conversation length",
];

export default function SearchModal(props: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");

  const filteredSuggestions =
    query === ""
      ? []
      : suggestions.filter((person) => {
          return person.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Dialog
      open={props.open}
      as="div"
      className="superflows-styling sf-relative sf-z-10"
      onClose={() => props.setOpen(false)}
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
        <div className="sf-fixed sf-inset-0 sf-bg-gray-500 sf-bg-opacity-25 sf-transition-opacity" />
      </Transition>

      <div className="sf-fixed sf-inset-0 sf-z-10 sf-w-screen sf-overflow-y-auto sf-p-4 sm:sf-p-6 md:sf-p-20">
        <div
          className="sf-min-h-full sf-p-4 sf-text-center sm:sf-items-center sf-cursor-pointer"
          onClick={() => {
            props.setOpen(false);
          }}
        >
          <Transition
            show={props.open}
            as={Fragment}
            enter="sf-ease-out sf-duration-300"
            enterFrom="sf-opacity-0 sf-scale-95"
            enterTo="sf-opacity-100 sf-scale-100"
            leave="sf-ease-in sf-duration-200"
            leaveFrom="sf-opacity-100 sf-scale-100"
            leaveTo="sf-opacity-0 sf-scale-95"
          >
            <Dialog.Overlay
              as="div"
              className="sf-flex sf-flex-col sf-mx-auto sf-max-w-xl sf-transform sf-rounded-xl sf-bg-white sf-p-2 sf-shadow-2xl sf-ring-1 sf-ring-black sf-ring-opacity-5 sf-transition-all"
            >
              <input
                autoFocus
                className="sf-flex-grow sf-rounded-md sf-border-0 sf-outline-2 sf-outline-gray-400 focus:sf-outline-gray-600 sf-bg-gray-100 sf-px-4 sf-py-2.5 sf-text-gray-900 focus:sf-ring-0 sm:text-sm"
                placeholder="Add chart..."
                onChange={(event) => setQuery(event.target.value)}
                onBlur={() => setQuery("")}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />

              {filteredSuggestions.length > 0 && (
                <div
                  className="sf--mb-2 sf-w-full sf-max-h-72 sf-scroll-py-2 sf-overflow-y-auto sf-py-2 sf-text-sm sf-text-gray-800"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {filteredSuggestions.map((suggestion, idx) => (
                    <button
                      key={suggestion}
                      className={
                        "sf-w-full sf-cursor-pointer sf-select-none sf-text-left sf-rounded-md sf-px-4 sf-py-2 hover:sf-bg-indigo-600 hover:sf-text-white"
                      }
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div
                className={classNames(
                  "sf-flex sf-flex-row sf-gap-x-1 sf-mt-2",
                  filteredSuggestions.length > 0 && "sf-hidden",
                )}
              >
                {[suggestions[0], suggestions[1], suggestions[2]].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      className="sf-cursor-pointer sf-text-left sf-px-2 sf-py-1 sf-rounded-md sf-border sf-bg-white sf-text-little sf-text-gray-800 sf-shadow hover:sf-border-gray-400 sf-transition-all"
                    >
                      {suggestion}
                    </button>
                  ),
                )}
              </div>

              {query !== "" && filteredSuggestions.length === 0 && (
                <div className="sf-px-4 sf-py-14 sf-text-center sm:sf-px-14">
                  <UsersIcon
                    className="sf-mx-auto sf-h-6 sf-w-6 sf-text-gray-400"
                    aria-hidden="true"
                  />
                  <p className="sf-mt-4 sf-text-sm sf-text-gray-900">
                    No people found using that search term.
                  </p>
                </div>
              )}
            </Dialog.Overlay>
          </Transition>
        </div>
      </div>
    </Dialog>
  );
}
