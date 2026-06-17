import api from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GET /cart/summary  — returns { data: { products: [...] } }
export const fetchCartSummary = async () => {
  const pincode = await AsyncStorage.getItem('userPincode');
  const params = pincode ? {pincode} : {};
  const response = await api.get('/cart/summary', {params});
  return response.data;
};

// POST /cart/product
export const addToCart = async cartItem => {
  const response = await api.post('/cart/product', cartItem);
  return response.data;
};

// DELETE /cart/delete/:id
export const deleteCartItem = async id => {
  const response = await api.delete(`/cart/delete/${id}`);
  return response.data;
};

// DELETE /cart/clear
export const clearCart = async () => {
  const response = await api.delete('/cart/clear');
  return response.data;
};
