import { Footer } from '@/modules/home/ui/components/footer';
import { Navbar } from '@/modules/home/ui/components/navbar';
import { SearchFilters, SearchFiltersSkeleton } from '@/modules/home/ui/components/search-filter';
import { getQueryClient, trpc } from '@/tRPC/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';

interface Props {
  children: React.ReactNode;
}

const Layout = async ({ children }: Props) => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.categories.getMany.queryOptions());
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SearchFiltersSkeleton />}>
          <SearchFilters />
        </Suspense>
      </HydrationBoundary>
      <div className="flex-1 px-4 lg:px-12 py-8 flex flex-col gap-4">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
