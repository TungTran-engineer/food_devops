import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

// Hàm tạo token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ===================== LOGIN =====================
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log("📌 Body nhận từ frontend (login):", req.body);

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        console.log("✅ Login thành công:", user.email);

        res.json({ success: true, token, user });
    } catch (error) {
        console.log("❌ Lỗi login:", error);
        res.json({ success: false, message: "Error" });
    }
};

// ===================== REGISTER =====================
const registerUser = async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    try {
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" });
        }
        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 chars" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            profile: {
                phone: phone || "",
                address: address || "",
                avatar: req.file ? `/uploads/${req.file.filename}` : ""
            }
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({ success: true, token, user });
    } catch (error) {
        console.log("❌ Register error:", error);
        res.json({ success: false, message: "Error" });
    }
};

// ===================== PROFILE =====================
const getProfile = async (req, res) => {
  console.log("User ID from token:", req.user.id);
  try {
    const user = await userModel.findById(req.user.id);
    console.log("User from database:", user);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        avatar: user.profile.avatar || "",
        phone: user.profile.phone || "",
        address: user.profile.address || ""
      }
    });
  } catch (err) {
    console.log("Error in getProfile:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};


const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Cập nhật các trường nếu được cung cấp
    if (name) user.name = name;
    if (phone) user.profile.phone = phone;
    if (address) user.profile.address = address;
    if (req.file) user.profile.avatar = `/uploads/${req.file.filename}`; // Cập nhật avatar nếu có file upload

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.profile.avatar || "",
        phone: updatedUser.profile.phone || "",
        address: updatedUser.profile.address || "",
      },
    });
  } catch (error) {
    console.log("❌ Update profile error:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
};
// ✅ Export tất cả các hàm
export { loginUser, registerUser, getProfile, updateProfile };