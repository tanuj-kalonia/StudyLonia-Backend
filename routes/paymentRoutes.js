import express from "express";
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from "../controllers/paymentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Buy subscription
router.route("/subscribe").get(isAuthenticated, buySubscription)

// payment verification
router.route("/paymentverification").post(isAuthenticated, paymentVerification)

// GET RAZORPAY KEY
router.route("/razorpaykey").get(getRazorPayKey)

// cancel subscription
router.route("/subscribe/cancel").get(isAuthenticated, cancelSubscription)

export default router;