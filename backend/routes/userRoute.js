import express from "express";
import { loginUser, getProfile, registerUser, updateProfile } from "../controllers/userController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

// Cấu hình multer để lưu ảnh vào thư mục uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // nhớ tạo sẵn thư mục uploads/
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Routes
userRouter.post("/register", upload.single("avatar"), registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getProfile);
userRouter.put("/profile", authMiddleware, upload.single("avatar"), updateProfile);

export default userRouter;
