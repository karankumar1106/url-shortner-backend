import { getUrlAnalytics } from "../controllers/analytics.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { Router } from "express";

const router=Router()

router.get("/:shortCode",verifyJWT,getUrlAnalytics)

export default router