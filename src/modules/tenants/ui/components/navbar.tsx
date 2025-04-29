'use client';

import { generateTenantUrl } from '@/lib/utils';
import { useTRPC } from '@/tRPC/client';
import { useSuspenseQuery } from '@tanstack/react-query';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  slug: string;
}

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
              objectFit="cover"
              width={32}
              height={32}
              className="size-[32px] rounded-full border shrink-0"
            />
          )}
          <p className="text-xl">{data.name}</p>
        </Link>
      </div>
    </nav>
  );
};

export const NavbarSkeleton = () => {
  return (
    <nav className="h-20 border-b font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
        <div />
      </div>
    </nav>
  );
};
