// app/api/hooks/useOrders.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderHistory, getAllOrdersCount, getOrderById, trackOrderByUser,
  orderTrackingById, getOrderStatusMaster, cancelOrder, reorder,
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

export const useOrderById = (orderId?: string | number) =>
  useQuery({ queryKey: ['order', orderId], queryFn: () => getOrderById(orderId!), enabled: !!orderId });

export const useOrderTracking = (orderId?: string | number) =>
  useQuery({ queryKey: ['orderTracking', orderId], queryFn: () => orderTrackingById(orderId!), enabled: !!orderId });

export const useOrderTrackByUser = (orderId?: string | number) =>
  useQuery({ queryKey: ['orderTrackUser', orderId], queryFn: () => trackOrderByUser(orderId!), enabled: !!orderId });

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
