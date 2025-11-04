// /api/auth/getSession/route.ts:
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// CHANGED: Added `exp` to the interface. This is a standard JWT claim.
interface JwtPayload {
  id: string;
  email: string;
  name: string;
  exp: number; // Expiration time (Unix timestamp in seconds)
}

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: "Session token is required" }, { status: 400 });
  }

  try {
    // Manually decode the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const session = decodedToken
      ? {
          user: {
            id: decodedToken.id,
            email: decodedToken.email,
            name: decodedToken.name,
          },
          // CHANGED: The 'expires' property now reads the *actual* expiration from the token.
          // The `exp` value is in seconds, so we multiply by 1000 to convert to milliseconds for the Date object.
          expires: new Date(decodedToken.exp * 1000).toISOString(),
        }
      : null;

    return NextResponse.json(session);
  } catch (error) {
    // This catch block will correctly trigger if the token is expired,
    // because jwt.verify() throws an error for expired tokens.
    console.error("Error verifying token (it might be expired or invalid):", error);
    return NextResponse.json({ error: "Session is invalid or expired" }, { status: 401 });
  }
};