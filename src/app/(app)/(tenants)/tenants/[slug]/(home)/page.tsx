import { DEFAULT_LIMIT } from '@/constants';
import { loadProductFilters } from '@/modules/products/search-params';
import { ProductListView } from '@/modules/products/ui/views/product-list-view';
import { getQueryClient, trpc } from '@/tRPC/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { SearchParams } from 'nuqs';

interface Props {
  searchParams: Promise<SearchParams>;
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const filters = await loadProductFilters(searchParams);
  const queryClient = getQueryClient();
  void queryClient.prefetchInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions({
      tenantSlug: slug,
      ...filters,
      limit: DEFAULT_LIMIT,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductListView tenantSlug={slug} narrowView />
    </HydrationBoundary>
  );
}
