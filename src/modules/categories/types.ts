import type { AppRouter } from '@/tRPC/routers/_app';
import { inferRouterOutputs } from '@trpc/server';

export type CategoriesGetManyOutput = inferRouterOutputs<AppRouter>['categories']['getMany'];
export type CategoriesGetManyOutputSingle = CategoriesGetManyOutput[0];
