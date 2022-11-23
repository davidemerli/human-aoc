import { useRouter } from "next/router";
import { useState } from "react";
import { FaChevronRight, FaCopy } from "react-icons/fa";
import styled from "styled-components";
import { Layout } from "../../components/Layout";
import { useAoCData } from "../../utils/aocData";
import { trpc } from "../../utils/trpc";
import type { NextPageWithLayout } from "../_app";

const Home: NextPageWithLayout = () => {
  const router = useRouter();
  const { day, year } = router.query;

  const { aocText, aocData, puzzleAnswers, aocCookie } = useAoCData(
    Number(day),
    Number(year)
  );

  const submitAnswer = trpc.example.submitAnswer.useMutation();

  return (
    <main className="h-full overflow-scroll">
      <div className="flex h-full w-full flex-row gap-4 overflow-scroll p-4">
        {aocText && (
          <AoC
            className="max-w-4xl overflow-scroll"
            dangerouslySetInnerHTML={{ __html: aocText }}
          />
        )}
        <div className="flex h-full max-w-lg flex-col gap-2">
          <SubmitAnswer
            onSubmit={(answer) =>
              submitAnswer.mutateAsync({
                day: Number(day),
                year: Number(year),
                answer,
                star: puzzleAnswers.length + 1,
                cookie: aocCookie,
              })
            }
          />

          {aocData && (
            <pre className="h-full w-full overflow-x-hidden overflow-y-scroll break-all rounded-xl bg-base-300 p-2">
              {aocData}
              <div className="absolute bottom-2 right-2 m-4">
                <button
                  className="btn-outline btn-sm btn"
                  onClick={() => {
                    navigator.clipboard.writeText(aocData);
                  }}
                >
                  <FaCopy />
                </button>
              </div>
            </pre>
          )}
        </div>
      </div>
    </main>
  );
};

const SubmitAnswer = ({ onSubmit }: { onSubmit: (answer: string) => void }) => {
  const [answer, setAnswer] = useState("");

  return (
    <div className="form-control w-full">
      <div className="input-group">
        <input
          type="text"
          placeholder="Answer"
          className="input w-full bg-base-200"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button className="btn-square btn" onClick={() => onSubmit(answer)}>
          {/* TODO: show if correct through snackbar? */}
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

Home.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

const AoC = styled.div`
  font-family: "Roboto Mono", monospace;

  h2 {
    color: #ffffff;
    margin-top: 1em;
    margin-bottom: 1em;
    white-space: nowrap;
  }

  em {
    color: #ffffff;
    font-style: normal;
    font-weight: bold;
    text-shadow: 0 0 2px gray;
  }

  first-of-type {
    margin-top: 0;
  }

  a {
    white-space: nowrap;
  }

  em.star {
    color: #ffff66;
    font-style: normal;
    text-shadow: 0 0 4px #ffff66;
  }

  pre,
  code {
    //avoid padding messing up the first line
    padding: 0;
    margin: 0;
  }

  pre {
    font-family: "Roboto Mono", monospace;
    letter-spacing: 0.1rem;
    font-size: 1rem;
    line-height: 1.55rem;
    color: #ffffff66;
    background-color: #1f1f1f;
    border-radius: 0.5rem;
    padding: 0.5rem;
    overflow: scroll;
  }

  p {
    margin: 1rem 0;
  }

  .share {
    color: #009900;
    cursor: default;
    transition: color 0.2s 1s;
    /*position: relative;*/
  }

  .share:hover,
  .share:focus-within {
    color: #aaffaa;
    transition: color 0.2s 0s;
  }

  .share .share-content {
    display: inline-block;
    vertical-align: text-bottom;
    white-space: nowrap;
    overflow: hidden;
    max-width: 0;
    transition: max-width 0.2s 1s;
  }

  .share .share-content:before {
    content: "\\00a0";
  }

  .share:hover .share-content,
  .share:focus-within .share-content {
    max-width: 45em;
    transition: max-width 0.2s 0s;
  }

  .day-success {
    color: #ffff66;
    text-shadow: 0 0 6px #ffff66;
  }
`;

export default Home;
