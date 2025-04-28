import { DEFAULT_LIMIT } from '@/constants';
import { baseProcedure, createTRPCRouter } from '@/tRPC/init';
import { z } from 'zod';

export const tagsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.payload.find({
        collection: 'tags',
        page: input.cursor,
        limit: input.limit,
      });
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      return data;
    }),
});
