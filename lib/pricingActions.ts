"use server";

import { client } from "@/lib/sanity_client";

export async function submitPriceVote(formData: FormData) {
  const priceString = formData.get('price') as string;
  const email = formData.get('email') as string;
  const whatsappNumber = formData.get('whatsapp') as string; // NEW
  const feedback = formData.get('feedback') as string;
  
  const suggestedPrice = parseFloat(priceString);

  if (!suggestedPrice || isNaN(suggestedPrice) || suggestedPrice < 42) {
    return { success: false, error: "Please suggest a price of at least ₹42." };
  }

  try {
    const doc = {
      _type: 'priceVote',
      suggestedPrice,
      email,
      whatsappNumber, // NEW
      feedback,
      votedAt: new Date().toISOString(),
    };

    await client.create(doc);

    return { success: true };
  } catch (error) {
    console.error("Sanity price vote submission error:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}