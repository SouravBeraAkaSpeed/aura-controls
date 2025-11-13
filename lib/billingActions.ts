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
        id: "plan_RfOaqK0uY6YFhv",
        total_count: 120,
    },
    yearly: {
        id: "plan_RfOZniULfClaI9",
        total_count: 10,
    },
};

export async function createSubscriptionLink(planKey: "monthly" | "yearly", token: string) {
    let decodedToken: JwtPayload;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    } catch (error) {
        return { success: false, error: "Your session is invalid or has expired. Please sign in again." };
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
            customer_notify: true,
            notes: {
                userId: user._id,
                username: user.name,
            },
        };

        const subscription = await razorpay.subscriptions.create(subscriptionPayload);

        return { success: true, checkoutUrl: subscription.short_url };

    } catch (error) {
        console.error("Razorpay subscription creation error:", error);
        return { success: false, error: "Could not create subscription link. Please try again later." };
    }
}