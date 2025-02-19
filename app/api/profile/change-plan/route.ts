import {NextRequest, NextResponse} from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import {stripe} from "@/lib/stripe";
import {getPriceIdFromType} from "@/lib/plans";

export async function POST(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {newPlan} = await req.json();
    if(!newPlan) {
      return NextResponse.json({ error: "Meal Plan is required" });
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

    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const subscriptionItemId = subscription.items.data[0].id;

    if (!subscriptionItemId) {
      return NextResponse.json({ error: 'No Active Subscription Found' });
    }

    const updateSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
      items: [
        {
          id: subscriptionItemId,
          price: getPriceIdFromType(newPlan)
        }
      ],
      proration_behavior: 'create_prorations',
    })

    await prisma.profile.update({
      where: {userId: clerkUser.id},
      data: {
        subscriptionTier: newPlan,
        stripeSubscriptionId: updateSubscription.id,
        subscriptionActive: true
      }
    })

    return NextResponse.json({ subscription: updateSubscription });
  } catch (error: any) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription details." },
      { status: 500 }
    );
  }
}