import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
    console.log('--- [DESKTOP LOGIN REQUEST RECEIVED] ---');
    try {
        const { username, password, deviceInfo } = await req.json();
        if (!username || !password || !deviceInfo || !deviceInfo.deviceId) {
            return NextResponse.json({ error: 'Missing credentials or device info' }, { status: 400 });
        }

        const query = `*[_type == "subscription" && appUsername == $username][0]`;
        const subscription = await sanityClient.fetch(query, { username });

        if (!subscription || password !== subscription.appPassword) {
            return NextResponse.json({ error: 'Invalid app username or password' }, { status: 401 });
        }

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
            return NextResponse.json({ error: "Could not verify subscription status." }, { status: 500 });
        }

        const connectedDevices = subscription.connectedDevices || [];
        const deviceIdExists = connectedDevices.some((d: any) => d.deviceId === deviceInfo.deviceId);

        if (deviceIdExists) {
            return NextResponse.json({ message: `Welcome back, ${username}!` }, { status: 200 });
        } else {
            if (connectedDevices.length >= 2) {
                return NextResponse.json({ error: 'Maximum device limit (2) reached.' }, { status: 403 });
            } else {
                console.log('Registering new device in Sanity...');
                // --- THE CRITICAL FIX IS HERE ---
                // This patch ensures the array exists before trying to add to it.
                await sanityClient
                    .patch(subscription._id)
                    .setIfMissing({ connectedDevices: [] }) // Create the array if it doesn't exist
                    .insert('after', 'connectedDevices[-1]', [deviceInfo]) // Insert the new device at the end
                    .commit();

                console.log('SUCCESS: New device registered in Sanity.');
                return NextResponse.json({ message: `Welcome, ${username}! Device registered.` }, { status: 200 });
            }
        }
    } catch (error) {
        console.error('CRITICAL: Unhandled error during desktop login:', error);
        return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
    }
}