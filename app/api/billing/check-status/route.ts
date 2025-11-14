// app/api/billing/check-status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client as sanityClient } from '@/lib/sanity_client';
import jwt from 'jsonwebtoken';

interface JwtPayload {
    id: string;
}

export async function GET(req: NextRequest) {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        const userId = decodedToken.id;

        // Check the user's subscription status in Sanity
        const query = `*[_type == "subscription" && user._ref == $userId][0]{ status }`;
        const result = await sanityClient.fetch(query, { userId });

        return NextResponse.json({ status: result?.status || 'pending' });

    } catch (error) {
        return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
}