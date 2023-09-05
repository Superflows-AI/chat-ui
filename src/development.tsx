import { createRoot } from "react-dom/client";

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

import SuperflowsButton from "./components/superflowsButton";
import React from "react";

function Development() {
  return (
    <div className="h-screen flex items-center justify-center w-full">
      <SuperflowsButton
        superflowsApiKey=""
        styling={{ solidIcon: true, type: "modal" }}
      />
    </div>
  );
}

// Render your React component instead
const root = createRoot(document.getElementById("app"));
root.render(<Development />);
