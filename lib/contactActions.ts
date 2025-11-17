"use server";

import { client } from "@/lib/sanity_client";

// --- HTML Email Template for the Customer ---
const html_for_customer = (name: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #111015; color: #E5E7EB; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; background-color: #1C1B1F; border: 1px solid #2D2A33; border-radius: 1rem; overflow: hidden; }
        .header { background-color: #8B5CF6; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; color: white; font-weight: 700; }
        .content { padding: 30px; line-height: 1.6; font-size: 16px; color: #D1D5DB; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #6B7280; }
        .footer a { color: #8B5CF6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Aura-Controls</h1>
        </div>
        <div class="content">
            <h2>Hello ${name},</h2>
            <p>Thank you for reaching out to us! We've received your message and are excited to connect with you.</p>
            <p>Our team is reviewing your query and will get back to you as soon as possible, typically within 24 hours.</p>
            <p>In the meantime, feel free to explore our demos and get a feel for the future of interaction.</p>
            <br>
            <p>Best regards,<br>The Aura-Controls Team</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Toil Labs. All rights reserved.</p>
            <p><a href="https://aura-controls.toil-labs.com">aura-controls.toil-labs.com</a></p>
        </div>
    </div>
</body>
</html>`;

// --- HTML Email Template for the Company ---
const html_for_company = (name: string, email: string, phone: string, service: string, query: string) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #111015; color: #E5E7EB; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: auto; background-color: #1C1B1F; border: 1px solid #2D2A33; border-radius: 1rem; overflow: hidden; }
        .header { background-color: #1F2937; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; color: #8B5CF6; font-weight: 700; }
        .content { padding: 30px; font-size: 16px; }
        .details { border-left: 3px solid #8B5CF6; padding-left: 20px; margin: 20px 0; }
        .details p { margin: 8px 0; color: #D1D5DB; }
        .details strong { color: #E5E7EB; font-weight: 600; }
        .query { background-color: #111015; padding: 15px; border-radius: 8px; margin-top: 20px; white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header"><h1>New Aura-Controls Inquiry</h1></div>
        <div class="content">
            <p>A new contact form has been submitted. Here are the details:</p>
            <div class="details">
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #8B5CF6;">${email}</a></p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Service:</strong> ${service || 'Not specified'}</p>
            </div>
            <p><strong>Message:</strong></p>
            <div class="query"><p>${query}</p></div>
        </div>
    </div>
</body>
</html>`;

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const service_name = formData.get('service_name') as string;
  const query = formData.get('query') as string;

  if (!name || !email || !query) {
    return { success: false, error: "Name, email, and message are required." };
  }

  try {
    // 1. Save to Sanity
    await client.create({
      _type: 'contact',
      name, email, phone, service_name, query,
      createdAt: new Date().toISOString(),
    });


    const apiUrl = process.env.ENV !== 'dev'
      ? 'https://aura-controls.toil-labs.com/api/send_mail_api'
      : 'http://localhost:3000/api/send_mail_api';

    // 2. Send confirmation email to the user
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: "We've Received Your Message | Aura-Controls",
        html: html_for_customer(name),
      }),
    });

    // 3. Send notification email to the company
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'contact@toil-labs.com',
        subject: `New Aura-Controls Inquiry from ${name}`,
        html: html_for_company(name, email, phone, service_name, query),
      }),
    });

    return { success: true };
  } catch (error) {
    console.error("Contact form submission error:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}