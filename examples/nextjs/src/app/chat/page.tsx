"use client";
import React from "react";
import { SuperflowsButton, SuperflowsChat } from "@superflows/chat-ui-react";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

if (!process.env.NEXT_PUBLIC_SUPERFLOWS_API_KEY) {
  throw new Error(
    "You must provide a Superflows API key in the environment variables as NEXT_PUBLIC_SUPERFLOWS_API_KEY",
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen w-1/2 flex-col items-center justify-between p-12 pt-16 pb-2">
      <SuperflowsChat
        superflowsApiKey={process.env.NEXT_PUBLIC_SUPERFLOWS_API_KEY ?? ""}
        userDescription={process.env.NEXT_PUBLIC_USER_DESCRIPTION}
        userApiKey={process.env.NEXT_PUBLIC_USER_API_KEY}
        styling={
          {
            // type: "modal",
            // slideoverSide: "right",
            // buttonColor: "green",
            // modalClasses: "bg-gray-50",
            // slideoverSide: "right",
            // headerTextColor: "#146ef5",
            // buttonColor: "#146ef5",
          }
        }
        welcomeText={"Welcome to Acme CRM"}
        suggestions={process.env.NEXT_PUBLIC_SUGGESTIONS?.split(",")}
      />
    </main>
  );
}
