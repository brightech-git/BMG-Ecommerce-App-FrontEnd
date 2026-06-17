import api from '../api/api';

// Budget banners (drives the entire Home feed)
// GET /budget-categories/getOnlyVisible
export const getAllBudgetBanners = async () => {
  const response = await api.get('/budget-categories/getOnlyVisible');
  return response.data; // { data: { key: bannerConfig } }
};

// Category images (main category grid)
// GET /mainCategory_images/list
export const getCategoryImages = async () => {
  const response = await api.get('/mainCategory_images/list');
  return response.data;
};

// Today's gold & silver rates
// GET /product/todayrate
export const getTodayRates = async () => {
  const response = await api.get('/product/todayrate');
  return response.data;
};
