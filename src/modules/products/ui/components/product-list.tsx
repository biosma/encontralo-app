'use client';

import { Button } from '@/components/ui/button';
import { DEFAULT_LIMIT } from '@/constants';
import { useTRPC } from '@/tRPC/client';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { InboxIcon } from 'lucide-react';

import { useProductFilters } from '../../hooks/use-product-filters';
import { ProductCard, ProductCardSkeleton } from './product-card';

interface Props {
  category?: string;
}

export const ProductList = ({ category }: Props) => {
  const [filters] = useProductFilters();
  const trpc = useTRPC();
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    trpc.products.getMany.infiniteQueryOptions(
      { category, ...filters, limit: DEFAULT_LIMIT },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
        },
      },
    ),
  );

  if (data?.pages?.[0]?.docs.length === 0) {
    return (
      <div className="border border-black border-dashed flex items-center justify-center p-8 flex-col gap-y-4 bg-white w-full rounded-lg">
        <InboxIcon />
        <p className="text-xl font-medium">No products found</p>
      </div>
    );
  }
  return (
    <>
      {' '}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {data?.pages
          .flatMap((page) => page.docs)
          .map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image?.url}
              authorUsername="@author"
              authorImageUrl={undefined}
              reviewRating={3}
              reviewCount={5}
              price={product.price}
            />
          ))}
      </div>{' '}
      <div className="flex justify-center pt-8">
        {' '}
        {hasNextPage && (
          <Button
            disabled={isFetchingNextPage}
            onClick={() => fetchNextPage()}
            className="font-medium bg-white text-base disabled:opacity-50"
            variant={'elevated'}
          >
            Load more
          </Button>
        )}
      </div>
    </>
  );
};
export const ProductListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
      {Array.from({ length: DEFAULT_LIMIT }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};
