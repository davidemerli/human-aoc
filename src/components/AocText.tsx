import styled from "styled-components";
import { useAocText } from "../utils/aocData";

export const AocText = ({ year, day }: { year: string; day: string }) => {
  const { data: problemInfo, isLoading, isError } = useAocText({ year, day });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !problemInfo) {
    return <div>Error</div>;
  }

  return (
    <AoC
      className="h-full w-full overflow-scroll"
      dangerouslySetInnerHTML={{ __html: problemInfo.text }}
    />
  );
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
