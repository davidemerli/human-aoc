import { router } from "../trpc";
import { authRouter } from "./auth";
import { aocRouter } from "./aoc";
import { scoringRouter } from "./scoring";
import { shareRouter } from "./share";

export const appRouter = router({
  aoc: aocRouter,
  auth: authRouter,
  scoring: scoringRouter,
  share: shareRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
