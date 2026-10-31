const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getSavedAddresses = async (user) => {
  if (user.savedAddresses.length === 0 && user.address) {
    user.savedAddresses.push({
      label: "Home",
      address: user.address,
      phone: user.phone,
      isDefault: true,
    });
    await user.save();
  } else if (
    user.savedAddresses.length > 0 &&
    !user.savedAddresses.some((address) => address.isDefault)
  ) {
    user.savedAddresses[0].isDefault = true;
    await user.save();
  }

  return user.savedAddresses;
};

const syncDefaultAddress = (user) => {
  const defaultAddress = user.savedAddresses.find(
    (address) => address.isDefault,
  );

  if (defaultAddress) {
    user.address = defaultAddress.address;
    user.phone = defaultAddress.phone;
  }
};

const parseAddress = (body) => {
  const { label, address, phone } = body;

  if (
    typeof label !== "string" ||
    typeof address !== "string" ||
    typeof phone !== "string" ||
    !label.trim() ||
    !address.trim() ||
    !phone.trim() ||
    label.trim().length > 40 ||
    address.trim().length > 300 ||
    phone.trim().length > 30
  ) {
    return null;
  }

  return {
    label: label.trim(),
    address: address.trim(),
    phone: phone.trim(),
  };
};

// GENERATE JWT

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// REGISTER

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone.trim(),
      address: address.trim(),
      role: "customer",
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// LOGIN

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// GET CURRENT USER

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Me Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// UPDATE PROFILE

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      user.name = name.trim();
    }

    if (phone !== undefined) {
      if (!phone.trim()) {
        return res.status(400).json({
          success: false,
          message: "Phone cannot be empty",
        });
      }

      user.phone = phone.trim();
    }

    if (address !== undefined) {
      if (!address.trim()) {
        return res.status(400).json({
          success: false,
          message: "Address cannot be empty",
        });
      }

      user.address = address.trim();
    }

    const defaultAddress = user.savedAddresses.find(
      (savedAddress) => savedAddress.isDefault,
    );
    if (defaultAddress) {
      defaultAddress.address = user.address;
      defaultAddress.phone = user.phone;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const listAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addresses = await getSavedAddresses(user);

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("List Addresses Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addAddress = async (req, res) => {
  try {
    const addressData = parseAddress(req.body);

    if (!addressData) {
      return res.status(400).json({
        success: false,
        message: "Label, address, and phone are required and must be within the allowed length",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await getSavedAddresses(user);

    if (user.savedAddresses.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "You can save up to 10 addresses",
      });
    }

    const isDefault =
      req.body.isDefault === true || user.savedAddresses.length === 0;

    if (isDefault) {
      user.savedAddresses.forEach((savedAddress) => {
        savedAddress.isDefault = false;
      });
    }

    user.savedAddresses.push({
      ...addressData,
      isDefault,
    });
    syncDefaultAddress(user);
    await user.save();

    res.status(201).json({
      success: true,
      message: "Address saved successfully",
      addresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Add Address Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const addressData = parseAddress(req.body);

    if (!addressData) {
      return res.status(400).json({
        success: false,
        message: "Label, address, and phone are required and must be within the allowed length",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await getSavedAddresses(user);
    const savedAddress = user.savedAddresses.id(req.params.addressId);

    if (!savedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    savedAddress.set(addressData);

    if (req.body.isDefault === true) {
      user.savedAddresses.forEach((address) => {
        address.isDefault = address._id.equals(savedAddress._id);
      });
    }

    syncDefaultAddress(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      addresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Update Address Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await getSavedAddresses(user);
    const savedAddress = user.savedAddresses.id(req.params.addressId);

    if (!savedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    user.savedAddresses.forEach((address) => {
      address.isDefault = address._id.equals(savedAddress._id);
    });
    syncDefaultAddress(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Default address updated",
      addresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Set Default Address Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await getSavedAddresses(user);
    const savedAddress = user.savedAddresses.id(req.params.addressId);

    if (!savedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const wasDefault = savedAddress.isDefault;
    savedAddress.deleteOne();

    if (wasDefault && user.savedAddresses.length > 0) {
      user.savedAddresses[0].isDefault = true;
    }

    syncDefaultAddress(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
      addresses: user.savedAddresses,
    });
  } catch (error) {
    console.error("Delete Address Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// CHANGE PASSWORD

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  listAddresses,
  addAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
  changePassword,
};
