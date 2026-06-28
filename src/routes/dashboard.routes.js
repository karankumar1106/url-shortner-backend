import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router()
router.get("/",verifyJWT,getDashboardStats)
export default router