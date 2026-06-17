// app/api/services/orderService.ts
// Mirrors website src/service/orderService.jsx. Auth token auto-attached by axios.
import { callApi } from '../apiClient';
import { ORDER, MISC } from '../endpoints';

export interface OrderItemPayload {
  itemId?: string | number;
  productName?: string;
  grossAmount?: number;
  price?: number;
  tagNo?: string;
  sno?: string;
  grsWt?: number;
  netWt?: number;
  imagePath?: string;
  quantity?: number;
  gstType?: string;
  gstPer?: number;
  gstAmount?: number;
}

export interface CreateOrderPayload {
  customerName?: string;
  contact?: string;
  email?: string;
  totalAmount: number;
  paymentMode: 'ONLINE' | 'COD';
  paymentType?: string | null;
  paymentStatus?: string;
  shippingPincode?: string;
  address?: any;
  items: OrderItemPayload[];
}

export const createOrder = (payload: CreateOrderPayload) =>
  callApi<CreateOrderPayload, any>({ method: 'post', url: ORDER.CREATE, data: payload });

export const getOrderHistory = (params?: Record<string, any>) =>
  callApi<null, any>({ method: 'get', url: ORDER.HISTORY, params });

export const getAllOrdersCount = () =>
  callApi<null, any>({ method: 'get', url: ORDER.COUNT });

export const getOrderById = (orderId: string | number) =>
  callApi<null, any>({ method: 'get', url: ORDER.GET_ORDER, params: { orderId } });

export const trackOrderByUser = (orderId: string | number) =>
  callApi<null, any>({ method: 'get', url: ORDER.TRACK_USER, params: { orderId } });

export const orderTrackingById = (orderId: string | number) =>
  callApi<null, any>({ method: 'get', url: ORDER.TRACK_BY_ID.replace(':orderId', String(orderId)) });

export const getOrderStatusMaster = () =>
  callApi<null, any>({ method: 'get', url: ORDER.STATUS_MASTER });

export const updateOrderStatus = (payload: any) =>
  callApi<any, any>({ method: 'post', url: ORDER.UPDATE_STATUS, data: payload });

export const cancelOrder = (payload: any) =>
  callApi<any, any>({ method: 'post', url: ORDER.UPDATE_STATUS, data: payload });

export const reorder = (orderId: string | number) =>
  callApi<any, any>({ method: 'post', url: ORDER.REORDER, data: { orderId } });

export const getOrderInvoice = (orderId: string | number) =>
  callApi<null, any>({ method: 'get', url: ORDER.INVOICE.replace(':orderId', String(orderId)) });

export const submitRefund = (formData: any) =>
  callApi<any, any>({ method: 'post', url: MISC.REFUND_SUBMIT, data: formData });
