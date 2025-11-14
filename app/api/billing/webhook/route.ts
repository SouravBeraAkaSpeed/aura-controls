import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

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
    let rawBody;
    try {
        rawBody = await req.text();
    } catch (error) {
        console.error('CRITICAL: Failed to read request body.', error);
        return NextResponse.json({ error: 'Failed to read request body' }, { status: 500 });
    }

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
    console.log('Parsed body event:', body.event);

    // --- THE FIX IS HERE: Listen for 'invoice.paid' as well ---
    if (body.event === 'invoice.paid' || body.event === 'subscription.charged') {
        console.log(`Event '${body.event}' received. Proceeding with logic.`);
        try {
            // Extract entities. Note that 'subscription.charged' payload is slightly different.
            const invoiceEntity = body.payload.invoice?.entity;
            const subscriptionEntity = body.payload.subscription?.entity;
            const paymentEntity = body.payload.payment.entity;

            // --- Robustly get the subscription_id ---
            const razorpaySubscriptionId = invoiceEntity?.subscription_id || subscriptionEntity?.id;
            if (!razorpaySubscriptionId) {
                console.error("ABORT: Could not find subscription_id in payload.", body.payload);
                return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 });
            }

            // Fetch the full subscription object from Razorpay to get the notes
            const fullSubscription = await sanityClient.fetch(`*[_type == "subscription" && razorpaySubscriptionId == "${razorpaySubscriptionId}"][0]`);

            if (!fullSubscription) {
                console.error(`ABORT: No matching subscription found in Sanity for Razorpay ID: ${razorpaySubscriptionId}`);
                return NextResponse.json({ error: 'Subscription not found in our system' }, { status: 404 });
            }

            // Get user info
            const userRef = fullSubscription.user._ref;
            const user = await sanityClient.fetch(`*[_type == "user" && _id == "${userRef}"][0]`);

            if (!user) {
                console.error(`ABORT: User with ref ${userRef} not found.`);
                return NextResponse.json({ error: 'Associated user not found' }, { status: 404 });
            }

            const userName = user.name;
            const userEmail = paymentEntity?.email || user.email;

            // Generate Secure App Credentials
            const appPassword = Math.random().toString(36).slice(-8);
            const hashedAppPassword = await bcrypt.hash(appPassword, 10);
            const appUsername = `${userName.replace(/\s+/g, '_').toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`;

            // Update the Subscription in Sanity
            await sanityClient.patch(fullSubscription._id).set({
                status: 'active',
                appUsername: appUsername,
                appPassword: hashedAppPassword,
                // These might already be set, but it's good to confirm
                startDate: new Date(paymentEntity.created_at * 1000).toISOString(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // Example: set for 1 year
            }).commit();

            console.log(`Successfully activated subscription for user: ${userName} (${user._id})`);

            // Send Confirmation Email
            const emailApiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/send_mail_api`;
            const emailResponse = await fetch(emailApiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: userEmail,
                    subject: '🚀 Your Aura-Controls Subscription is Active!',
                    html: html_for_subscription_confirmation(userName, appUsername, appPassword),
                }),
            });

            if (emailResponse.ok) {
                console.log(`Confirmation email dispatched for ${userEmail}.`);
            } else {
                console.error(`Failed to dispatch email for ${userEmail}.`);
            }

        } catch (error) {
            console.error('CRITICAL: Error processing webhook logic:', error);
            return NextResponse.json({ status: 'error', message: 'Internal server error during processing' }, { status: 200 });
        }
    }

    return NextResponse.json({ status: 'received' }, { status: 200 });
}