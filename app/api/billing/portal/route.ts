import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import jwt from 'jsonwebtoken';
import Razorpay from 'razorpay';

interface JwtPayload {
    id: string;
}

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const userId = decodedToken.id;

        // Fetch the user's subscription document from Sanity
        const query = `*[_type == "subscription" && user._ref == $userId][0]`;
        const subscriptionDoc = await sanityClient.fetch(query, { userId });

        if (!subscriptionDoc || !subscriptionDoc.razorpaySubscriptionId) {
            return NextResponse.json({ isSubscribed: false });
        }

        // User has a subscription record, now verify it with Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID!,
            key_secret: process.env.RAZORPAY_KEY_SECRET!,
        });

        const rzpSubscription = await razorpay.subscriptions.fetch(subscriptionDoc.razorpaySubscriptionId);

        // Fetch the plan details to get the name (monthly/yearly)
        const plan = await razorpay.plans.fetch(rzpSubscription.plan_id);

        return NextResponse.json({
            isSubscribed: true,
            planName: plan.item.name,
            status: rzpSubscription.status,
            currentCycleEnd: new Date(rzpSubscription.end_at * 1000).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            }),
            amount: `₹${(plan.item.amount as number) / 100}`
        });

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json({ error: 'Session is invalid or expired' }, { status: 401 });
        }
        console.error('Error fetching billing data:', error);
        return NextResponse.json({ error: 'Failed to fetch billing details.' }, { status: 500 });
    }
}