import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = Router();
router.post("/register",upload.single('profileImage'), registerUser);
router.post("/login", loginUser);
router.post("/logout",verifyJWT,logoutUser)
router.get("/me",verifyJWT,getCurrentUser)
router.post("/refresh-token",refreshAccessToken)

export default router;
