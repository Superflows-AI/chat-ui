import * as React from 'react'

const { useState, useEffect } = React



// import { useEffect, useState } from "react";
import { Styling } from "./lib/types";
import { classNames } from "./lib/utils";
// import { SparklesIcon } from "@heroicons/react/24/outline";
// import { BeakerIcon } from "@heroicons/vue/24/solid";
import { HomeIcon } from "@heroicons/react/24/solid";

const Counter: React.FC<{
  count: number;
  className: string;
}> = ({ count, className }) => (
  <div className={`counter ${className}`}>
    <p
      key={count}
      className={`counter__count ${className ? className + "__count" : ""}`}
    >
      {count}
    </p>
  </div>
);

export type ICounterProps = {
  className?: string;
};

// function SuperflowsButton(props: {
//   superflowsApiKey: string;
//   hostname?: string;
//   language?: "English" | "Espanol";
//   AIname?: string;
//   userApiKey?: string;
//   userDescription?: string;
//   suggestions?: string[];
//   devMode?: boolean;
//   testMode?: boolean;
//   styling?: Styling;
// }) {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <button
//         className={classNames(
//           "something p-1 focus:outline-none bg-transparent text-gray-500 hover:text-[#146ef5]"
//         )}
//         onClick={() => setOpen(!open)}
//       >
//         <HomeIcon
//           className="h-5 w-5"
//           style={{ height: "1.25rem", width: "1.25rem" }}
//           aria-hidden="true"
//         />
//       </button>
//       {/* <ChatBotSlideover open={open} setOpen={setOpen} {...props} /> */}
//     </>
//   );
// }

const DummyCounter: React.FC<ICounterProps> = ({ className = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (count > 4) return setCount(0);

      setCount(count + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [count, setCount]);

  return <Counter className={className} count={1} />;
};

export { DummyCounter };
