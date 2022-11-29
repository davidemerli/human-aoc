import { router } from "../trpc";
import { authRouter } from "./auth";
import { aocRouter } from "./aoc";

export const appRouter = router({
  aoc: aocRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
