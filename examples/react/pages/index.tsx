import Head from "next/head";
import { SuperflowsButton } from "@superflows/chat-ui-react";

export default function App() {
  return (
    <>
      <Head>
        <title>Superflows Sidebar Demo</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <div className="w-screen top-0 min-h-full bg-gray-100 flex flex-row justify-end px-20">
        <SuperflowsButton
          superflowsApiKey={"abcd"}
          suggestions={[
            "What stage are we at with the deal with Acme Inc.?",
            "Search for C-suites at European CRM companies with >500 employees",
            "Who is leading the Acme Inc. deal?",
          ]}
          AIname={"Gary"}
          styling={{
            brandColor: "#ffffff",
            slideoverSide: "right",
          }}
        />
      </div>
    </>
  );
}
