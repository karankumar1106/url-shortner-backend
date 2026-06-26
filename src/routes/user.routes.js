import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  refreshAccessToken
} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/", registerUser);
router.get("/login", loginUser);
router.get("/logout",verifyJWT,logoutUser)
router.get("/me",verifyJWT,getCurrentUser)
router.get("/refresh-token",refreshAccessToken)

export default router;
