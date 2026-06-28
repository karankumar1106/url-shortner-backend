import { Router } from "express";
import { createShortUrl,getUrlStats,getMyUrls,deactivateUrl} from "../controllers/url.controllers.js";
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router=Router()
router.route("/").post(verifyJWT,createShortUrl)
router.get("/:shortCode/stats",verifyJWT,getUrlStats)
router.get("/my",verifyJWT,getMyUrls)
router.delete("/:shortCode/delete",verifyJWT,deactivateUrl)
export default router