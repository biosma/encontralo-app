import { Footer } from '@/modules/tenants/ui/components/footer';
import { Navbar, NavbarSkeleton } from '@/modules/tenants/ui/components/navbar';
import { getQueryClient, trpc } from '@/tRPC/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    slug: string;
  }>;
}
export default async function Layout({ children, params }: LayoutProps) {
  const { slug } = await params;

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.tenants.getOne.queryOptions({ slug }));

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F4F0]">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar slug={slug} />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1">
        <div className="max-w-(--breakpoint-xl) mx-auto">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
