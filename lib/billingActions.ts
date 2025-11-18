"use server";

import { client as sanityClient } from "@/lib/sanity_client";
import Razorpay from "razorpay";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: string;
    name: string;
    email: string;
}

const PLANS = {
    monthly: {
        id: "plan_RfO2GSqwdo46HJ", // Your real ID
        total_count: 120,
    },
    yearly: {
        id: "plan_RfO3vC13fUKTLH", // Your real ID
        total_count: 10,
    },
};

export async function createSubscriptionLink(planKey: "monthly" | "yearly", token: string) {
    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
        return { success: false, error: "Your session is invalid or has expired." };
    }

    const userId = decodedToken.id;
    if (!userId) {
        return { success: false, error: "Authentication failed." };
    }

    const user = await sanityClient.fetch(`*[_type == "user" && _id == "${userId}"][0]`);
    if (!user) {
        return { success: false, error: "User not found." };
    }

    const planDetails = PLANS[planKey];
    if (!planDetails) {
        return { success: false, error: "Invalid plan selected." };
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const subscriptionPayload = {
            plan_id: planDetails.id,
            total_count: planDetails.total_count,
            quantity: 1,
            customer_notify: true, // Use boolean true
            notes: {
                userId: user._id,
                username: user.name,
            },
        };

        const subscription = await razorpay.subscriptions.create(subscriptionPayload);

        // Return both the ID (for polling) and the checkout URL
        return { success: true, checkoutUrl: subscription.short_url, subscriptionId: subscription.id };

    } catch (error: any) {
        console.error("Razorpay subscription creation error:", error);
        // Provide a more specific error message if possible
        const description = error.error?.description || "Could not create subscription link.";
        return { success: false, error: description };
    }
}



export async function cancelSubscription(token: string) {
    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
        return { success: false, error: "Your session is invalid. Please sign in again." };
    }

    const userId = decodedToken.id;
    const subscriptionDoc = await sanityClient.fetch(`*[_type == "subscription" && user._ref == "${userId}"][0]`);

    if (!subscriptionDoc || !subscriptionDoc.razorpaySubscriptionId) {
        return { success: false, error: "No active subscription found to cancel." };
    }

    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        // Cancel on Razorpay's end (stops future billing)
        await razorpay.subscriptions.cancel(subscriptionDoc.razorpaySubscriptionId);

        // Update status in Sanity
        await sanityClient.patch(subscriptionDoc._id).set({ status: 'cancelled' }).commit();

        return { success: true, message: "Your subscription has been cancelled successfully." };
    } catch (error: any) {
        console.error("Error cancelling subscription:", error);
        // If it's already cancelled on Razorpay, we can still update our DB
        if (error.error?.code === 'BAD_REQUEST_ERROR') {
            await sanityClient.patch(subscriptionDoc._id).set({ status: 'cancelled' }).commit();
            return { success: true, message: "Subscription already inactive, status updated." };
        }
        return { success: false, error: "Could not cancel subscription. Please contact support." };
    }
}