import { StarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  id: string;
  name: string;
  imageUrl?: string | null;
  authorUsername: string;
  authorImageUrl?: string | null;
  reviewRating: number;
  reviewCount: number;
  price: number;
}

export const ProductCard = ({
  id,
  name,
  imageUrl,
  authorUsername,
  authorImageUrl,
  reviewRating,
  reviewCount,
  price,
}: ProductCardProps) => {
  return (
    <Link href={`/product/${id}`}>
      <div className="hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-x-[4px] hover:-translate-y-[4px] transition-all border rounded-md bg:white overflow-hidden h-full flex flex-col">
        <div className="relative aspect-square">
          <Image alt={name} fill className="object-cover" src={imageUrl || '/placeholder.png'} />
        </div>
        <div className="p-4 border-y flex flex-col gap-3 flex-1">
          <h2 className="text-lg font-medium line-clamp-4">{name}</h2>
          <div className="flex items-center gap-2">
            {authorImageUrl && (
              <Image
                alt={authorUsername}
                className="size-[16px] shrink-0 border rounded-full"
                src={authorImageUrl}
                width={16}
                height={16}
              />
            )}
            <p className="text-sm underline font-medium">{authorUsername}</p>
          </div>
          {reviewCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="size-3.5 fill-black" />{' '}
              <p className="text-sm font-medium">
                {reviewRating} ({reviewCount})
              </p>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="relative px-2 py-1 border bg-pink-300 w-fit">
            <p className="text-sm font-medium">
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              }).format(Number(price))}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => {
  return <div className="w-full aspect-3/4 bg-neutral-200 rounded-lg animate-pulse" />;
};
