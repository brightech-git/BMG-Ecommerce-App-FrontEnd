// app/api/services/orderService.ts
// Mirrors website src/service/orderService.jsx. Auth token auto-attached by axios.
import { callApi } from '../apiClient';
import { ORDER, MISC } from '../endpoints';

export interface OrderAddressPayload {
  name: string;
  phone: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  alternatePhone?: string;
  landmark?: string;
  isDefault?: boolean;
  gstNumber?: string;
  companyName?: string;
  createdTime?: string;
  latitude?: number;
  longitude?: number;
}

export interface OrderItemPayload {
  sno: string;
  itemId: number;
  tagNo: string;
  productName: string;
  quantity: number;
  price: number;
  grossAmount: number;
  gstPer: number;
  gstAmount: number;
  netWt: number;
  grsWt: number;
  gstType: string;
  imagePath: string;
}

export interface CreateOrderPayload {
  totalAmount: number;
  paymentMode: 'ONLINE' | 'CASH';
  paymentStatus: 'PENDING' | 'PAID';
  courierName?: string;
  shippingPincode: string;
  address: OrderAddressPayload;
  items: OrderItemPayload[];
}

export const createOrder = (payload: CreateOrderPayload) =>
  callApi<CreateOrderPayload, any>({ method: 'post', url: ORDER.CREATE, data: payload, alertOnSessionExpired: true });

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

// DTDC live courier tracking by AWB / consignment number
// Mirrors website trackOrder() — POST /dtdc/track
export const trackDtdc = (awbNumber: string) =>
  callApi<any, any>({
    method: 'post',
    url: ORDER.DTDC_TRACK,
    data: { trkType: 'cnno', strcnno: awbNumber, addtnlDtl: 'Y' },
  });

export const submitRefund = (formData: any) =>
  callApi<any, any>({ method: 'post', url: MISC.REFUND_SUBMIT, data: formData });
