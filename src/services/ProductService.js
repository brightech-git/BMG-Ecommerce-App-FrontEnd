import api from '../api/api';

// ── Products list with filters (paginated) ────────────────────────────────────
// GET /product/items/filter?itemName=Rings&page=0&pageSize=20&...
export const filterProducts = async (filters = {}) => {
  const cleaned = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] =
        typeof value === 'string' ? value.replace(/^"|"$/g, '').trim() : value;
    }
  });

  const response = await api.get('/product/items/filter', {params: cleaned});
  return response.data; // { success, data: [...], total, page, pageSize }
};

// ── Single product by tagKey ──────────────────────────────────────────────────
// GET /product/getTagkeyFilter/:tagKey
export const getProductByTagKey = async tagKey => {
  const response = await api.get(`/product/getTagkeyFilter/${tagKey}`);
  return response.data;
};

// ── Filter options for a category (sizes, subItems) ──────────────────────────
// GET /item-sizes/combined?itemName=Rings
export const getProductFilters = async itemName => {
  const response = await api.get('/item-sizes/combined', {
    params: {itemName},
  });
  return response.data; // { data: { sizes: [], subItems: [] } }
};

// ── Related products ──────────────────────────────────────────────────────────
export const getRelatedProducts = async (itemCtrId, pageSize = 8) => {
  const response = await api.get('/product/items/filter', {
    params: {itemCtrId, page: 0, pageSize},
  });
  return response.data;
};

// ── WhatsApp share link ───────────────────────────────────────────────────────
export const getWhatsappLink = async sno => {
  const response = await api.get('/product/whatsapp-link', {params: {sno}});
  return response.data;
};
