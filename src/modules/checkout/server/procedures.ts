import { Media } from '@/payload-types';
import { baseProcedure, createTRPCRouter, protectedProcedure } from '@/tRPC/init';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const checkoutRouter = createTRPCRouter({
  verify: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await ctx.payload.findByID({
      collection: 'users',
      id: ctx.session.user.id,
      depth: 0, // user.tenants.[0].tenant sera un string gracias a depth: 0
    });
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }
    // TODO: MercadoPago Integration?
  }),
  purchase: protectedProcedure
    .input(
      z.object({
        productIds: z.array(z.string()).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const products = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.productIds,
              },
            },
          ],
        },
        select: {
          content: false,
        },
      });
      if (products.totalDocs !== input.productIds.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Products not found',
        });
      }
    }),
  getProducts: baseProcedure
    .input(
      z.object({
        ids: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const data = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where: {
          and: [
            {
              id: {
                in: input.ids,
              },
            },
          ],
        },
        select: {
          content: false,
        },
      });

      if (data.totalDocs !== input.ids.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Products not found',
        });
      }

      // await new Promise((resolve) => setTimeout(resolve, 2000));
      const totalPrice = data.docs.reduce((acc, doc) => {
        const price = Number(doc.price);
        return acc + (isNaN(price) ? 0 : price);
      }, 0);
      return {
        ...data,
        totalPrice,
        docs: data.docs.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
        })),
      };
    }),
});
