// middleware/auth.js
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  console.log("Token received:", token);

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    console.log("❌ Invalid token error:", error.message);
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default authMiddleware;