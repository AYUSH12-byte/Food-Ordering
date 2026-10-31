import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

import {
  getProfile,
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../../services/profileService";

const Profile = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState({
    label: "",
    address: "",
    phone: "",
    isDefault: false,
  });
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [savingAddress, setSavingAddress] = useState(false);

  // ==========================================
  // FETCH PROFILE
  // ==========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [response, addressResponse] = await Promise.all([
        getProfile(),
        getAddresses(),
      ]);

      const profileUser = response.user;
      setAddresses(addressResponse.addresses || []);

      setProfile({
        name: profileUser?.name || "",
        email: profileUser?.email || "",
        phone: profileUser?.phone || "",
        address: profileUser?.address || "",
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==========================================
  // PROFILE INPUT CHANGE
  // ==========================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // PASSWORD INPUT CHANGE
  // ==========================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddressInputChange = (event) => {
    const { name, value, checked, type } = event.target;
    setAddressForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAddressForm = () => {
    setAddressForm({
      label: "",
      address: "",
      phone: "",
      isDefault: false,
    });
    setEditingAddressId(null);
  };

  const applyAddressList = (nextAddresses) => {
    setAddresses(nextAddresses);
    const defaultAddress = nextAddresses.find((address) => address.isDefault);
    if (defaultAddress) {
      setProfile((previous) => ({
        ...previous,
        address: defaultAddress.address,
        phone: defaultAddress.phone,
      }));
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSavingAddress(true);
      const response = editingAddressId
        ? await updateAddress(editingAddressId, addressForm)
        : await addAddress(addressForm);

      applyAddressList(response.addresses || []);
      resetAddressForm();
      setSuccess(
        editingAddressId
          ? "Delivery address updated successfully"
          : "Delivery address saved successfully",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to save delivery address",
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = (address) => {
    setAddressForm({
      label: address.label,
      address: address.address,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingAddressId(address._id);
    setError("");
    setSuccess("");
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      setError("");
      setSuccess("");
      const response = await setDefaultAddress(id);
      applyAddressList(response.addresses || []);
      setSuccess("Default delivery address updated");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to update default address",
      );
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm("Delete this saved delivery address?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      const response = await deleteAddress(id);
      applyAddressList(response.addresses || []);
      if (editingAddressId === id) {
        resetAddressForm();
      }
      setSuccess("Delivery address deleted");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Failed to delete delivery address",
      );
    }
  };

  // ==========================================
  // SAVE PROFILE
  // ==========================================

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateProfile({
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        address: profile.address.trim(),
      });

      // Get updated user from backend
      const updatedUser = response.user;

      // Update local profile state
      setProfile({
        name: updatedUser?.name || "",
        email: updatedUser?.email || "",
        phone: updatedUser?.phone || "",
        address: updatedUser?.address || "",
      });

      // Update AuthContext + localStorage
      updateUser(updatedUser);

      setSuccess("Profile updated successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // Check password confirmation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");

      return;
    }

    // Check password length
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");

      return;
    }

    try {
      setChangingPassword(true);

      await changePassword({
        currentPassword: passwordData.currentPassword,

        newPassword: passwordData.newPassword,
      });

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setSuccess("Password changed successfully");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />

          <div className="h-80 rounded-2xl bg-slate-200" />

          <div className="h-64 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}

      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
          Account
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">My Profile</h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your account and delivery information.
        </p>
      </div>

      {/* Messages */}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          {success}
        </div>
      )}

      {/* ========================================
          PERSONAL INFORMATION
      ======================================== */}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your personal and delivery information.
          </p>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-6 space-y-5">
          {/* Name */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleProfileChange}
              placeholder="Enter your full name"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Email */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-slate-500 outline-none"
            />

            <p className="mt-1 text-xs text-slate-400">
              Email cannot be changed here.
            </p>
          </div>

          {/* Phone */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Phone
            </label>

            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleProfileChange}
              placeholder="Enter your phone number"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Address */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Delivery Address
            </label>

            <textarea
              name="address"
              value={profile.address}
              onChange={handleProfileChange}
              placeholder="Enter your delivery address"
              rows={4}
              required
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Save */}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Saved Delivery Addresses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Save up to 10 addresses and choose one as your default for checkout.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-start sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {address.label}
                  </h3>
                  {address.isDefault && (
                    <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-600">{address.address}</p>
                <p className="mt-1 text-sm text-slate-500">{address.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefaultAddress(address._id)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Make default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleEditAddress(address)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(address._id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {addresses.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              No saved addresses yet. Add one below.
            </p>
          )}
        </div>

        <form onSubmit={handleAddressSubmit} className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <h3 className="font-semibold text-slate-900">
            {editingAddressId ? "Edit address" : "Add a new address"}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="saved-address-label"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Label
              </label>
              <input
                id="saved-address-label"
                name="label"
                value={addressForm.label}
                onChange={handleAddressInputChange}
                placeholder="Home, Office..."
                maxLength={40}
                required
                disabled={savingAddress}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div>
              <label
                htmlFor="saved-address-phone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Delivery phone
              </label>
              <input
                id="saved-address-phone"
                name="phone"
                type="tel"
                value={addressForm.phone}
                onChange={handleAddressInputChange}
                placeholder="+977 98XXXXXXXX"
                maxLength={30}
                required
                disabled={savingAddress}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="saved-address-text"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Full address
            </label>
            <textarea
              id="saved-address-text"
              name="address"
              value={addressForm.address}
              onChange={handleAddressInputChange}
              placeholder="Street, building, city, and nearby landmark"
              maxLength={300}
              rows={3}
              required
              disabled={savingAddress}
              className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isDefault"
              checked={addressForm.isDefault}
              onChange={handleAddressInputChange}
              disabled={
                savingAddress ||
                (editingAddressId !== null && addressForm.isDefault)
              }
              className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
            Set as default address
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={savingAddress}
              className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingAddress
                ? "Saving..."
                : editingAddressId
                  ? "Save Address"
                  : "Add Address"}
            </button>
            {editingAddressId && (
              <button
                type="button"
                onClick={resetAddressForm}
                disabled={savingAddress}
                className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ========================================
          CHANGE PASSWORD
      ======================================== */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Change Password</h2>

          <p className="mt-1 text-sm text-slate-500">
            Keep your account secure by using a strong password.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
          {/* Current Password */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Current Password
            </label>

            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* New Password */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              minLength={6}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              Password must be at least 6 characters.
            </p>
          </div>

          {/* Confirm Password */}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              minLength={6}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-100"
            />
          </div>

          {/* Change Password */}

          <button
            type="submit"
            disabled={changingPassword}
            className="rounded-lg border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
