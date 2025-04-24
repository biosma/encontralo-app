import { Category } from '@/payload-types';
import { baseProcedure, createTRPCRouter } from '@/tRPC/init';

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.payload.find({
      collection: 'categories',
      depth: 1,
      pagination: false,
      where: {
        parent: {
          exists: false,
        },
      },
      sort: 'name',
    });

    const formattedData = data.docs.map((doc) => ({
      ...doc,
      subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
        // doc es tipo Category gracias a depth: 1
        ...(doc as Category),
        subcategories: undefined,
      })),
    }));

    return formattedData;
  }),
});
