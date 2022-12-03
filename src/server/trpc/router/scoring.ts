import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const scoringRouter = router({
  //TODO: may be public
  leaderboard: protectedProcedure
    .input(
      z.object({
        year: z.string().transform((s) => parseInt(s)),
        day: z.string().transform((s) => parseInt(s)),
      })
    )
    .query(async ({ ctx, input }) => {
      // find all timers for this day and year with stopTime not null, and order them based on stopTime- startTime
      const timers = await ctx.prisma.timer.findMany({
        where: {
          year: input.year,
          day: input.day,
          stopTime: {
            not: null,
          },
        },
        include: {
          user: true,
        },
      });

      // take all codeSolutions and if they do not start with \`\`\` wrap them in \`\`\`python and \`\`\` at the end, do not use concat and remember to escale \`
      const result = await ctx.prisma
        .$queryRaw`update "CodeSolution" set "code" = '\`\`\`python\\n' || "code" || '\\n\`\`\`' where "code" not like '\`\`\`%';`;

      console.log(result);

      return timers.map((timer) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const duration = timer.stopTime!.getTime() - timer.initTime.getTime();

        return {
          duration,
          ...timer,
        };
      });
    }),
});
