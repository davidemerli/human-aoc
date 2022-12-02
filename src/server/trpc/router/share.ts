import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const shareRouter = router({
  get: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        year: z.string().transform((s) => parseInt(s)),
        day: z.string().transform((s) => parseInt(s)),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.codeSolution
        .findMany({
          where: {
            userId: input.userId,
            year: input.year,
            day: input.day,
          },
          include: {
            user: true,
            likes: true,
            comments: true,
          },
        })
        .then((solutions) =>
          solutions.map((solution) => ({
            ...solution,
            liked: solution.likes.some(
              (like) => like.userId === ctx.session.user.id
            ),
          }))
        );
    }),
  list: protectedProcedure
    .input(
      z.object({
        year: z.string().transform((s) => parseInt(s)),
        day: z.string().transform((s) => parseInt(s)),
      })
    )
    .query(async ({ ctx, input }) => {
      const codeSolutions = await ctx.prisma.codeSolution.findMany({
        where: {
          year: input.year,
          day: input.day,
        },
        include: {
          user: true,
          likes: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
      });

      return codeSolutions.map((codeSolution) => {
        return {
          ...codeSolution,
          comments: codeSolution._count.comments,
          likes: codeSolution._count.likes,
          liked: codeSolution.likes.some(
            (like) => like.userId === ctx.session.user.id
          ),
        };
      });
    }),
  publish: protectedProcedure
    .input(
      z.object({
        year: z.string().transform((s) => parseInt(s)),
        day: z.string().transform((s) => parseInt(s)),
        star: z.string().transform((s) => parseInt(s)),
        code: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { year, day, star, code, description } = input;

      return await ctx.prisma.codeSolution.upsert({
        where: {
          userId_day_year_star: {
            userId: ctx.session.user.id,
            day,
            year,
            star,
          },
        },
        create: {
          year,
          day,
          star,
          code,
          description,
          userId: ctx.session.user.id,
        },
        update: {
          code,
          description,
        },
      });
    }),
  toggleLike: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      const codeSolution = await ctx.prisma.codeSolution.findUnique({
        where: { id },
      });

      if (!codeSolution) {
        throw new Error("Code solution not found");
      }

      const like = await ctx.prisma.like.findUnique({
        where: {
          codeSolutionId_userId: {
            codeSolutionId: codeSolution.id,
            userId: ctx.session.user.id,
          },
        },
      });

      if (like) {
        await ctx.prisma.like.delete({
          where: {
            codeSolutionId_userId: {
              codeSolutionId: codeSolution.id,
              userId: ctx.session.user.id,
            },
          },
        });
      } else {
        await ctx.prisma.like.create({
          data: {
            codeSolutionId: codeSolution.id,
            userId: ctx.session.user.id,
          },
        });
      }
    }),

  comment: router({
    list: protectedProcedure
      .input(z.object({ codeSolutionId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await ctx.prisma.comment.findMany({
          where: { codeSolutionId: input.codeSolutionId },
          include: { user: true },
        });
      }),
    add: protectedProcedure
      .input(
        z.object({
          codeSolutionId: z.string(),
          year: z.string().transform((s) => parseInt(s)),
          day: z.string().transform((s) => parseInt(s)),
          star: z.string().transform((s) => parseInt(s)),
          comment: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.comment.create({
          data: {
            userId: ctx.session.user.id,
            codeSolutionId: input.codeSolutionId,
            content: input.comment,
          },
        });
      }),
    delete: protectedProcedure
      .input(z.object({ commentId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.comment.delete({
          where: { id: input.commentId },
        });
      }),
    edit: protectedProcedure
      .input(
        z.object({
          commentId: z.string(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.prisma.comment.update({
          where: { id: input.commentId },
          data: { content: input.content },
        });
      }),
  }),
});
