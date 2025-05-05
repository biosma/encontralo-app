import { DEFAULT_LIMIT } from '@/constants';
import { Media, Product, Review, Tenant } from '@/payload-types';
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
      return product as Product;
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
        select: {
          content: false,
        },
      });

      // const dataWithSummarizedReviews = await Promise.all(
      //   productsData.docs.map(async (doc) => {
      //     const reviewsData = await ctx.payload.find({
      //       collection: 'reviews',
      //       pagination: false,
      //       where: {
      //         product: {
      //           equals: doc.id,
      //         },
      //       },
      //     });
      //     return {
      //       ...doc,
      //       reviewCount: reviewsData.totalDocs,
      //       reviewRating:
      //         reviewsData.docs.length === 0
      //           ? 0
      //           : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
      //             reviewsData.totalDocs,
      //     };
      //   }),
      // );

      // This resolve the problem of n+1 queries {
      const productIdsArray = productsData.docs.map((doc) => doc.id);

      // Just one req for all the reviews of above (productIdsArray)
      const allReviewsData = await ctx.payload.find({
        collection: 'reviews',
        pagination: false,
        where: {
          product: {
            in: productIdsArray,
          },
        },
      });

      const reviewsByProductId = allReviewsData.docs.reduce<Record<string, Review[]>>(
        (acc, review) => {
          // This is because review.product can be a string or an object type Product
          const productId =
            typeof review.product === 'string' ? review.product : review.product?.id;
          if (!acc[productId]) {
            acc[productId] = [];
          }
          acc[productId].push(review);
          return acc;
        },
        {},
      );

      const dataWithSummarizedReviews = productsData.docs.map((doc) => {
        const productReviews = reviewsByProductId[doc.id] || [];
        const reviewCount = productReviews.length;
        const reviewRating =
          reviewCount === 0
            ? 0
            : productReviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount;
        return {
          ...doc,
          reviewCount,
          reviewRating,
        };
      });
      // }

      return {
        ...productsData,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
});
