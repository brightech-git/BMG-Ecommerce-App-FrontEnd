import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviewsByTagNo, createReview } from '../services/reviewService';
import { CreateReviewPayload } from '../../types/review';
import { toastSuccess, toastError, errMsg } from '../../utils/toast';

export const useProductReviews = (tagNo?: string | null) => {
  const q = useQuery({
    queryKey: ['reviews', tagNo],
    queryFn: () => getReviewsByTagNo(tagNo as string),
    enabled: !!tagNo,
  });
  const reviews: any[] = Array.isArray(q.data) ? q.data : (q.data as any)?.data ?? [];
  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length
    : 0;

  return { ...q, reviews, avgRating, count: reviews.length };
};

export const useSubmitReview = (tagNo?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews', tagNo] });
      toastSuccess('Review submitted successfully');
    },
    onError: (e) => toastError('Could not submit review', errMsg(e)),
  });
};
