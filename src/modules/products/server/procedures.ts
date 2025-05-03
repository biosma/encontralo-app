import { DEFAULT_LIMIT } from '@/constants';
import { Category, Media, Tenant } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/tRPC/init';
import { TRPCError } from '@trpc/server';
import { headers as getHeaders } from 'next/headers';
import { Sort, Where } from 'payload';
import { z } from 'zod';

import { sortValues } from '../search-params';

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        cursor: z.number().default(1),
        limit: z.number().default(DEFAULT_LIMIT),
        category: z.string().nullable().optional(),
        minPrice: z.string().nullable().optional(),
        maxPrice: z.string().nullable().optional(),
        tags: z.array(z.string()).nullable().optional(),
        sort: z.enum(sortValues).nullable().optional(),
        tenantSlug: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
      let sort: Sort = '-createdAt';
      if (input.sort === 'curated') {
        sort = '-createdAt';
      } else if (input.sort === 'lowest') {
        sort = 'price';
      } else if (input.sort === 'highest') {
        sort = '-price';
      }

      if (input.minPrice && input.maxPrice) {
        where.price = { greater_than_equal: input.minPrice, less_than_equal: input.maxPrice };
      } else if (input.minPrice) {
        where.price = { greater_than_equal: input.minPrice };
      } else if (input.maxPrice) {
        where.price = { less_than_equal: input.maxPrice };
      }
      if (input.tenantSlug) {
        where['tenant.slug'] = { equals: input.tenantSlug };
      }
      if (input.category) {
        const categoryData = await ctx.payload.find({
          collection: 'categories',
          limit: 1,
          depth: 1,
          pagination: false,
          where: {
            slug: { equals: input.category },
          },
        });

        const formattedData = categoryData.docs.map((doc) => ({
          ...doc,
          subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
            // doc es tipo Category gracias a depth: 1
            ...(doc as Category),
            // subcategories: undefined, // TODO: Hacer esto dinámico
          })),
        }));
        const subcategoriesSlugs = [];
        const parentCategory = formattedData[0];
        if (parentCategory) {
          subcategoriesSlugs.push(
            ...parentCategory.subcategories.map((subcategory) => subcategory.slug),
          );
          where['category.slug'] = { in: [parentCategory.slug, ...subcategoriesSlugs] };
        }
      }

      if (input.tags && input.tags.length > 0) {
        where['tags.name'] = { in: input.tags };
      }

      const data = await ctx.payload.find({
        collection: 'products',
        depth: 2,
        where,
        sort,
        page: input.cursor,
        limit: input.limit,
        select: {
          content: false,
        },
      });

      // Usamos promise all para poder hacer un map asyncrono
      const dataWithSummarizedReviews = await Promise.all(
        data.docs.map(async (doc) => {
          const reviewsData = await ctx.payload.find({
            collection: 'reviews',
            pagination: false,
            where: {
              product: {
                equals: doc.id,
              },
            },
          });
          return {
            ...doc,
            reviewCount: reviewsData.totalDocs,
            reviewRating:
              reviewsData.docs.length === 0
                ? 0
                : reviewsData.docs.reduce((acc, review) => acc + review.rating, 0) /
                  reviewsData.totalDocs,
          };
        }),
      );

      return {
        ...data,
        docs: dataWithSummarizedReviews.map((doc) => ({
          ...doc,
          image: doc.image as Media | null,
          tenant: doc.tenant as Tenant & { image: Media | null },
        })),
      };
    }),
  getOne: baseProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const headers = await getHeaders();
      const session = await ctx.payload.auth({ headers });
      const productsData = await ctx.payload.findByID({
        collection: 'products',
        id: input.id,
        select: {
          content: false,
        },
      });

      let isPurchased = false;
      if (session?.user) {
        const ordersData = await ctx.payload.find({
          collection: 'orders',
          pagination: false,
          limit: 1,
          where: {
            and: [
              {
                product: {
                  equals: input.id,
                },
              },
              {
                user: {
                  equals: session.user.id,
                },
              },
            ],
          },
        });

        isPurchased = !!ordersData.docs[0];
      }

      if (!productsData) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Product not found' });
      }

      const reviews = await ctx.payload.find({
        collection: 'reviews',
        pagination: false,
        where: {
          product: {
            equals: input.id,
          },
        },
      });

      const reviewRating =
        reviews.docs.length > 0
          ? reviews.docs.reduce((acc, review) => acc + review.rating, 0) / reviews.totalDocs
          : 0;

      const ratingDistribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };

      if (reviews.totalDocs > 0) {
        reviews.docs.forEach((review) => {
          const rating = review.rating;
          if (rating >= 1 && rating <= 5) {
            ratingDistribution[rating] = (ratingDistribution[rating] || 0) + 1;
          }
        });
        Object.keys(ratingDistribution).forEach((key) => {
          const rating = Number(key);
          const count = ratingDistribution[rating] || 0;
          ratingDistribution[rating] = Math.round(count / reviews.totalDocs) * 100;
        });
      }
      return {
        ...productsData,
        isPurchased,
        image: productsData.image as Media | null,
        tenant: productsData.tenant as Tenant & { image: Media | null },
        reviewRating,
        reviewCount: reviews.totalDocs,
        ratingDistribution,
      };
    }),
});
