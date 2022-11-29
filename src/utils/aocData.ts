import { useLocalStorage } from "./localStorage";
import { trpc } from "./trpc";

export const useAocText = ({ year, day }: { year: string; day: string }) => {
  const [cookie] = useLocalStorage<string | null>("aocCookie", null);

  if (!cookie) {
    return {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("No cookie"),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      refetch: () => {},
    };
  }

  return trpc.aoc.text.useQuery(
    { year, day, cookie },
    {
      // enabled: !!cookie, TODO: check
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 1 day
    }
  );
};

export const useAocInput = ({ year, day }: { year: string; day: string }) => {
  const [cookie] = useLocalStorage<string | null>("aocCookie", null);

  if (!cookie) {
    return {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("No cookie"),
    };
  }

  return trpc.aoc.input.useQuery(
    { year, day, cookie },
    {
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 1 day
    }
  );
};

export const useAocTimers = ({ year, day }: { year: string; day: string }) => {
  return trpc.aoc.timers.useQuery({ year, day });
};
