import { Router } from "express";
import { redirectToOriginalUrl } from "../controllers/url.controllers.js";
const router=Router()
router.route("/:shortCode").get(redirectToOriginalUrl)
export default router