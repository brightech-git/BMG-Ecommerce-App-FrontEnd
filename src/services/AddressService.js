import api from '../api/api';

// GET /addresses/customer/:customerId
export const getAddressesByCustomer = async customerId => {
  const response = await api.get(`/addresses/customer/${customerId}`);
  return response.data;
};

// POST /addresses/create
export const createAddress = async addressData => {
  const response = await api.post('/addresses/create', addressData);
  return response.data;
};

// PUT /addresses/update/:id
export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/addresses/update/${id}`, addressData);
  return response.data;
};

// DELETE /addresses/delete/:id
export const deleteAddress = async id => {
  const response = await api.delete(`/addresses/delete/${id}`);
  return response.data;
};

// GET /addresses/geocode?latitude=&longitude=
export const geocodeAddress = async (latitude, longitude) => {
  const response = await api.get('/addresses/geocode', {
    params: {latitude, longitude},
  });
  return response.data;
};
