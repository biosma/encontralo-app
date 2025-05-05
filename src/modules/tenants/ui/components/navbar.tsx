'use client';

import { Button } from '@/components/ui/button';
import { generateTenantUrl } from '@/lib/utils';
import { useTRPC } from '@/tRPC/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import { ShoppingCartIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  slug: string;
}
const CheckoutButton = dynamic(
  () => import('../../../checkout/ui/components/checkout-button').then((mod) => mod.CheckoutButton),
  {
    ssr: false,
    loading: () => (
      <Button variant={'elevated'} disabled className={'bg-white'}>
        <ShoppingCartIcon />
      </Button>
    ),
  },
);
export const Navbar = ({ slug }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ slug }));
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <Link href={generateTenantUrl(slug)}>
          {data?.image?.url && (
            <Image
              src={data.image.url}
              alt={slug}
              width={32}
              height={32}
              className="size-[32px] rounded-full border shrink-0 object-cover"
            />
          )}
          <p className="text-xl">{data.name}</p>
        </Link>
        <CheckoutButton tenantSlug={slug} />
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <div />
        <Button variant={'elevated'} disabled className={'bg-white'}>
          <ShoppingCartIcon />
        </Button>
      </div>
    </nav>
  );
};
