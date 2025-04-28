interface Props {
  params: Promise<{
    category: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { category } = await params;
  return <div className="flex flex-col gap-y-4 p-4">Category {category}</div>;
}
