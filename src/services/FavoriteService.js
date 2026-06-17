import api from '../api/api';

// GET /wishlist  → { data: { products: [...] } }
export const getFavorites = async () => {
  const response = await api.get('/wishlist');
  return response.data;
};

// POST /wishlist
export const addFavorite = async wishlistData => {
  const response = await api.post('/wishlist', wishlistData);
  return response.data;
};

// DELETE /wishlist/:tagKey
export const removeFavorite = async tagKey => {
  const response = await api.delete(`/wishlist/${tagKey}`);
  return response.data;
};
