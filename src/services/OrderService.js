import api from '../api/api';

// POST /order/create
export const createOrder = async orderData => {
  const response = await api.post('/order/create', orderData);
  return response.data;
};

// GET /order/history
export const getOrderHistory = async (params = {}) => {
  const response = await api.get('/order/history', {params});
  return response.data;
};

// GET /order/getOrder?orderId=xxx
export const getOrderById = async orderId => {
  const {data} = await api.get('/order/getOrder', {params: {orderId}});
  return data;
};

// POST /order/update-status  (cancel)
export const cancelOrder = async payload => {
  const response = await api.post('/order/update-status', payload);
  return response.data;
};

// POST /order/reorder
export const createReOrder = async orderId => {
  const {data} = await api.post('/order/reorder', {orderId});
  return data;
};

// GET /order/track/user?orderId=xxx
export const trackOrderById = async orderId => {
  const {data} = await api.get('/order/track/user', {params: {orderId}});
  return data;
};
