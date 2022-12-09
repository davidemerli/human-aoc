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
          golds: number;
          silvers: number;
          bronzes: number;
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
                (scoreMap.get(timer.userId)?.score ?? 0) + (users.length - i);

              const previousStats = scoreMap.get(timer.userId);

              scoreMap.set(timer.userId, {
                score: points,
                stars: (previousStats?.stars ?? 0) + 1,
                golds: (previousStats?.golds ?? 0) + (i == 0 ? 1 : 0),
                silvers: (previousStats?.silvers ?? 0) + (i == 1 ? 1 : 0),
                bronzes: (previousStats?.bronzes ?? 0) + (i == 2 ? 1 : 0),
              });
            });
        }
      }

      return users
        .map((user) => ({
          ...user,
          score: scoreMap.get(user.id)?.score ?? 0,
          stars: scoreMap.get(user.id)?.stars ?? 0,
          medals: [
            scoreMap.get(user.id)?.golds ?? 0,
            scoreMap.get(user.id)?.silvers ?? 0,
            scoreMap.get(user.id)?.bronzes ?? 0,
          ] as [number, number, number],
        }))
        .sort((a, b) => {
          // sort based on score, then stars, then golds, then silvers, then bronzes
          if (a.score != b.score) return b.score - a.score;
          if (a.stars != b.stars) return b.stars - a.stars;
          if (a.medals[0] != b.medals[0]) return b.medals[0] - a.medals[0];
          if (a.medals[1] != b.medals[1]) return b.medals[1] - a.medals[1];
          if (a.medals[2] != b.medals[2]) return b.medals[2] - a.medals[2];
        });
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

  userInfo: protectedProcedure
    .input(
      z.object({
        year: z.string().transform((s) => parseInt(s)),
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.user.findUniqueOrThrow({
        where: { id: input.userId },
        include: {
          timers: {
            where: {
              year: input.year,
              stopTime: { not: null },
            },
          },
        },
      });
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
