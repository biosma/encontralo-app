import { DEFAULT_LIMIT } from '@/constants';
import { Media, Tenant } from '@/payload-types';
import { createTRPCRouter, protectedProcedure } from '@/tRPC/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const libraryRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.payload.find({
        collection: 'orders',
        limit: 1,
        pagination: false,
        where: {
          and: [
            {
              product: {
                equals: input.productId,
              },
            },
            {
              user: {
                equals: ctx.session.user.id,
              },
            },
          ],
        },
      });

      const order = ordersData.docs[0];

      if (!order) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Order not found',
        });
      }
      const product = await ctx.payload.findByID({
        collection: 'products',
        id: input.productId,
      });
      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }
      return product;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
      }),
    )
    .query(async ({ ctx, input }) => {
      const ordersData = await ctx.payload.find({
        collection: 'orders',
        depth: 0, // we only need ids
        page: input.cursor,
        limit: input.limit,
        where: {
          user: {
            equals: ctx.session.user.id, // all order of the logged user
          },
        },
      });

      const productIds = ordersData.docs.map((doc) => doc.product);

      const productsData = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where: {
          id: {
            in: productIds,
          },
        },
      });

      return {
        ...productsData,
        docs: productsData.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
