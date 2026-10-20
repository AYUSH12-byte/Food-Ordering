import api from "./api";

// CREATE ORDER

export const createOrder = async (orderData) => {
  const response = await api.post("/orders", orderData);

  return response.data;
};

// GET MY ORDERS

export const getMyOrders = async () => {
  const response = await api.get("/orders/my-orders");

  return response.data;
};

export const reorderOrder = async (id) => {
  const response = await api.post(`/orders/${id}/reorder`);
  return response.data;
};

// GET SINGLE ORDER

export const getOrderById = async (id) => {
  const response = await api.get(`/orders/${id}`);

  return response.data;
};

// ADMIN - GET ALL ORDERS

export const getAllOrders = async () => {
  const response = await api.get("/orders");

  return response.data;
};

// ADMIN - UPDATE ORDER STATUS

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await api.put(`/orders/${id}/status`, {
    orderStatus,
  });

  return response.data;
};
