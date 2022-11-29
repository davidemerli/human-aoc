import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useMemo } from "react";
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
