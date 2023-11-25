"use client";
import React from "react";
import { SuperflowsButton } from "@superflows/chat-ui-react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

if (!process.env.NEXT_PUBLIC_SUPERFLOWS_API_KEY) {
  throw new Error(
    "You must provide a Superflows API key in the environment variables as NEXT_PUBLIC_SUPERFLOWS_API_KEY",
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-12 pt-16 pb-2">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="z-10 fixed left-0 inset-y-0 w-60 px-6 py-10 bg-gray-600 flex flex-col ">
          <div className="flex flex-row gap-x-4">
            <div className="rounded-full bg-gray-500 h-8 w-8 text-gray-800 flex place-items-center justify-center text-lg font-sans">
              A
            </div>
            <div className="text-gray-200 text-2xl font-sans">Acme CRM</div>
          </div>
          <div className="mt-8 flex flex-col animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div key={n}>
                {n !== 1 && <div className="w-full h-px bg-gray-500" />}
                <div className="flex flex-row my-4">
                  <div className="h-6 bg-gray-400 rounded-full w-full" />
                </div>
              </div>
            ))}
          </div>
          <div className="bottom-4 inset-x-6 absolute animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10" />
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-gray-200 rounded" />
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-2 bg-gray-200 rounded col-span-2" />
                  <div className="h-2 bg-gray-200 rounded col-span-1" />
                </div>
                <div className="h-2 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div
          className={
            "z-0 pl-60 flex flex-row justify-end fixed top-0 inset-x-0 h-8 bg-gray-400 pr-20 gap-x-3"
          }
        >
          <SuperflowsButton
            superflowsApiKey={process.env.NEXT_PUBLIC_SUPERFLOWS_API_KEY ?? ""}
            superflowsUrl={process.env.NEXT_PUBLIC_SUPERFLOWS_URL ?? ""}
            userDescription={process.env.NEXT_PUBLIC_USER_DESCRIPTION}
            userApiKey={process.env.NEXT_PUBLIC_USER_API_KEY}
            AIname={"Superflows Assistant"}
            styling={{
              type: "modal",
              // slideoverSide: "right",
              // buttonColor: "green",
              // modalClasses: "bg-gray-50",
              // slideoverSide: "right",
              // headerTextColor: "#146ef5",
              // buttonColor: "#146ef5",
            }}
            welcomeText={"Welcome to Acme CRM"}
            suggestions={process.env.NEXT_PUBLIC_SUGGESTIONS?.split(",")}
          />

          {[1, 2, 3].map((n) => (
            <div key={n} className="m-1 h-5 w-5 bg-gray-500 rounded-full" />
          ))}
          <Cog6ToothIcon className="z-0 w-7 h-7 p-1 text-gray-500 cursor-pointer hover:text-blue-600" />
        </div>
        <div className="ml-24 w-full h-full flex flex-col rounded-md">
          <div className="text-2xl text-gray-600 mb-6 w-44 rounded-full h-7 animate-pulse bg-gray-400" />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((n) => (
            <div
              key={n}
              className="w-full bg-gray-100 border-b border-gray-400 animate-pulse flex space-x-4 px-6"
            >
              <div className="rounded-full bg-gray-500 h-8 my-2 w-8" />
              <div className="rounded-full bg-gray-500 h-4 my-4 w-64" />
              <div className="rounded-full bg-gray-500 h-4 my-4 w-28" />
              <div className="rounded-full bg-gray-500 h-4 my-4 w-96" />
              <div className="rounded-full bg-gray-500 h-4 my-4 w-40" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
