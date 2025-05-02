import { ProductLibraryView } from '@/modules/library/ui/view/product-library-view';
import { getQueryClient, trpc } from '@/tRPC/server';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';

interface Props {
  params: Promise<{
    productId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { productId } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.library.getOne.queryOptions({
      productId,
    }),
  );
  void queryClient.prefetchQuery(
    trpc.reviews.getOne.queryOptions({
      productId,
    }),
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductLibraryView productId={productId} />
    </HydrationBoundary>
  );
}
