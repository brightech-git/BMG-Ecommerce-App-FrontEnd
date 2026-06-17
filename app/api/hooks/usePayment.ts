// app/api/hooks/usePayment.ts
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  initiatePayment, getPaymentRedirectUrl, getPaymentStatus, verifyPayment,
} from '../services/paymentService';

export const useInitiatePayment = () => useMutation({ mutationFn: initiatePayment });

export const useVerifyPayment = (orderId?: string | number) =>
  useQuery({ queryKey: ['verifyPayment', orderId], queryFn: () => verifyPayment(orderId!), enabled: !!orderId });

export { getPaymentRedirectUrl, getPaymentStatus, verifyPayment, initiatePayment };
