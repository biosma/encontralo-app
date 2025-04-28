interface Props {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { category, subcategory } = await params;
  return (
    <div className="flex flex-col gap-y-4 p-4">
      Category {category} <br /> Subcategory {subcategory}
    </div>
  );
}
