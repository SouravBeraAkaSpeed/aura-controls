import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import bcrypt from 'bcrypt';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
    try {
        const { username, password, deviceInfo } = await req.json();

        if (!username || !password || !deviceInfo || !deviceInfo.deviceId) {
            return NextResponse.json({ error: 'Missing credentials or device info' }, { status: 400 });
        }

        // 1. Find the subscription based on the appUsername
        const subscription = await sanityClient.fetch(
            `*[_type == "subscription" && appUsername == $username][0]`,
            { username }
        );

        if (!subscription) {
            return NextResponse.json({ error: 'Invalid app username or password' }, { status: 401 });
        }

        // 2. Verify the password
        const passwordMatches = await bcrypt.compare(password, subscription.appPassword);
        if (!passwordMatches) {
            return NextResponse.json({ error: 'Invalid app username or password' }, { status: 401 });
        }

        // 3. Verify the subscription status with Razorpay for real-time validation
        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret: process.env.RAZORPAY_KEY_SECRET!,
            });
            const rzpSubscription = await razorpay.subscriptions.fetch(subscription.razorpaySubscriptionId);
            if (rzpSubscription.status !== 'active') {
                return NextResponse.json({ error: `Subscription is not active. Status: ${rzpSubscription.status}` }, { status: 402 });
            }
        } catch (error) {
            console.error("Razorpay fetch error:", error);
            return NextResponse.json({ error: "Could not verify subscription status with payment provider." }, { status: 500 });
        }

        // 4. Check device limits
        const connectedDevices = subscription.connectedDevices || [];
        const deviceIdExists = connectedDevices.some((d: any) => d.deviceId === deviceInfo.deviceId);

        if (deviceIdExists) {
            // Device is already registered, login is successful
            console.log(`Existing device login successful for user: ${username}`);
            return NextResponse.json({ message: `Welcome back, ${username}!` }, { status: 200 });
        } else {
            // This is a new device
            if (connectedDevices.length >= 2) {
                // Device limit reached
                return NextResponse.json({ error: 'Maximum device limit (2) reached for this subscription.' }, { status: 403 });
            } else {
                // Add the new device to the list in Sanity
                await sanityClient
                    .patch(subscription._id)
                    .append('connectedDevices', [deviceInfo])
                    .commit();

                console.log(`New device registered successfully for user: ${username}`);
                return NextResponse.json({ message: `Welcome, ${username}! Device registered.` }, { status: 200 });
            }
        }

    } catch (error) {
        console.error('Error during desktop login:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}