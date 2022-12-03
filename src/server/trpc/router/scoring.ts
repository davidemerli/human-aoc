import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const scoringRouter = router({
  globalLeaderboard: protectedProcedure
    .input(z.object({ year: z.string().transform(Number) }))
    .query(async ({ ctx, input }) => {
      const users = await ctx.prisma.user.findMany();

      const scoreMap = new Map<
        string,
        {
          score: number;
          stars: number;
        }
      >();

      for (let day = 1; day <= 25; day++) {
        for (let star = 1; star <= 2; star++) {
          const timers = await getTimersForDayAndYear(
            ctx.prisma,
            input.year,
            day,
            star
          );

          timers
            .sort((a, b) => a.duration - b.duration)
            .forEach((timer, i) => {
              const points =
                (scoreMap.get(timer.userId)?.score ?? 0) + (timers.length - i);

              scoreMap.set(timer.userId, {
                score: points,
                stars: (scoreMap.get(timer.userId)?.stars ?? 0) + 1,
              });
            });
        }
      }

      return users
        .map((user) => ({
          ...user,
          score: scoreMap.get(user.id)?.score ?? 0,
          stars: scoreMap.get(user.id)?.stars ?? 0,
        }))
        .sort((a, b) => b.score - a.score);
    }),

  //TODO: may be public
  leaderboard: protectedProcedure
    .input(
      z.object({
        year: z.string().transform((s) => parseInt(s)),
        day: z.string().transform((s) => parseInt(s)),
      })
    )
    .query(async ({ ctx, input }) => {
      return getTimersForDayAndYear(ctx.prisma, input.year, input.day);
    }),
});

const getTimersForDayAndYear = async (
  prisma: PrismaClient,
  year: number,
  day: number,
  star?: number
) => {
  // find all timers for this day and year with stopTime not null, and order them based on stopTime - startTime

  const timers = await prisma.timer.findMany({
    where: { year, day, stopTime: { not: null }, star },
    include: { user: true },
  });

  return timers.map((timer) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const duration = timer.stopTime!.getTime() - timer.initTime.getTime();

    return { duration, ...timer };
  });
};
