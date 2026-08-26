import { API_BASE_URL_REVIEW } from '@env';
import { callApi } from '../apiClient';
import { REVIEW } from '../endpoints';
import { Review, CreateReviewPayload } from '../../types/review';

export const getReviewsByTagNo = (tagNo: string) =>
  callApi<null, Review[]>({
    method: 'get',
    url: REVIEW.BY_TAG_NO.replace(':tagNo', encodeURIComponent(tagNo)),
    baseURL: API_BASE_URL_REVIEW,
  });

export const createReview = (payload: CreateReviewPayload) =>
  callApi<CreateReviewPayload, string>({
    method: 'post',
    url: REVIEW.CREATE,
    data: payload,
    baseURL: API_BASE_URL_REVIEW,
  });
