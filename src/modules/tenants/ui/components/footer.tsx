import { cn } from '@/lib/utils';
import { Poppins } from 'next/font/google';
import Link from 'next/link';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['700'],
});
export const Footer = () => {
  return (
    <nav className="border-t font-medium bg-white">
      <div className="max-w-(--breakpoint-xl) mx-auto flex items-center h-full px-4 lg:px-12 gap-2 py-6">
        <p>Powered by</p>
        <Link prefetch href={process.env.NEXT_PUBLIC_APP_URL!}>
          <span className={cn('text-2xl font-semibold', poppins.className)}>Encontralo</span>
        </Link>
      </div>
    </nav>
  );
};
