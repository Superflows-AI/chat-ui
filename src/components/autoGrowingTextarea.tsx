import React, { useEffect, useRef } from "react";

export function AutoGrowingTextArea(props: {
  id: string;
  className: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  minHeight?: number;
  maxHeight?: number;
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>;
}) {
  const ref: React.MutableRefObject<any> = useRef(null);

  useEffect(() => {
    if (ref.current === null) return;
    ref.current.style.height = "5px";

    const maxH = props.maxHeight ?? 500;
    const minH = props.minHeight ?? 0;

    ref.current.style.height =
      Math.max(Math.min(ref.current.scrollHeight, maxH), minH).toString() +
      "px";
  }, [ref.current, props.value]);

  return (
    <textarea
      id={props.id}
      ref={ref}
      className={props.className}
      placeholder={props.placeholder}
      value={props.value}
      onChange={props.onChange}
      onKeyDown={props.onKeyDown}
      onBlur={props.onBlur}
    />
  );
}

export function addTextToTextbox(text: string) {
  // Only run this function in the browser
  console.log("addTextToTextbox", text);
  if (typeof window !== "undefined") {
    const textarea = document.getElementById(
      "sf-chatbot-textarea"
    ) as HTMLTextAreaElement;
    console.log("textarea", textarea);
    if (textarea) {
      console.log("got the text area yo");
      textarea.value = text;
      const event = new Event("change", { bubbles: true });
      textarea.dispatchEvent(event);
    }
    return true;
  }

  return false;
}
