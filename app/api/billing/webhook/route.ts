import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

// --- HTML Email Template for Subscription Confirmation ---
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

// --- The Webhook POST Handler ---
export async function POST(req: NextRequest) {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // 1. Verify the Webhook Signature
    try {
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.warn('Invalid webhook signature received.');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error during signature verification:', error);
        return NextResponse.json({ error: 'Signature verification failed' }, { status: 500 });
    }

    const body = JSON.parse(rawBody);

    // 2. Check for the 'subscription.charged' event
    if (body.event === 'subscription.charged') {
        try {
            const subscriptionEntity = body.payload.subscription.entity;
            const paymentEntity = body.payload.payment.entity;

            const userId = subscriptionEntity.notes?.userId;
            const userName = subscriptionEntity.notes?.username;
            const userEmail = paymentEntity?.email;

            if (!userId || !userName || !userEmail) {
                console.error('Webhook payload missing crucial user info in notes.', subscriptionEntity.notes);
                return NextResponse.json({ error: 'Missing user information in payload' }, { status: 400 });
            }

            // 3. Generate Secure App Credentials
            const appPassword = Math.random().toString(36).slice(-8);
            const hashedAppPassword = await bcrypt.hash(appPassword, 10);
            const appUsername = `${userName.replace(/\s+/g, '_').toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`;

            // 4. Update the User in Sanity
            // IMPORTANT: Use the correct schema name 'subscription' and fields as defined.
            // This assumes you have a 'subscription' document linked to a 'user' document.
            const existingSubscription = await sanityClient.fetch(`*[_type == "subscription" && user._ref == "${userId}"][0]`);

            if (existingSubscription) {
                await sanityClient.patch(existingSubscription._id).set({
                    razorpaySubscriptionId: subscriptionEntity.id,
                    status: 'active',
                    appUsername: appUsername,
                    appPassword: hashedAppPassword,
                    endDate: new Date(subscriptionEntity.end_at * 1000).toISOString(),
                    planId: subscriptionEntity.plan_id,
                }).commit();
            } else {
                // This case is for the very first payment
                await sanityClient.create({
                    _type: 'subscription',
                    user: { _type: 'reference', _ref: userId },
                    razorpaySubscriptionId: subscriptionEntity.id,
                    status: 'active',
                    appUsername: appUsername,
                    appPassword: hashedAppPassword,
                    startDate: new Date(subscriptionEntity.start_at * 1000).toISOString(),
                    endDate: new Date(subscriptionEntity.end_at * 1000).toISOString(),
                    planId: subscriptionEntity.plan_id,
                });
            }
            console.log(`Successfully activated subscription for user: ${userName} (${userId})`);

            // --- 5. THE FIX: Call your existing email API route ---
            const emailApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/send_mail_api`;

            await fetch(emailApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: '🚀 Your Aura-Controls Subscription is Active!',
                    html: html_for_subscription_confirmation(userName, appUsername, appPassword),
                }),
            });

            console.log(`Confirmation email sent to ${userEmail} via API route.`);

        } catch (error) {
            console.error('Error processing webhook:', error);
            // Still return 200 OK to prevent Razorpay from retrying a failed webhook.
            return NextResponse.json({ status: 'error', message: 'Internal server error during processing' }, { status: 200 });
        }
    }

    // Acknowledge receipt of the webhook for any other events.
    return NextResponse.json({ status: 'received' }, { status: 200 });
}