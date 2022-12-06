import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const aocRouter = router({
  text: protectedProcedure
    .input(
      z.object({
        day: z.string().transform((val) => parseInt(val)),
        year: z.string().transform((val) => parseInt(val)),
        cookie: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { day, year, cookie } = input;
      const {
        user: { id: userId },
      } = ctx.session;

      const info = await customfetch(
        `https://adventofcode.com/${year}/day/${day}`,
        {
          headers: {
            cookie: `session=${cookie}`,
          },
        }
      )
        .then((res) => res.text())
        .then((text) =>
          text
            .substring(
              text.indexOf("<main>"),
              text.indexOf("</main>") + "</main>".length
            )
            //remove answer input form
            .replace(/<form.*<\/form>/, "")
        )
        .then((text) => ({
          text,
          stars:
            text.match(/<p>Your puzzle answer was <code>(\w+)<\/code>/g)
              ?.length ?? 0,
        }))
        .then((info) => {
          if (info.text === "Please")
            throw new Error("Puzzle not unlocked yet");

          return info;
        })
        .catch((err) => {
          throw new Error("Could not fetch text", err);
        });

      if (info.stars < 2) {
        // find if there is a timer for this day and star
        // NB: we need to check for `info.stars + 1` since we get the number of
        // solved stars with the regex pattern above
        const timer = await ctx.prisma.timer.findUnique({
          where: {
            userId_day_year_star: { userId, day, year, star: info.stars + 1 },
          },
        });

        // if there is no timer, create one
        if (!timer) {
          await ctx.prisma.timer.create({
            data: { userId, day, year, star: info.stars + 1 },
          });
        }
      }

      // if there was a timer but it was not completed, update it to completed
      // NB: this happens when the user fetches the text after having solved one of the parts
      // i.e. after submitting an answer
      await ctx.prisma.timer.updateMany({
        where: {
          userId,
          day,
          year,
          star: info.stars,
          stopTime: null,
        },
        data: { stopTime: new Date() },
      });

      return info;
    }),
  input: publicProcedure
    .input(
      z.object({
        day: z.string().transform((val) => parseInt(val)),
        year: z.string().transform((val) => parseInt(val)),
        cookie: z.string(),
      })
    )
    .query(({ input }) => {
      const { day, year, cookie } = input;

      return customfetch(`https://adventofcode.com/${year}/day/${day}/input`, {
        headers: {
          Cookie: `session=${cookie}`,
        },
      }).then((res) => res.text());
    }),
  timers: protectedProcedure
    .input(
      z.object({
        day: z.string().transform((v) => parseInt(v)),
        year: z.string().transform((v) => parseInt(v)),
      })
    )
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
  answer: protectedProcedure
    .input(
      z.object({
        day: z.string().transform((v) => parseInt(v)),
        year: z.string().transform((v) => parseInt(v)),
        star: z.number(),
        answer: z.string(),
        cookie: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { day, year, star, answer, cookie } = input;

      const response = await customfetch(
        `https://adventofcode.com/${year}/day/${day}/answer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: `session=${cookie}`,
          },
          body: `level=${star}&answer=${answer}`,
        }
      )
        .then((res) => res.text())
        .then((res) => {
          // parse response and get <article> element
          const article = res
            .substring(res.indexOf("<article>"), res.indexOf("</article>"))
            .replace(/<article>/, "");

          // if the response contains the "That's the right answer" string, the answer was correct
          const correct = article.includes("That's the right answer");
          // if the response contains the "That's not the right answer" string, the answer was incorrect
          const incorrect = article.includes("That's not the right answer");
          // if the response contains the "You gave an answer too recently" string, the answer was too soon

          return { correct, incorrect, message: article };
        });

      return response;
    }),
});

const customfetch = (url: string, options: RequestInit) => {
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "User-Agent":
        "Human Advent of Code - https://aoc.davidemerli.com/ - github.com/davidemerli/haoc",
    },
    credentials: "include",
  });
};
