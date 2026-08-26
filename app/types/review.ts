// Mirrors backend com.VTM.application.review.Review
export interface Review {
  id?: number;
  reviewerName: string;
  comment: string;
  rating: number;
  tagNo: string;
  itemId: string;
  postedAt?: string;
}

export interface CreateReviewPayload {
  reviewerName: string;
  comment: string;
  rating: number;
  tagNo: string;
  itemId: string;
}
