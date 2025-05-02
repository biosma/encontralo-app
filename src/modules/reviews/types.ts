import type { AppRouter } from '@/tRPC/routers/_app';
import { inferRouterOutputs } from '@trpc/server';

export type ReviewsGetManyOne = inferRouterOutputs<AppRouter>['reviews']['getOne'];
