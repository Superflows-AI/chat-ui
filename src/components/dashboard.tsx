import React from "react";
import SuperflowsSidebar from "./sidebar";
import SearchModal from "./search";
import { ChartBarSquareIcon, PlusIcon } from "@heroicons/react/24/outline";
// import SuperflowsChat from "./chat";

export default function Dashboard() {
  const [open, setOpen] = React.useState(false);
  const col = "#e2e1e2";
  return (
    <div className="superflows-styling sf-w-screen sf-h-screen sf-bg-[#f1f2f9] sf-flex sf-flex-row">
      {/* Sidebar */}
      <div className={"sf-h-full sf-bg-[#f1f2f9] sf-w-12"}>
        <img src={"src/Enso_toolbar.png"} className={"sf-w-12"} />
      </div>
      {/* Wide bar */}
      <div
        className={
          "sf-h-[calc(100%-2rem)] sf-my-4 sf-ml-1 sf-bg-white sf-rounded-lg sf-w-72"
        }
      >
        <img src={"src/enso_wide_toolbar.png"} className={"sf-w-72"} />
      </div>
      {/* Main content */}
      <div className="sf-flex-grow sf-m-6">
        <div className="sf-ml- sf-w-full sf-flex sf-justify-around">
          <img src={"src/enso_dash.png"} className="sf-h-[calc(100vh-3rem)]" />
          <div>
            <button
              className="sf-flex sf-place-items-center sf-rounded-lg sf-border-0 sf-px-2 sf-py-1 sf-cursor-pointer sf-bg-blue-500 hover:sf-bg-blue-600 sf-text-white sf-font-semibold sf-text-sm sf-gap-x-0.5 sf-transition-colors sf-duration-200 sf-ease-in-out"
              onClick={() => setOpen(true)}
            >
              <PlusIcon className={"sf-h-5 sf-w-5"} /> Add chart
            </button>
          </div>
        </div>
      </div>
      <SearchModal open={open} setOpen={setOpen} />
      {/*<SuperflowsSidebar*/}
      {/*  open={false}*/}
      {/*  setOpen={() => {}}*/}
      {/*  superflowsApiKey={import.meta.env.VITE_SUPERFLOWS_API_KEY}*/}
      {/*  superflowsUrl={import.meta.env.VITE_SUPERFLOWS_URL}*/}
      {/*  userDescription={import.meta.env.VITE_USER_DESCRIPTION}*/}
      {/*  userApiKey={import.meta.env.VITE_USER_API_KEY}*/}
      {/*  AIname={"Enso"}*/}
      {/*  devMode={false}*/}
      {/*  enableSpeech={false}*/}
      {/*  welcomeText={import.meta.env.VITE_WELCOME_MESSAGE}*/}
      {/*  suggestions={import.meta.env.VITE_SUGGESTIONS?.split(",")}*/}
      {/*  // textBelowInput={*/}
      {/*  //   "This feature is in beta. We recommend you read the Acme AI [user guide](https://www.google.com)"*/}
      {/*  // }*/}
      {/*/>*/}
      {/*</div>*/}
    </div>
  );
}
