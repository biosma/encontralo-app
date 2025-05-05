import { StarPicker } from '@/components/star-picker';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { ReviewsGetManyOne } from '@/modules/reviews/types';
import { useTRPC } from '@/tRPC/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

interface Props {
  productId: string;
  initialData?: ReviewsGetManyOne;
}

const formSchema = z.object({
  description: z.string().min(1, { message: 'Description is required' }),
  rating: z.number().min(1, { message: 'Rating is required' }).max(5),
});

export const ReviewForm = ({ productId, initialData }: Props) => {
  const [isPreview, setIsPreview] = useState(!!initialData);
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const createReview = useMutation(
    trpc.reviews.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({
            productId,
          }),
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );
  const updateReview = useMutation(
    trpc.reviews.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(
          trpc.reviews.getOne.queryOptions({
            productId,
          }),
        );
        setIsPreview(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description ?? '',
      rating: initialData?.rating ?? 0,
    },
  });
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (initialData) {
      updateReview.mutate({
        reviewId: initialData.id,
        rating: values.rating,
        description: values.description,
      });
    } else {
      createReview.mutate({
        productId,
        rating: values.rating,
        description: values.description,
      });
    }
  };
  return (
    <Form {...form}>
      <form className="flex flex-col gap-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <p className="font-medium">{isPreview ? 'Your rating:' : 'Liked it? Leave a review:'}</p>
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <StarPicker value={field.value} onChange={field.onChange} disabled={isPreview} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Want to leave a written review?"
                  disabled={isPreview}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {!isPreview && (
          <Button
            variant={'elevated'}
            size="lg"
            type="submit"
            disabled={createReview.isPending || updateReview.isPending}
            className="bg-black text-white hover:bg-pink-300 hover:text-primary w-fit"
          >
            {initialData ? 'Update review' : 'Post review'}
          </Button>
        )}
      </form>
      {isPreview && (
        <Button
          onClick={() => setIsPreview(false)}
          variant={'elevated'}
          size="lg"
          type="button"
          className="w-fit mt-4"
        >
          Edit review
        </Button>
      )}
    </Form>
  );
};

export const ReviewFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-4">
      <p className="font-medium">Liked it? Leave a review:</p>

      <StarPicker disabled={true} />

      <Textarea placeholder="Want to leave a written review?" disabled={true} />

      <Button
        variant={'elevated'}
        size="lg"
        type="submit"
        disabled={true}
        className="bg-black text-white hover:bg-pink-300 hover:text-primary w-fit"
      >
        Post review
      </Button>
    </div>
  );
};
