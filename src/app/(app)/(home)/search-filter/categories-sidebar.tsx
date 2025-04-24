import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CategoriesGetManyOutput, CategoriesGetManyOutputSingle } from '@/modules/categories/types';
import { useTRPC } from '@/tRPC/client';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CategoriesSidebar = ({ open, onOpenChange }: Props) => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.categories.getMany.queryOptions());

  const router = useRouter();

  const [parentCategories, setParentCategories] = useState<CategoriesGetManyOutput | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoriesGetManyOutputSingle | null>(
    null,
  );

  const currentCategories = parentCategories ?? data ?? [];

  const handleOpenChange = (open: boolean) => {
    setSelectedCategory(null);
    setParentCategories(null);
    onOpenChange(open);
  };

  const handleCategoryClick = (category: CategoriesGetManyOutputSingle) => {
    if (category.subcategories && category.subcategories.length > 0) {
      setParentCategories(category?.subcategories as CategoriesGetManyOutput);
      setSelectedCategory(category);
    } else {
      if (parentCategories && selectedCategory) {
        router.push(`/${selectedCategory.slug}/${category.slug}`);
      } else {
        if (category.slug === 'all') {
          router.push(`/all`);
        } else {
          router.push(`/${category.slug}`);
        }
      }
      handleOpenChange(false);
    }
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
    setParentCategories(null);
  };

  const backgroundColor = selectedCategory?.color || 'white';
  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="left" className="p-0 transition-none" style={{ backgroundColor }}>
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Categorías</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex flex-col overflow-y-auto h-full pb-2">
          {parentCategories && (
            <button
              onClick={() => handleBackClick()}
              className="w-full text-left p-4 hover:bg-black hover:text-white flex items-center text-base font-medium"
            >
              <ChevronLeftIcon className="size-4 mr-2" />
              Volver
            </button>
          )}
          {currentCategories.map((category) => (
            <button
              key={category.slug}
              onClick={() => handleCategoryClick(category)}
              className="w-full text-left p-4 hover:bg-black hover:text-white justify-between flex items-center text-base font-medium"
            >
              {category.name}
              {category.subcategories && category.subcategories.length > 0 && (
                <ChevronRightIcon className="size-4 ml-2" />
              )}
            </button>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
