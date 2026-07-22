"use server";

import { prisma } from "@/lib/prisma";

export async function joinWaitlist(formData: FormData) {
  const email = formData.get("email") as string;
  
  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: "Please enter a valid email address.",
    };
  }

  try {
    // Check if the email already exists
    const existing = await prisma.lead.findFirst({
      where: { email },
    });

    if (existing) {
      // If it exists, make sure they are somewhat recognized as interested.
      // But we will still return success if they are already in the system.
      if (existing.pipelineStage !== "waitlist") {
          await prisma.lead.update({
              where: { id: existing.id },
              data: { source: "Waitlist (Returning)", pipelineStage: "waitlist" }
          });
      }
      return { success: true };
    }

    // Create a new "Lead" but log them merely as a Waitlist entry.
    // The current Lead schema requires firstName and lastName to be provided.
    // Since we only collect emails, we will use placeholders.
    await prisma.lead.create({
      data: {
        email: email,
        firstName: "Waitlist",
        lastName: "Subscriber",
        phone: "N/A", // optional or placeholder if string is required. Actually, phone is required in schema? Let me check.
        source: "Waitlist",
        pipelineStage: "waitlist",
        confidenceScore: 100, // Very interested because they joined waitlist
        confidenceLevel: "Warm",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Waitlist Error:", error);
    return {
      success: false,
      error: "Something went wrong. Please try again later.",
    };
  }
}
