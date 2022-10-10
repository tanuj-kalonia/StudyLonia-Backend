import express from "express";
import { contact, getDashboardStats, requestCourse } from "../controllers/otherController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// contact form 
router.route("/contact").post(contact);

// course request
router.route("/courserequest").post(requestCourse);

// get admin Dashboard stats
router.route("/admin/stats").get(isAuthenticated, authorizeAdmin, getDashboardStats);

export default router;