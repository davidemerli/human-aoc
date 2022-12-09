import { useState } from "react";
import { FaCopy } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAocInput, useAocText, useAocTimers } from "../utils/aocData";
import { useLocalStorage } from "../utils/localStorage";
import { trpc } from "../utils/trpc";
import { AocStyle } from "./AocText";

export const AocInput = ({ year, day }: { year: string; day: string }) => {
  const {
    data: text,
    isLoading: isLoadingInput,
    isError: isErrorInput,
  } = useAocInput({ year, day });

  const {
    data,
    isLoading: isLoadingStars,
    isError: isErrorStars,
    refetch: refetchText,
  } = useAocText({ year, day });

  const submitAnswer = trpc.aoc.answer.useMutation();
  const { refetch: refetchTimers } = useAocTimers({ year, day });

  const [answer, setAnswer] = useState("");
  const [cookie] = useLocalStorage("aocCookie", "");

  const isLoadingState = isLoadingInput || isLoadingStars;
  const isErrorState = isErrorInput || isErrorStars || !text;

  if (isLoadingState || isErrorState) {
    return (
      <div className="relative flex h-full w-full flex-col gap-2 rounded-xl bg-base-300 p-4 lg:max-w-lg">
        <pre className="flex-grow overflow-y-scroll whitespace-pre-wrap font-mono">
          {isLoadingInput ? 'Loading...' : 'Error. Try again'}
        </pre>
      </div>
    );
  }

  const lines = text.split("\n");

  return (
    <div className="relative flex h-full w-full flex-col gap-2 rounded-xl bg-base-300 p-4 lg:max-w-lg">
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
              navigator.clipboard
                .writeText(text)
                .then(() => toast("Copied to clipboard", { type: "success" }))
                .catch(() =>
                  toast("Failed to copy to clipboard", { type: "error" })
                );
            }}
          >
            <FaCopy />
          </button>
        </div>
      </div>
      {data?.stars !== 2 && (
        <div className="form-control w-full">
          <label className="input-group">
            <input
              type="text"
              className="input-bordered input w-full"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <label
              className="btn-primary btn border border-base-100"
              htmlFor="my-modal"
            >
              submit answer
            </label>
          </label>
        </div>
      )}
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-lg font-bold">
            Do you really want to submit this answer?
          </h3>
          <p className="py-4">
            <pre className="rounded-xl bg-base-300 p-4">{answer}</pre>
          </p>
          <div className="modal-action">
            <label htmlFor="my-modal" className="btn-ghost btn">
              cancel
            </label>
            <label
              htmlFor="my-modal"
              className="btn-primary btn"
              onClick={() => {
                console.log("submit", {
                  year,
                  day,
                  answer,
                  cookie,
                  star: data?.stars,
                });
                submitAnswer
                  .mutateAsync({
                    year,
                    day,
                    answer,
                    star: data?.stars === 1 ? 2 : 1,
                    cookie,
                  })
                  .then((res) => {
                    refetchText?.().then(() => refetchTimers());
                    toast(
                      <AocStyle
                        dangerouslySetInnerHTML={{ __html: res.message }}
                      />,
                      {
                        type: res.correct
                          ? "success"
                          : res.incorrect
                          ? "error"
                          : "warning",
                      }
                    );
                  });
              }}
            >
              submit
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
