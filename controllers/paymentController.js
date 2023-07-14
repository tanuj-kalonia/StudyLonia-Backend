import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import User from "../models/User.js";
import Payment from "../models/payment.js"
import { instance } from "../server.js";
import ErrorHandler from "../utils/erorrHandler.js";
import crypt from "crypto";

export const buySubscription = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        // console.log("user while subs", user);
        if (user.role === "admin")
            return next(new ErrorHandler("Admin cant buy subscription"), 404);

        const plan_id = process.env.PLAN_ID;

        // This will store the subs id,stuats of the user

        const subscription = await instance.subscriptions.create({
            plan_id: plan_id,
            customer_notify: 1,
            total_count: 12
        });
        console.log("subscription id : ", subscription);
        user.subscription.id = subscription.id;
        user.subscription.status = subscription.status;
        await user.save()

        res.status(201).json({
            success: true,
            subscriptionId: subscription.id
        })
    } catch (error) {
        console.log(error);
    }

}

export const paymentVerification = catchAsyncError(async (req, res, next) => {

    const { razorpay_signature, razorpay_payment_id, razorpay_subscription_id } = req.body;

    const user = await User.findById(req.user._id);

    const subscription_id = user.subscription.id;

    // hashing the signature
    const generated_signature = crypt
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(razorpay_payment_id + "|" + subscription_id, "utf-8")
        .digest("hex")

    const isAutheticate = generated_signature === razorpay_signature;
    if (!isAutheticate) return res.direct(`${process.env.FRONT_END_URL}/paymentfail`)

    // storing the info in database if user is autheticated
    await Payment.create({
        razorpay_signature,
        razorpay_payment_id,
        razorpay_subscription_id
    })

    user.subscription.status = "active";
    await user.save();

    res.redirect(`${process.env.FRONT_END_URL}/paymentsuccess?referece=${razorpay_payment_id}`)

})

export const getRazorPayKey = catchAsyncError(async (req, res, next) => {
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
})
export const cancelSubscription = catchAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user._id);
    const subscriptionId = user.subscription.id;

    let refund = false;

    // cancelling the subscription
    console.log("Initiating calcelation");
    await instance.subscriptions.cancel(subscriptionId);

    // processing for refund if elligible
    console.log("Cheking for refund");
    const payment = await Payment.findOne({
        razorpay_subscription_id: subscriptionId
    })

    // finding the gap of the user after subscription
    const gap = Date.now() - payment.createdAt;

    // user active time after his subs starts in ms
    const refundTime = 7 * 24 * 60 * 60 * 1000;
    console.log("Your refund time is", refundTime);
    if (refundTime > gap) {
        await instance.payments.refund(payment.razorpay_payment_id);
        refund = true;
    }
    console.log("refund", refund);
    await payment.remove();
    user.subscription.id = undefined;
    user.subscription.status = undefined;

    await user.save();
    let message;
    if (refund) message = "Subscription cancelled, You will receive full refund within 7 days."
    else message = "Subscription cancelled, Now refund initiated as subscription was cancelled after 7 days.";

    console.log("subs removed and saved");
    return res.status(200).json({
        success: true,
        message
    })


})