import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ShoppingCartIcon } from 'lucide-react';
import Link from 'next/link';

import { useCart } from '../../hooks/use-cart';

interface CheckoutButtonProps {
  className?: string;
  hideIfEmpty?: boolean;
}

// hideIfEmpty could be dissabledIfEmpty...

export const CheckoutButton = ({ className, hideIfEmpty }: CheckoutButtonProps) => {
  const { totalItems } = useCart();
  if (hideIfEmpty && totalItems === 0) return null;
  return (
    <Button variant={'elevated'} asChild className={cn('bg-white', className)}>
      <Link href={'/checkout'}>
        <ShoppingCartIcon /> {totalItems > 0 ? totalItems : ''}
      </Link>
    </Button>
  );
};
