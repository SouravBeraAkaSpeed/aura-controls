// /api/auth/login/route.ts 
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity_client";
import jwt from "jsonwebtoken";
import * as argon2 from "argon2";

const allowedOrigins = [
  "http://localhost:3000",
  "https://wwww.aura-controls.toil-labs.com",
  "https://aura-controls.toil-labs.com"
];

export const OPTIONS = async () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const { email, password, isoauth } = await req.json();

    // Fetch the user from Sanity
    const query = `*[_type == "user" && email == "${email}"]`;
    const users = await client.fetch(query);

    const user = users[0]

    const passwordMatches = isoauth ? isoauth : await argon2.verify(user.password, password);

    // Check if user exists and passwords match
    if (user?._id && passwordMatches) { // Added optional chaining for safety
      const sessionToken = jwt.sign(
        { id: user._id, email: user.email, name: user.name },
        process.env.JWT_SECRET!, // Using non-null assertion is fine if you're sure it's set
        { expiresIn: "21d" } // CHANGED: from "72h" to "21d" for 3 weeks
      );

      const expiresAt = new Date();
      // CHANGED: Add 21 days to the current date instead of 72 hours
      expiresAt.setDate(expiresAt.getDate() + 21); 

      // Store the session in Sanity
      await client.create({
        _type: "session",
        userId: user._id,
        sessionToken,
        expiresAt, // This now correctly reflects a 3-week expiry
      });

      const response = NextResponse.json({
        success: true,
        token: sessionToken,
      });
      const origin = req.headers.get("origin");

      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }
      response.headers.set(
        "Access-Control-Allow-Methods",
        "POST, GET, OPTIONS"
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      return response;
    } else {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (error: any) {
    const errorMessage =
      error?.message ||
      error?.error?.message ||
      JSON.stringify(error);

    console.error("Error during sign-in:", errorMessage, error);
    return NextResponse.json({ error: "Failed to sign in" }, { status: 500 });
  }
};