import api from "./api";

// GET PROFILE

export const getProfile =
  async () => {
    const response =
      await api.get(
        "/auth/me"
      );

    return response.data;
  };

// UPDATE PROFILE

export const updateProfile =
  async (profileData) => {
    const response =
      await api.put(
        "/auth/profile",
        profileData
      );

    return response.data;
  };

export const getAddresses = async () => {
  const response = await api.get("/auth/addresses");
  return response.data;
};

export const addAddress = async (addressData) => {
  const response = await api.post("/auth/addresses", addressData);
  return response.data;
};

export const updateAddress = async (id, addressData) => {
  const response = await api.put(`/auth/addresses/${id}`, addressData);
  return response.data;
};

export const setDefaultAddress = async (id) => {
  const response = await api.put(`/auth/addresses/${id}/default`);
  return response.data;
};

export const deleteAddress = async (id) => {
  const response = await api.delete(`/auth/addresses/${id}`);
  return response.data;
};

// CHANGE PASSWORD

export const changePassword =
  async (passwordData) => {
    const response =
      await api.put(
        "/auth/change-password",
        passwordData
      );

    return response.data;
  };