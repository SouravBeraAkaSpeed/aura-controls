// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity_client';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  id: string;
  // Add other fields from your token if they exist, e.g., email, name
}

export async function GET(req: NextRequest) {
  // 1. Get the token from the Authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Not authenticated: No token provided' }, { status: 401 });
  }
  const token = authHeader.split(' ')[1];

  try {
    // 2. Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userId = decodedToken.id;

    if (!userId) {
      return NextResponse.json({ error: 'Invalid token payload' }, { status: 401 });
    }

    // 3. Fetch subscription data from Sanity using the user ID from the token
    const query = `*[_type == "subscription" && user._ref == $userId][0]{
      appUsername,
      appPassword,
      status,
      endDate,
      connectedDevices
    }`;
    const params = { userId: userId };

    const subscriptionData = await client.fetch(query, params);

    // 4. Return the appropriate response based on subscription status
    if (!subscriptionData || subscriptionData.status !== 'active') {
      return NextResponse.json({ isSubscribed: false }, { status: 200 });
    }

    return NextResponse.json({
      isSubscribed: true,
      ...subscriptionData
    }, { status: 200 });

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      // Handle expired or invalid tokens specifically
      console.error('JWT Error:', error.message);
      return NextResponse.json({ error: 'Session is invalid or expired' }, { status: 401 });
    }
    // Handle other server-side errors
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data from server.' }, { status: 500 });
  }
}