import api from '../api/api';

// POST /recently-viewed/add?tagKey=xxx
export const addRecentlyViewed = async tagKey => {
  const response = await api.post('/recently-viewed/add', null, {
    params: {tagKey},
  });
  return response.data;
};

// GET /recently-viewed/list
export const getRecentlyViewedItems = async () => {
  const response = await api.get('/recently-viewed/list');
  return response.data;
};
