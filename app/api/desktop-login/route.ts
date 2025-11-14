import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import bcrypt from 'bcrypt';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
    console.log('--- [DESKTOP LOGIN REQUEST RECEIVED] ---');
    try {
        const { username, password, deviceInfo } = await req.json();
        console.log('1. Received Payload:', { username, deviceInfo });

        if (!username || !password || !deviceInfo || !deviceInfo.deviceId) {
            console.log('ABORT: Missing credentials or device info.');
            return NextResponse.json({ error: 'Missing credentials or device info' }, { status: 400 });
        }

        // --- 1. Find the subscription document based on the appUsername ---
        console.log(`2. Querying Sanity for subscription with appUsername: ${username}`);
        const query = `*[_type == "subscription" && appUsername == $username][0]`;
        const params = { username };
        const subscription = await sanityClient.fetch(query, params);

        if (!subscription) {
            console.log(`2a. FAIL: No subscription found for username: ${username}`);
            return NextResponse.json({ error: 'Invalid app username or password' }, { status: 401 });
        }
        console.log('2b. SUCCESS: Found subscription document:', subscription._id);

        // --- 2. Verify the password ---
        console.log('3. Comparing provided password with stored hash...');
        // IMPORTANT: The password from Sanity might be undefined if it was never set
        if (!subscription.appPassword) {
            console.error(`CRITICAL FAIL: appPassword field is missing in Sanity for subscription ${subscription._id}`);
            return NextResponse.json({ error: 'Account configuration error. Please contact support.' }, { status: 500 });
        }
        const passwordMatches = await bcrypt.compare(password, subscription.appPassword);

        if (!passwordMatches) {
            console.log('3a. FAIL: Password does not match.');
            return NextResponse.json({ error: 'Invalid app username or password' }, { status: 401 });
        }
        console.log('3b. SUCCESS: Password matches.');

        // --- 3. Verify the subscription status with Razorpay ---
        console.log(`4. Verifying Razorpay subscription status for ID: ${subscription.razorpaySubscriptionId}`);
        try {
            const razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID!,
                key_secret: process.env.RAZORPAY_KEY_SECRET!,
            });
            const rzpSubscription = await razorpay.subscriptions.fetch(subscription.razorpaySubscriptionId);
            if (rzpSubscription.status !== 'active') {
                console.log(`4a. FAIL: Subscription status is '${rzpSubscription.status}', not 'active'.`);
                return NextResponse.json({ error: `Subscription is not active. Status: ${rzpSubscription.status}` }, { status: 402 });
            }
            console.log('4b. SUCCESS: Subscription is active.');
        } catch (error) {
            console.error("Razorpay fetch error:", error);
            return NextResponse.json({ error: "Could not verify subscription status with payment provider." }, { status: 500 });
        }

        // --- 4. Check device limits ---
        console.log('5. Checking device limits...');
        const connectedDevices = subscription.connectedDevices || [];
        const deviceIdExists = connectedDevices.some((d: any) => d.deviceId === deviceInfo.deviceId);
        console.log(`Current device ID: ${deviceInfo.deviceId}. Exists in list: ${deviceIdExists}. Device count: ${connectedDevices.length}`);

        if (deviceIdExists) {
            console.log('5a. SUCCESS: Existing device login successful.');
            return NextResponse.json({ message: `Welcome back, ${username}!` }, { status: 200 });
        } else {
            if (connectedDevices.length >= 2) {
                console.log('5b. FAIL: Maximum device limit (2) reached.');
                return NextResponse.json({ error: 'Maximum device limit (2) reached for this subscription.' }, { status: 403 });
            } else {
                console.log('5c. SUCCESS: New device. Registering...');
                await sanityClient
                    .patch(subscription._id)
                    .append('connectedDevices', [deviceInfo])
                    .commit();

                console.log('5d. SUCCESS: New device registered in Sanity.');
                return NextResponse.json({ message: `Welcome, ${username}! Device registered.` }, { status: 200 });
            }
        }

    } catch (error) {
        console.error('CRITICAL: Unhandled error during desktop login:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}