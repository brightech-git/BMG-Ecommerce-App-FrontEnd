// app/api/services/paymentService.ts
// Mirrors website paymentService.jsx + paymentServiceicici.js.
import { callApi } from '../apiClient';
import { PAYMENT } from '../endpoints';

export const createPaymentLink = (payload: any) =>
  callApi<any, any>({ method: 'post', url: PAYMENT.CREATE_LINK, data: payload, alertOnSessionExpired: true });

/** POST /payment/initiate-sale -> { redirectURI, tranCtx } */
export const initiatePayment = (paymentData: any) =>
  callApi<any, any>({ method: 'post', url: PAYMENT.INITIATE_SALE, data: paymentData, alertOnSessionExpired: true });

/** POST /payment/redirect-url -> returns the gateway URL as text */
export const getPaymentRedirectUrl = (redirectURI: string, tranCtx: string) =>
  callApi<any, any>({
    method: 'post',
    url: PAYMENT.REDIRECT_URL,
    data: { redirectURI, tranCtx },
  });

/** POST /payment/status -> transaction status for an order */
export const getPaymentStatus = (orderId: string | number) =>
  callApi<any, any>({
    method: 'post',
    url: PAYMENT.STATUS,
    data: { merchantTxnNo: orderId, originalTxnNo: orderId, transactionType: 'STATUS' },
  });

/** GET /payment/verify-payment?orderId= */
export const verifyPayment = (orderId: string | number) =>
  callApi<null, any>({ method: 'get', url: PAYMENT.VERIFY, params: { orderId } });
