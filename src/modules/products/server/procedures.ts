import { Category } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/tRPC/init';
import { Where } from 'payload';
import { z } from 'zod';

export const productsRouter = createTRPCRouter({
  getMany: baseProcedure
    .input(
      z.object({
        category: z.string().nullable().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const where: Where = {};
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
      const data = await ctx.payload.find({
        collection: 'products',
        depth: 1,
        where,
      });
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      return data;
    }),
});
