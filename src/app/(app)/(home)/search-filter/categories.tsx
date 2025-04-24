'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CategoriesGetManyOutput } from '@/modules/categories/types';
import { ListFilterIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { CategoriesSidebar } from './categories-sidebar';
import { CategoryDropdown } from './category-dropdown';

interface CategoriesProps {
  data: CategoriesGetManyOutput;
}

export const Categories = ({ data }: CategoriesProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const viewAllRef = useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] = useState(data.length);
  const [isAnyHovered, setIsAnyHovered] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeCategory = 'all';
  const activeCategoryIndex = data.findIndex((category) => category.slug === activeCategory);
  const isActiveCategoryHidden = activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1;
  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current || !measureRef.current || !viewAllRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const viewAllWidth = viewAllRef.current.offsetWidth;
      const availableWidth = containerWidth - viewAllWidth;
      const items = Array.from(measureRef.current.children);
      let totalWidth = 0;
      let visible = 0;

      for (const item of items) {
        const width = item.getBoundingClientRect().width;
        if (totalWidth + width > availableWidth) break;
        totalWidth += width;
        visible++;
      }
      setVisibleCount(visible);
    };
    const resizeObserver = new ResizeObserver(calculateVisible);
    resizeObserver.observe(containerRef.current!);
    return () => resizeObserver.disconnect();
  }, [data.length]);

  return (
    <div className="relative w-full">
      <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      {/* div escondido para calcular el numero de categorías visibles */}
      <div
        ref={measureRef}
        className="absolute opacity-0 pointer-events-none flex"
        style={{ position: 'fixed', top: -9999, left: -9999 }}
      >
        {data.map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigarionHovered={false}
            />
          </div>
        ))}
      </div>

      {/* div visible para calcular el numero de categorías visibles */}

      <div
        ref={containerRef}
        className="flex flex-nowrap items-center"
        onMouseEnter={() => setIsAnyHovered(true)}
        onMouseLeave={() => setIsAnyHovered(false)}
      >
        {data.slice(0, visibleCount).map((category) => (
          <div key={category.id}>
            <CategoryDropdown
              category={category}
              isActive={activeCategory === category.slug}
              isNavigarionHovered={isAnyHovered}
            />
          </div>
        ))}
        <div ref={viewAllRef} className="shrink-0">
          <Button
            variant={'elevated'}
            className={cn(
              'h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-white hover:border-primary text-black font-medium text-sm',
              isActiveCategoryHidden &&
                !isAnyHovered &&
                'bg-white border-primary shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-x-[4px] -translate-y-[4px]',
            )}
            onClick={() => setIsSidebarOpen(true)}
          >
            Ver todos
            <ListFilterIcon className="ml-2" />
          </Button>{' '}
        </div>
      </div>
    </div>
  );
};
