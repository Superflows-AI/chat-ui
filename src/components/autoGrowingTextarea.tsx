import * as React from "react";
import { useEffect, useRef } from "react";

export function AutoGrowingTextArea(props: {
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ref.current.style.height = "5px";

    const maxH = props.maxHeight ?? 500;
    const minH = props.minHeight ?? 36;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ref.current.style.height =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
      Math.max(Math.min(ref.current.scrollHeight, maxH), minH).toString() +
      "px";
  }, [ref.current, props.value]);

  return (
    <textarea
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
