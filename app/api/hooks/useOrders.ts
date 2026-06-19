// app/api/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderHistory, getAllOrdersCount, getOrderById, trackOrderByUser,
  orderTrackingById, getOrderStatusMaster, cancelOrder, reorder, getOrderInvoice, trackDtdc,
} from '../services/orderService';
import { useAuthToken } from './useAuthToken';
import { toastSuccess, toastError, errMsg } from '../../utils/toast';

export const useOrderHistory = (params?: Record<string, any>) => {
  const token = useAuthToken();
  return useQuery({
    queryKey: ['orderHistory', params ?? {}],
    queryFn: () => getOrderHistory(params),
    enabled: !!token,
  });
};

export const useAllOrdersCount = () => {
  const token = useAuthToken();
  return useQuery({ queryKey: ['ordersCount'], queryFn: getAllOrdersCount, enabled: !!token });
};

export const useOrderById = (orderId?: string | number) => {
  // Normalize to string so '123' and 123 never split into two cache entries
  const id = orderId != null ? String(orderId) : undefined;
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  });
};

export const useOrderTracking = (orderId?: string | number) => {
  const id = orderId != null ? String(orderId) : undefined;
  return useQuery({
    queryKey: ['orderTracking', id],
    queryFn: () => orderTrackingById(id!),
    enabled: !!id,
  });
};

export const useOrderTrackByUser = (orderId?: string | number) => {
  const id = orderId != null ? String(orderId) : undefined;
  return useQuery({
    queryKey: ['orderTrackUser', id],
    queryFn: () => trackOrderByUser(id!),
    enabled: !!id,
  });
};

export const useOrderStatusMaster = () =>
  useQuery({ queryKey: ['orderStatusMaster'], queryFn: getOrderStatusMaster, staleTime: 1000 * 60 * 30 });

export const useCancelOrder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orderHistory'] });
      qc.invalidateQueries({ queryKey: ['order'] });
      toastSuccess('Order updated');
    },
    onError: (e) => toastError('Could not cancel order', errMsg(e)),
  });
};

export const useReorder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reorder,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cart'] }); toastSuccess('Items added to cart'); },
    onError: (e) => toastError('Reorder failed', errMsg(e)),
  });
};

export const useOrderInvoice = (orderId?: string | number) =>
  useQuery({
    queryKey: ['orderInvoice', orderId],
    queryFn: () => getOrderInvoice(orderId!),
    enabled: false, // only fetch on demand via refetch()
    retry: false,
  });

// Live DTDC courier tracking by AWB number — mirrors website trackOrder()
// Only fires when awbNumber is available (extracted from order data)
export const useDtdcTrack = (awbNumber?: string) =>
  useQuery({
    queryKey: ['dtdcTrack', awbNumber],
    queryFn: () => trackDtdc(awbNumber!),
    enabled: !!awbNumber,
    staleTime: 1000 * 60 * 5, // 5 min — DTDC won't update more often than that
    retry: 1,
  });
