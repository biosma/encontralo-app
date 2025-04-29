import { Media, Tenant } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/tRPC/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const tenantsRouter = createTRPCRouter({
  getOne: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tenantsData = await ctx.payload.find({
        collection: 'tenants',
        where: {
          slug: { equals: input.slug },
        },
        limit: 1,
        pagination: false,
      });
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const tenant = tenantsData.docs[0];
      if (!tenant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant not found' });
      }
      return tenant as Tenant & { image: Media | null };
    }),
});
