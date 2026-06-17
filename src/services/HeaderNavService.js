import api from '../api/api';

// GET /header-nav — returns { menuSections: [...], shopId }
export const getHeaderNav = async () => {
  const response = await api.get('/header-nav');
  return response.data;
};

// GET /menu/filter/list — returns { headers: [...] } with filter keys/content
export const getMenuFilters = async () => {
  const response = await api.get('/menu/filter/list');
  console.log(response.data)
  return response.data;
};
