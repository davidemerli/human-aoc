import { useMemo } from "react";
import { useLocalStorage } from "./localStorage";
import { trpc } from "./trpc";

export function useAoCData(day: number, year: number) {
  const [aocCookie] = useLocalStorage<string>("aocCookie", "");

  const aocText = trpc.example.getAocText.useQuery({
    day,
    year,
    cookie: aocCookie,
  });

  const aocData = trpc.example.getAoc.useQuery({
    day,
    year,
    cookie: aocCookie,
  });

  const puzzleAnswers = useMemo(() => {
    if (!aocText.data) return [];

    const regex = /<p>Your puzzle answer was <code>(\d+)<\/code>/g;

    const matches = [...aocText.data.matchAll(regex)];

    return matches.map((match) => match[1]);
  }, [aocText.data]);

  return {
    aocText: aocText.data,
    aocData: aocData.data,
    puzzleAnswers,
    aocCookie,
  } as const;
}
