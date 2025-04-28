import { loadProductFilters } from '@/modules/products/search-params';
import { ProductFilters } from '@/modules/products/ui/components/product-filters';
import { ProductList, ProductListSkeleton } from '@/modules/products/ui/components/product-list';
import { ProductSort } from '@/modules/products/ui/components/product-sort';
import { getQueryClient, trpc } from '@/tRPC/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { SearchParams } from 'nuqs';
import { Suspense } from 'react';

interface Props {
  params: Promise<{
    category: string;
  }>;
  searchParams: Promise<SearchParams>;
}

export default async function Page({ params, searchParams }: Props) {
  const { category } = await params;
  const filters = await loadProductFilters(searchParams);
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.products.getMany.queryOptions({ category, ...filters }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col lg:flex-row lg:items-center gap-y-2 lg:gap-y-0 justify-between">
        <p className="text-2xl font-medium">Curated for you</p>
        <ProductSort />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-6 xl:grid-cols-8 gap-y-6 gap-x-12">
        <div className="lg:col-span-2 xl:col:span-2">
          <ProductFilters />
        </div>
        <div className="lg:col-span-4 xl:col-span-6">
          <Suspense fallback={<ProductListSkeleton />}>
            <ProductList category={category} />
          </Suspense>
        </div>
      </div>
    </HydrationBoundary>
  );
}
