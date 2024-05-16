import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import React, { useEffect } from "react";

interface TableFooterItem {
  total: number;
  average: number;
}

export function StyledMarkdown(mdProps: {
  children: string;
  tableExtender?: React.ReactNode;
  totals?: TableFooterItem[];
}) {
  return (
    <ReactMarkdown
      className="sf-px-4 sf-mt-1 sf-text-little sf-text-gray-900 sf-whitespace-pre-line sf-w-full sf-overflow-x-auto"
      components={{
        a: ({ node, ...props }) => (
          <a className="sf-text-blue-500 hover:sf-underline" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li
            className="marker:sf-text-gray-700 sf-ml-4 sf--my-2 sf-text-gray-900 sf-list-decimal"
            {...props}
          />
        ),
        p: ({ node, ...props }) => <p className="sf-my-0" {...props} />,
        h3: ({ node, ...props }) => (
          <h3
            className="sf-text-little sm:sf-text-base lg:sf-text-lg sf-text-center sf-w-full sf-font-extrabold sf-text-gray-900 sf-py-2 sf--mb-6 sf-border sf-bg-gray-50 sf-border-gray-300"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <table
            className="sf-text-center sf-border-collapse sf-w-full sf-divide-y sf-divide-gray-300 sf-border sf-border-gray-300"
            {...props}
          />
        ),
        thead: ({ node, ...props }) => (
          <thead
            className="sf-bg-gray-100 sf-text-xs sm:sf-text-sm lg:sf-text-little sf-text-gray-700 sf-py-2"
            {...props}
          />
        ),
        th: ({ node, ...props }) => (
          <th
            className="sf-border sf-border-gray-300 sf-break-keep sf-font-normal sf-px-2 sf-py-2"
            {...props}
          />
        ),
        tbody: ({ node, ...props }) => (
          <tbody {...props}>
            {/* eslint-disable-next-line react/prop-types */}
            {props.children || <></>}
            {mdProps.tableExtender}
            {mdProps.totals && (
              <tr className="sf-bg-gray-50">
                {mdProps.totals.map((total, idx) => (
                  <td
                    key={idx}
                    className="sf-px-2 sf-py-1 sf-text-gray-500 sf-text-xs sf-border sf-border-gray-300 sf-bg-gray-100"
                  >
                    <div className="sf-flex sf-justify-between">
                      {total === undefined ? (
                        <></>
                      ) : (
                        <>
                          {total.average && <div>Average: {total.average}</div>}
                          {total.total && <div>Total: {total.total}</div>}
                        </>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        ),
        tr: ({ node, ...props }) => (
          <tr
            className="even:sf-bg-gray-300 sf-border sf-border-gray-300"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="sf-bg-gray-50 sf-border sf-border-gray-300 sf-break-keep sf-whitespace-wrap sf-px-2 sf-py-2.5 sf-text-xs md:sf-text-sm sf-text-gray-800 sf-break-words sf-break"
            style={{ wordBreak: "break-word" }}
            {...props}
          />
        ),
      }}
      remarkPlugins={[remarkGfm]}
    >
      {mdProps.children}
    </ReactMarkdown>
  );
}
