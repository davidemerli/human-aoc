import { z } from "zod";

import { router, publicProcedure, protectedProcedure } from "../trpc";

export const exampleRouter = router({
  hello: publicProcedure
    .input(z.object({ text: z.string().nullish() }).nullish())
    .query(({ input }) => {
      return {
        greeting: `Hello ${input?.text ?? "world"}`,
      };
    }),
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  getAocText: protectedProcedure
    .input(z.object({ day: z.number(), year: z.number(), cookie: z.string() }))
    .query(async ({ input, ctx }) => {
      const { day, year, cookie } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      const text = await fetch(`https://adventofcode.com/${year}/day/${day}`, {
        headers: {
          cookie: `session=${cookie}`,
        },
      })
        .then((res) => res.text())
        .then((text) => {
          const main = text.substring(
            text.indexOf("<main>"),
            text.indexOf("</main>") + "</main>".length
          );
          return main;
        });

      // count Your puzzle answer is: in text
      const regex = /<p>Your puzzle answer was <code>(\d+)<\/code>/g;
      const count = text.match(regex)?.length ?? 0;

      if (count === 2) return text;

      const timer = await ctx.prisma.timer.findUnique({
        where: {
          userId_day_year_star: {
            userId,
            day,
            year,
            star: count,
          },
        },
      });

      if (!timer) {
        await ctx.prisma.timer.create({
          data: {
            userId,
            day,
            year,
            star: count + 1,
          },
        });
      } else if (!timer.stopTime) {
        await ctx.prisma.timer.update({
          where: {
            userId_day_year_star: {
              userId,
              day,
              year,
              star: count,
            },
          },
          data: {
            stopTime: new Date(),
          },
        });
      }

      return text;
    }),
  getAoc: publicProcedure
    .input(z.object({ day: z.number(), year: z.number(), cookie: z.string() }))
    .query(({ input }) => {
      const { day, year, cookie } = input;

      return fetch(`https://adventofcode.com/${year}/day/${day}/input`, {
        headers: {
          Cookie: `session=${cookie}`,
        },
      }).then((res) => res.text());
    }),
  getTimers: protectedProcedure
    .input(z.object({ day: z.number(), year: z.number() }))
    .query(async ({ input, ctx }) => {
      const {
        user: { id: userId },
      } = ctx.session;

      const { day, year } = input;

      const timers = await ctx.prisma.timer.findMany({
        where: {
          userId,
          day,
          year,
        },
      });

      return timers;
    }),
  submitAnswer: protectedProcedure
    .input(
      z.object({
        day: z.number(),
        year: z.number(),
        star: z.number(),
        answer: z.string(),
        cookie: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { day, year, star, answer, cookie } = input;

      const response = await fetch(
        `https://adventofcode.com/${year}/day/${day}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: `session=${cookie}`,
          },
          body: `level=${star}&answer=${answer}`,
        }
      );

      const text = await response.text();

      const regex = /That's the right answer!/g;

      const count = text.match(regex)?.length ?? 0;

      return count === 1;
    }),
});
