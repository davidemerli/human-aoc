import classNames from "classnames";
import { useState } from "react";
import { FaCopy } from "react-icons/fa";
import { useAocInput } from "../utils/aocData";

export const AocInput = ({ year, day }: { year: string; day: string }) => {
  const { data: text, isLoading, isError } = useAocInput({ year, day });

  const [showMessage, setShowMessage] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !text) {
    return <div>Error</div>;
  }

  const lines = text.split("\n");

  return (
    <div className="relative flex h-full w-full flex-col rounded-xl bg-base-300 p-4 lg:max-w-lg">
      <pre className="flex-grow overflow-y-scroll whitespace-pre-wrap font-mono">
        {text}
      </pre>
      <div className="mt-2 flex flex-row items-baseline gap-2 rounded-xl border-2 border-base-100 p-2">
        <p>
          <code className="rounded-md bg-base-100 p-1">{lines.length}</code>{" "}
          line(s){" "}
          <code className="rounded-md bg-base-100 p-1">{text.length}</code>{" "}
          characters
          <br />
          <span className="text-sm font-light italic text-base-content">
            <span>longest line: {Math.max(...lines.map((l) => l.length))}</span>
            {", "}
            <span>
              shortest line: {Math.min(...lines.map((l) => l.length))}
            </span>
          </span>
        </p>
        <div className="ml-auto mt-auto">
          <button
            className="btn-ghost btn-md btn-circle btn"
            onClick={() => {
              navigator.clipboard.writeText(text);
              setShowMessage(true);
              setTimeout(() => setShowMessage(false), 2000);
            }}
          >
            <FaCopy />
          </button>
        </div>
      </div>
      <div
        className={classNames("toast select-none transition-all duration-200", {
          "translate-x-0": showMessage,
          "translate-x-full": !showMessage,
        })}
      >
        <div className="alert alert-success">
          <div>
            <span>Input copied successfully to clipboard</span>
            <FaCopy className="ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
