import { loadProductFilters } from '@/modules/products/search-params';
import { ProductListView } from '@/modules/products/ui/views/product-list-view';
import { getQueryClient, trpc } from '@/tRPC/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { SearchParams } from 'nuqs';

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
      <ProductListView category={category} />
    </HydrationBoundary>
  );
}
