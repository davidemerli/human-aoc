import styled from "styled-components";
import { useAocText } from "../utils/aocData";

export const AocText = ({ year, day }: { year: string; day: string }) => {
  const { data: problemInfo, isLoading, isError } = useAocText({ year, day });

  if (isLoading) {
    return (
      <AocStyle className="h-full w-full overflow-auto">Loading...</AocStyle>
    );
  }

  if (isError || !problemInfo) {
    return <AocStyle className="h-full w-full overflow-auto">Error</AocStyle>;
  }

  return (
    <AocStyle
      className="h-full w-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: problemInfo.text }}
    />
  );
};

export const AocStyle = styled.div`
  @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap");

  font-family: "Roboto Mono", monospace;

  h2 {
    color: #efefef;
    margin-top: 1em;
    margin-bottom: 1em;
    white-space: nowrap;
  }

  em {
    color: #d4d4d4;
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

  code {
    padding: 0.15rem;
    border-radius: 0.25rem;
  }

  pre {
    padding: 0.5rem;
    border-radius: 0.5rem;
  }

  pre,
  code {
    margin: 0;
    font-family: "Roboto Mono", monospace;
    letter-spacing: 0.1rem;
    font-size: 1rem;
    line-height: 1.55rem;
    color: #ffffff99;
    background-color: #1f1f1f;
    overflow: auto;
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

  a {
    color: #00ee00;
    text-decoration: underline;

    &:hover {
      color: #aaffaa;
    }
  }
`;
