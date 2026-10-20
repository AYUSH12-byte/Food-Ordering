import api from "./api";

export const validateCoupon = async (code) => {
  const response = await api.post("/coupons/validate", { code });
  return response.data;
};

export const getAvailableCoupons = async () => {
  const response = await api.get("/coupons/available");
  return response.data;
};

export const getCoupons = async () => {
  const response = await api.get("/coupons");
  return response.data;
};

export const createCoupon = async (coupon) => {
  const response = await api.post("/coupons", coupon);
  return response.data;
};

export const updateCouponStatus = async (id, isActive) => {
  const response = await api.patch(`/coupons/${id}/status`, { isActive });
  return response.data;
};

export const deleteCoupon = async (id) => {
  const response = await api.delete(`/coupons/${id}`);
  return response.data;
};
