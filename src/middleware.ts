import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/((?!api/|_next/|_static/|_vercel|media/|[\w-]+\.\w+).*)'],
};

export default async function middleware() {
  return NextResponse.next();
}
