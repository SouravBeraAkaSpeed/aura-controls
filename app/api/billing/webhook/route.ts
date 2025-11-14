import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import Razorpay from 'razorpay'; // Import the main Razorpay class

const html_for_subscription_confirmation = (name: string, appUsername: string, appPassword: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #E5E7EB; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; background-color: #1C1B1F; border: 1px solid #2D2A33; border-radius: 1rem; overflow: hidden; }
        .header { background: linear-gradient(90deg, #8B5CF6, #3B82F6); padding: 40px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: white; font-weight: 700; letter-spacing: 1px; }
        .content { padding: 30px; line-height: 1.7; font-size: 16px; color: #D1D5DB; }
        .credentials-box { background-color: #111015; border: 1px solid #2D2A33; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .credential-item { margin-bottom: 15px; }
        .credential-item label { font-size: 14px; color: #9CA3AF; display: block; margin-bottom: 5px; }
        .credential-item p { font-family: 'Courier New', Courier, monospace; background-color: #2D2A33; padding: 10px; border-radius: 4px; color: #F3F4F6; margin: 0; }
        .button { display: block; width: fit-content; margin: 30px auto; padding: 14px 28px; background: linear-gradient(90deg, #8B5CF6, #3B82F6); color: #ffffff; text-decoration: none; border-radius: 9999px; font-weight: 600; font-size: 16px; transition: transform 0.2s ease; }
        .button:hover { transform: scale(1.05); }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6B7280; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>Welcome to Aura-Controls!</h1></div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your subscription is now active! You've unlocked the future of human-computer interaction. Below are your unique credentials for the Aura-Controls desktop application.</p>
            <div class="credentials-box">
                <div class="credential-item">
                    <label>App Username:</label>
                    <p>${appUsername}</p>
                </div>
                <div class="credential-item">
                    <label>App Password:</label>
                    <p>${appPassword}</p>
                </div>
            </div>
            <p>Click the button below to head to your dashboard where you can download the app and view this information again.</p>
            <a href="https://aura-controls.toil-labs.com/dashboard" class="button">Go to Your Dashboard</a>
        </div>
        <div class="footer"><p>&copy; ${new Date().getFullYear()} Toil Labs. All rights reserved.</p></div>
    </div>
</body>
</html>`;

export async function POST(req: NextRequest) {
    console.log('--- [WEBHOOK RECEIVED] ---');
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    try {
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');
        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 500 });
    }

    const body = JSON.parse(rawBody);

    if (body.event === 'invoice.paid' || body.event === 'subscription.charged') {
        try {
            const paymentEntity = body.payload.payment.entity;
            const razorpaySubscriptionId = body.payload.invoice?.entity?.subscription_id || body.payload.subscription?.entity?.id;

            if (!razorpaySubscriptionId) {
                console.error("Webhook Error: Could not find subscription_id in the payload.", body.payload);
                return NextResponse.json({ error: 'Missing subscription ID in payload' }, { status: 400 });
            }

            // --- THE CRITICAL FIX IS HERE ---
            // 1. Initialize Razorpay client to fetch the full subscription object
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret: process.env.RAZORPAY_KEY_SECRET!,
            });

            // 2. Fetch the subscription from Razorpay's servers to get the 'notes'
            const fullSubscription = await razorpay.subscriptions.fetch(razorpaySubscriptionId);

            const userId = fullSubscription.notes?.userId;
            const userName = fullSubscription.notes?.username;
            const userEmail = paymentEntity?.email;

            if (!userId || !userName || !userEmail) {
                console.error('Webhook Error: Missing crucial user info in fetched subscription notes.', fullSubscription.notes);
                return NextResponse.json({ error: 'Missing user information in subscription notes' }, { status: 400 });
            }

            // 3. User info is confirmed. Now, find the user in Sanity.
            const user = await sanityClient.fetch(`*[_type == "user" && _id == "${userId}"][0]`);
            if (!user) {
                console.error(`Webhook Error: User with ID ${userId} not found in Sanity.`);
                return NextResponse.json({ error: 'User not found in our database' }, { status: 404 });
            }

            // 4. Generate App Credentials
            const appPassword = Math.random().toString(36).slice(-8);
            const appUsername = `${(userName as string).replace(/\s+/g, '_').toLowerCase()}_${Math.floor(100 + Math.random() * 90000)}`;

            // 5. Create or Update the subscription document in Sanity
            const existingSubscription = await sanityClient.fetch(`*[_type == "subscription" && user._ref == "${userId}"][0]`);

            const subscriptionData = {
                razorpaySubscriptionId: fullSubscription.id,
                status: 'active',
                appUsername: appUsername,
                appPassword: appPassword,
                startDate: new Date(fullSubscription.start_at * 1000).toISOString(),
                endDate: new Date(fullSubscription.end_at * 1000).toISOString(),
                planId: fullSubscription.plan_id,
            };

            if (existingSubscription) {
                await sanityClient.patch(existingSubscription._id).set(subscriptionData).commit();
                console.log(`Successfully patched subscription for user: ${userName} (${userId})`);
            } else {
                await sanityClient.create({
                    _type: 'subscription',
                    user: { _type: 'reference', _ref: userId },
                    ...subscriptionData
                });
                console.log(`Successfully created subscription for user: ${userName} (${userId})`);
            }

            // 6. Send Confirmation Email
            const emailApiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/send_mail_api`;
            await fetch(emailApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: '🚀 Your Aura-Controls Subscription is Active!',
                    html: html_for_subscription_confirmation(userName as string, appUsername, appPassword),
                }),
            });
            console.log(`Confirmation email dispatched for ${userEmail}.`);

        } catch (error) {
            console.error('CRITICAL: Error processing webhook logic:', error);
            return NextResponse.json({ status: 'error', message: 'Internal server error during processing' }, { status: 200 });
        }
    }

    return NextResponse.json({ status: 'received' }, { status: 200 });
}