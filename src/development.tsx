import { createRoot } from "react-dom/client";

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

import SuperflowsChat from "./components/chat";
import SuperflowsButton from "./components/superflowsButton";
import React from "react";

function Development() {
  return (
    <div className="h-screen flex items-center justify-center w-full">
      <SuperflowsButton
        superflowsApiKey={import.meta.env.VITE_SUPERFLOWS_API_KEY}
        superflowsUrl={import.meta.env.VITE_SUPERFLOWS_URL}
        userDescription={import.meta.env.VITE_USER_DESCRIPTION}
        userApiKey={import.meta.env.VITE_USER_API_KEY}
        AIname={"Superflows Assistant"}
        styling={{
          type: "modal",
          solidIcon: true,
        }}
        devMode={false}
        welcomeText={import.meta.env.VITE_WELCOME_MESSAGE}
        suggestions={import.meta.env.VITE_SUGGESTIONS?.split(",")}
        showFunctionCalls={true}
        enableSpeech={true}
        speechLanguage="en"
        // textBelowInput={
        //   "This feature is in beta. We recommend you read the Acme AI [user guide](https://www.google.com)"
        // }
      />
      <div className="sf-w-80 sf-h-screen">
        <SuperflowsChat
          superflowsApiKey={import.meta.env.VITE_SUPERFLOWS_API_KEY}
          superflowsUrl={import.meta.env.VITE_SUPERFLOWS_URL}
          userDescription={import.meta.env.VITE_USER_DESCRIPTION}
          userApiKey={import.meta.env.VITE_USER_API_KEY}
          AIname={"Superflows Assistant"}
          devMode={false}
          welcomeText={import.meta.env.VITE_WELCOME_MESSAGE}
          suggestions={import.meta.env.VITE_SUGGESTIONS?.split(",")}
          showFunctionCalls={true}
        />
      </div>
    </div>
  );
}

// Render your React component instead
const root = createRoot(document.getElementById("app"));
root.render(<Development />);
