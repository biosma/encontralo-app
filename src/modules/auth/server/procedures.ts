import { baseProcedure, createTRPCRouter } from '@/tRPC/init';
import { TRPCError } from '@trpc/server';
import { cookies as getCookies, headers as getHeaders } from 'next/headers';

import { AUTH_COOKIE } from '../constants';
import { loginSchema, registerSchema } from '../schema';

export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();

    const session = await ctx.payload.auth({ headers });

    return session;
  }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_COOKIE);
  }),
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

    await ctx.payload.create({
      collection: 'users',
      data: {
        email: input.email,
        password: input.password,
        username: input.username,
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

    const cookies = await getCookies();
    cookies.set({
      name: AUTH_COOKIE,
      value: data.token,
      httpOnly: true,
      path: '/',
      // maxAge: 60 * 60 * 24 * 30,
      // sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production',
    });
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
    const cookies = await getCookies();
    cookies.set({
      name: AUTH_COOKIE,
      value: data.token,
      httpOnly: true,
      path: '/',
      // maxAge: 60 * 60 * 24 * 30,
      // sameSite: 'lax',
      // secure: process.env.NODE_ENV === 'production',
    });
    return data;
  }),
});
