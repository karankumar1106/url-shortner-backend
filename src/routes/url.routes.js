import { Router } from "express";
import { createShortUrl } from "../controllers/url.controllers.js";

const router=Router()
router.route("/").post(createShortUrl)
export default router