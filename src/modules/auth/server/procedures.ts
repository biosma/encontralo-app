import { baseProcedure, createTRPCRouter } from '@/tRPC/init';
import { TRPCError } from '@trpc/server';
import { headers as getHeaders } from 'next/headers';

import { loginSchema, registerSchema } from '../schema';
import { generateAuthCookie } from '../utils';

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();

    const session = await ctx.payload.auth({ headers });

    return session;
  }),
  // logout: baseProcedure.mutation(async () => {
  //   const cookies = await getCookies();
  //   cookies.delete(AUTH_COOKIE);
  // }),
  register: baseProcedure.input(registerSchema).mutation(async ({ ctx, input }) => {
    const existingData = await ctx.payload.find({
      collection: 'users',
      limit: 1,
      where: {
        username: { equals: input.username },
      },
    });

    const existingUser = existingData.docs[0];

    if (existingUser) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Username already taken',
      });
    }

    const tenant = await ctx.payload.create({
      collection: 'tenants',
      data: {
        name: input.username,
        slug: input.username,
        stripeAccountId: 'test',
      },
    });

    await ctx.payload.create({
      collection: 'users',
      data: {
        email: input.email,
        password: input.password,
        username: input.username,
        //This plugin allow multiple stores/tenants per user
        tenants: [
          {
            tenant: tenant.id,
          },
        ],
      },
    });

    const data = await ctx.payload.login({
      collection: 'users',
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!data.token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }

    await generateAuthCookie({ prefix: ctx.payload.config.cookiePrefix, value: data.token });
  }),
  login: baseProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const data = await ctx.payload.login({
      collection: 'users',
      data: {
        email: input.email,
        password: input.password,
      },
    });
    if (!data.token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      });
    }
    await generateAuthCookie({ prefix: ctx.payload.config.cookiePrefix, value: data.token });
    return data;
  }),
});
