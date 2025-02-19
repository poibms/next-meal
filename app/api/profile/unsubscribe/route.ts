import {NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import {stripe} from "@/lib/stripe";

export async function POST() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: clerkUser.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'No Profile Found' });
    }
    if (!profile.stripeSubscriptionId) {
      return NextResponse.json({ error: 'No Active Subscription Found' });
    }

    const subscriptionId = profile.stripeSubscriptionId;

    const canceledSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    await prisma.profile.update({
      where: {userId: clerkUser.id},
      data: {
        subscriptionTier: null,
        stripeSubscriptionId: null,
        subscriptionActive: false
      }
    })

    return NextResponse.json({ subscription: canceledSubscription });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription details." },
      { status: 500 }
    );
  }
}