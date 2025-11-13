// /api/send_mail_api/route.ts

import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// It's good practice to keep this for security, even if the API is on the same domain
const allowedOrigins = [
  "http://localhost:3000",
  "https://aura-controls.toil-labs.com",
  "https://www.aura-controls.toil-labs.com", // Added www variant
];

// --- Main POST handler for sending emails ---
export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");

  try {
    // 1. Get the payload from the client (e.g., the Server Action)
    const { to, from, subject, text, html } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Missing required email fields' }, { status: 400 });
    }

    // 2. Securely create the transporter using environment variables on the server.
    // The client NEVER sends the password.
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_PORT === '465', // `secure` should be a boolean
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Define the mail options from the client payload
    const mailOptions = {
      from: from || `"Aura-Controls" <${process.env.SMTP_USERNAME}>`,
      to,
      subject,
      text,
      html
    };

    // 4. Send the email
    await transporter.sendMail(mailOptions);
    console.log(`Email successfully sent to ${to} with subject "${subject}"`);

    // 5. Build and return the successful response with CORS headers
    const response = NextResponse.json({ success: true, message: "Email sent successfully" });
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    // These are good to have for consistency, though not strictly needed for a simple POST from the same origin
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;

  } catch (error) {
    console.error("Error in /api/send-email:", error);
    
    // Build and return the error response with CORS headers
    const errorResponse = NextResponse.json(
      { success: false, message: "Failed to send email" },
      { status: 500 }
    );
    if (origin && allowedOrigins.includes(origin)) {
      errorResponse.headers.set("Access-Control-Allow-Origin", origin);
    }
    errorResponse.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    errorResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");
    
    return errorResponse;
  }
}

// --- OPTIONS handler for preflight requests (important for cross-origin) ---
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  const headers = new Headers();
  
  if (origin && allowedOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  
  headers.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return new NextResponse(null, { status: 204, headers });
}