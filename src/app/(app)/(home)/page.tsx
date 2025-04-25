'use client';

import { useTRPC } from '@/tRPC/client';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.auth.session.queryOptions());
  return <div className="flex flex-col gap-y-4 p-4">{JSON.stringify(data?.user, null, 2)}</div>;
}
